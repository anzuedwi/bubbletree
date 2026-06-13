/**
 * bubbleTree.ts
 *
 * Main orchestrator class. Owns the SVG canvas, the data tree, all display
 * objects (bubbles + rings), layout computation, and URL-based navigation.
 *
 * Replaces the original jQuery + RaphaelJS implementation with:
 *  - Native SVG element creation
 *  - Web-native rAF animation via Transitioner
 *  - Native History API via HistoryManager
 *  - D3-color for HSL colour helpers
 */

import { createSvgElement, resolveContainer } from '../util/dom.js';
import { cssToken } from '../util/css.js';
import { formatNumber } from '../util/format.js';
import { hslColor, adjustLightness, adjustSaturation } from '../util/color.js';
import { amountToRadius, setRadiusBase } from './utils.js';
import { Vector } from './vector.js';
import { Ring } from './ring.js';
import { Transitioner } from './transitioner.js';
import { HistoryManager } from './historyManager.js';
import { LayoutPlanner, type LayoutPlannerContext } from './layoutPlanner.js';
import { PlainBubble } from '../bubbles/plainBubble.js';
import { DonutBubble } from '../bubbles/donutBubble.js';
import { IconBubble } from '../bubbles/iconBubble.js';
import { BubbleType } from '../enums/bubbleType.js';
import { SortBy } from '../enums/sortBy.js';
import { DisplayKind } from '../enums/displayKind.js';
import type { BubbleConfig, ResolvedBubbleConfig } from '../types/bubbleConfig.js';
import type { BubbleNode } from '../types/bubbleNode.js';
import type { BubbleStyleEntry } from '../types/bubbleStyle.js';
import type { DisplayObject } from '../types/displayObject.js';
import type { TooltipEvent } from '../types/tooltipEvent.js';
import type { BaseBubble } from '../bubbles/baseBubble.js';

/** Union of concrete bubble constructors so we can instantiate by level. */
type BubbleClass = typeof PlainBubble | typeof DonutBubble | typeof IconBubble;

export class BubbleTree {
  /** Resolved configuration with all defaults filled in. */
  readonly config: ResolvedBubbleConfig;

  /** Container HTMLElement that hosts both the SVG and overlay labels. */
  readonly container: HTMLElement;

  /** The SVG element used for all circle / path rendering. */
  readonly svg: SVGSVGElement;

  /** Current uniform scale applied to all bubble radii. */
  bubbleScale = 1;

  /** Every display object (bubbles + rings) ever created for this tree. */
  private displayObjects: DisplayObject[] = [];

  /** Fast lookup: urlToken → node. */
  private nodesByUrlToken: Record<string, BubbleNode> = {};

  /** Root of the data tree after preprocessing. */
  private treeRoot!: BubbleNode;

  /** Centre point of the SVG (updated on resize). */
  private origin: Vector;

  /** The node currently centred in the view. */
  private currentCenter: BubbleNode | undefined;

  /** The running transition, if any. */
  private currentTransition: Transitioner | undefined;

  /** Ordered bubble classes for level 0, 1, 2 … */
  private bubbleClasses: BubbleClass[] = [];

  /** History / URL manager. */
  private history = new HistoryManager();

  /** Stateless layout maths, called from changeView. */
  private planner = new LayoutPlanner();

  /** Global counter used to generate unique urlTokens. */
  private globalNodeCounter = 0;

  /** Base URL prefix extracted from the first hash seen (e.g. /en). */
  private baseUrl = '';

  /** Most-recently received hash, used to detect stale navigations. */
  private freshUrl = '';

  /** Stable reference to the resize handler so it can be removed on destroy. */
  private readonly boundResize = this.onResize.bind(this);

  /** Guards against using the instance after destroy(). */
  private destroyed = false;

  constructor(config: BubbleConfig) {
    this.config = this.resolveConfig(config);
    this.container = resolveContainer(config.container);
    this.container.classList.add('bubbletree');

    this.svg = createSvgElement('svg');
    this.svg.classList.add('bubbletree-canvas');
    this.container.prepend(this.svg);

    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.svg.setAttribute('width', String(w));
    this.svg.setAttribute('height', String(h));

    this.origin = new Vector(w * 0.5, h * 0.5);

    window.addEventListener('resize', this.boundResize);
  }

  /**
   * Release every external resource this instance owns: the window resize
   * listener, the hashchange listener (via HistoryManager), and any running
   * transition. Safe to call more than once. After destroy() the instance
   * must not be reused.
   */
  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    window.removeEventListener('resize', this.boundResize);
    this.history.destroy();
    this.currentTransition?.stop();
    this.currentTransition = undefined;
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /** Load and display a data tree. Called by Loader or directly. */
  setData(data: BubbleNode): void {
    this.initData(data);
    this.resizePaper();
    this.initBubbles();
    this.initHistory();
  }

  /** Navigate to the node identified by urlToken. */
  navigateTo(node: BubbleNode, fromUrlChange = false): void {
    if (fromUrlChange) {
      this.changeView(node.urlToken ?? '');
    } else {
      this.history.load(this.urlForNode(node));
    }
    // Highlight matching overlay labels
    this.container.querySelectorAll('.bubbletree-label.current, .bubbletree-label2.current')
      .forEach((el) => el.classList.remove('current'));
    // Use the same token transform as the label elements so the selector and
    // the tagged class always agree (and never produce an invalid selector).
    const token = cssToken(node.id);
    if (token) {
      this.container.querySelectorAll(`.bubbletree-label.${token}, .bubbletree-label2.${token}`)
        .forEach((el) => el.classList.add('current'));
    }
  }

  /** Called by bubbles when the user clicks a node. */
  onNodeClick(node: BubbleNode): void {
    this.config.nodeClickCallback?.(node);
  }

  /** Forward tooltip events to the configured callback. */
  tooltip(event: TooltipEvent): void {
    const cb = this.config.tooltip ?? this.config.tooltipCallback;
    cb?.(event);
  }

  // ---------------------------------------------------------------------------
  // Data initialisation
  // ---------------------------------------------------------------------------

  private initData(root: BubbleNode): void {
    root.level = 0;
    this.preprocessData(root);
    this.traverse(root, 0);
    this.treeRoot = root;
  }

  /**
   * If maxNodesPerLevel is set, collapse excess children into a synthetic
   * "More" node so the ring stays readable.
   *
   * Strategy: sort by amount descending, keep the top N, and pack everything
   * else into a synthetic node whose amount equals the sum of its children's
   * amounts. The synthetic node is also clickable and will reveal its
   * contents when zoomed into.
   */
  private preprocessData(root: BubbleNode): void {
    const max = this.config.maxNodesPerLevel;
    if (!max || !root.children || root.children.length <= max) return;

    // sortChildren ascending → reverse gives descending by amount
    const sorted = this.sortChildren([...root.children]);
    sorted.reverse();

    const keep: BubbleNode[] = [];
    const move: BubbleNode[] = [];
    let moveAmount = 0;

    sorted.forEach((child, i) => {
      if (i < max) { keep.push(child); }
      else {
        move.push(child);
        // Negative amounts are clamped to 0 so the "More" total doesn't
        // shrink the bubble below visibility.
        moveAmount += Math.max(0, child.amount);
      }
    });

    root.children = [
      ...keep,
      { label: 'More', name: 'more', amount: moveAmount, children: move },
    ];
  }

  /**
   * Depth-first traversal that enriches every node with metadata:
   * level, colour, urlToken, left/right siblings, sorted children.
   */
  private traverse(node: BubbleNode, index: number): void {
    if (!node.children) node.children = [];

    node.famount = this.config.formatValue(node.amount);

    if (node.parent) node.level = (node.parent.level ?? 0) + 1;

    // Apply colour clearing
    if (this.config.clearColors) node.color = undefined;

    // Apply styles from config
    this.applyBubbleStyles(node, index);

    // Assign colour if none set
    if (!node.color) {
      node.color = this.pickColor(node, index);
    }

    // Desaturate leaf nodes slightly
    if ((node.children.length < 2) && node.color) {
      node.color = adjustSaturation(node.color, 0.86);
    }

    // Wire up left / right siblings for orbital navigation
    const level = node.level ?? 0;
    if (level > 0 && node.parent?.children) {
      const siblings = node.parent.children;
      if (siblings.length > 1) {
        node.left = siblings[(index - 1 + siblings.length) % siblings.length];
        node.right = siblings[(index + 1) % siblings.length];
        if (node.right === node.left) node.right = undefined;
      }
    }

    // Generate urlToken (slug derived from label or counter)
    const src = node.label || node.token || String(this.globalNodeCounter);
    this.globalNodeCounter++;
    let token = (typeof src === 'number')
      ? String(src)
      : src.toLowerCase().replace(/\W/g, '-');
    while (this.nodesByUrlToken[token]) token += '-';
    node.urlToken = token;
    this.nodesByUrlToken[token] = node;

    // Sort children and recurse
    node.maxChildAmount = 0;
    node.children = this.sortChildren(node.children, true, this.config.sortBy);
    node.children.forEach((child, c) => {
      child.parent = node;
      node.maxChildAmount = Math.max(node.maxChildAmount ?? 0, child.amount);
      this.traverse(child, c);
    });

    // Pre-process breakdowns for donut charts
    if (node.breakdowns) {
      node.breakdownsByName = {};
      node.breakdowns.forEach((bd) => {
        bd.famount = this.config.formatValue(bd.amount);
        if (bd.name) node.breakdownsByName![bd.name] = bd;
      });
    }
  }

  private applyBubbleStyles(node: BubbleNode, index: number): void {
    const styles = this.config.bubbleStyles;
    if (!styles) return;

    // Resolve the most specific matching style entry, in priority order:
    // by id, then by name, then by taxonomy + name.
    const byId = node.id ? styles.id?.[node.id] : undefined;
    const byName = node.name ? styles.name?.[node.name] : undefined;
    const byTaxonomy = this.lookupTaxonomyStyle(node);

    // Apply from least to most specific so higher-priority entries win.
    this.applyStyleEntry(node, byTaxonomy);
    this.applyStyleEntry(node, byName);
    this.applyStyleEntry(node, byId);

    // The dynamic getStyle() callback overrides everything else.
    if (typeof styles.getStyle === 'function') {
      this.applyStyleEntry(node, styles.getStyle(node, index));
    }
  }

  /** Look up a style entry by the node's taxonomy bucket and name. */
  private lookupTaxonomyStyle(node: BubbleNode): BubbleStyleEntry | undefined {
    const styles = this.config.bubbleStyles;
    if (!styles || !node.taxonomy || !node.name) return undefined;
    const bucket = styles[node.taxonomy];
    // The taxonomy bucket is a Record<string, BubbleStyleEntry>; the index
    // signature also admits the getStyle function, so guard against that.
    if (!bucket || typeof bucket === 'function') return undefined;
    return bucket[node.name];
  }

  /**
   * Copy the three styleable properties from an entry onto a node.
   * Type-safe: each property is assigned through its real declared type,
   * so no `Record<string, unknown>` casts are needed.
   */
  private applyStyleEntry(node: BubbleNode, entry: BubbleStyleEntry | undefined): void {
    if (!entry) return;
    if (entry.color !== undefined) node.color = entry.color;
    if (entry.shortLabel !== undefined) node.shortLabel = entry.shortLabel;
    if (entry.icon !== undefined) node.icon = entry.icon;
  }

  private pickColor(node: BubbleNode, index: number): string {
    const level = node.level ?? 0;
    if (this.config.autoColors) {
      if (level === 0) return hslColor(45, 0.9, 0.5);
      if (level === 1) {
        const count = node.parent?.children?.length ?? 1;
        return hslColor((index / count) * 360, 0.7, 0.5);
      }
      // Vary lightness from parent colour
      const parentColor = node.parent?.color ?? '#999';
      return adjustLightness(parentColor, 0.5 + Math.random() * 0.5);
    }
    // Inherit parent colour or fall back to neutral grey
    if (level > 0 && node.parent?.color) return node.parent.color;
    return '#999999';
  }

  // ---------------------------------------------------------------------------
  // Geometry + bubbles
  // ---------------------------------------------------------------------------

  private resizePaper(): void {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    const rt = this.treeRoot;
    const maxRad = Math.min(w, h) * 0.5 - 40;

    this.svg.setAttribute('width', String(w));
    this.svg.setAttribute('height', String(h));
    this.origin.x = w * 0.5;
    this.origin.y = h * 0.5;

    const base = Math.pow(
      (Math.pow(rt.amount, 0.6) + Math.pow(rt.maxChildAmount ?? 0, 0.6) * 2) / maxRad,
      1.6666666667,
    );
    setRadiusBase(base);

    // Refresh cached bubbleRad for every existing bubble
    for (const obj of this.displayObjects) {
      if (obj.kind === DisplayKind.Bubble && obj.bubbleRad !== undefined) {
        obj.bubbleRad = amountToRadius(obj.node.amount);
      }
    }
  }

  private onResize(): void {
    // Ignore resize events that arrive after teardown or before data has
    // been loaded (the resize listener is registered in the constructor,
    // but treeRoot is not populated until setData()).
    if (this.destroyed || !this.treeRoot) return;
    this.resizePaper();
    if (this.currentCenter) this.changeView(this.currentCenter.urlToken ?? '');
  }

  private initBubbles(): void {
    const config = this.config;

    // Build the ordered list of bubble constructors, one per level (or repeated)
    this.bubbleClasses = config.bubbleType.map((t) => this.classForType(t));

    const rootBubble = this.createBubble(this.treeRoot, this.origin, 0, 0);
    this.traverseBubbles(rootBubble as BaseBubble);
  }

  private classForType(type: BubbleType): BubbleClass {
    switch (type) {
      case BubbleType.Donut: return DonutBubble;
      case BubbleType.Icon:  return IconBubble;
      default:               return PlainBubble;
    }
  }

  private traverseBubbles(parentBubble: BaseBubble): void {
    const children = parentBubble.node.children ?? [];
    if (children.length === 0) return;

    // Create the ring that visually separates parent from its children
    this.createRing(parentBubble.node, parentBubble.pos);

    const totalChildRadius = children.reduce((sum, c) => sum + amountToRadius(c.amount), 0);
    const twopi = Math.PI * 2;
    let oa = 0;

    children.forEach((child, i) => {
      const da = (amountToRadius(child.amount) / totalChildRadius) * twopi;
      const ca = oa + da * 0.5;
      child.centerAngle = ca;
      const childBubble = this.createBubble(child, parentBubble.pos, 0, ca);
      oa += da;
      this.traverseBubbles(childBubble as BaseBubble);
    });
  }

  private createBubble(
    node: BubbleNode,
    origin: Vector,
    rad: number,
    angle: number,
  ): DisplayObject {
    let classIndex = Math.min(node.level ?? 0, this.bubbleClasses.length - 1);
    if (isNaN(classIndex)) classIndex = 0;
    const BubbleClass = this.bubbleClasses[classIndex]!;
    const bubble = new BubbleClass(node, this, origin, rad, angle, node.color ?? '#999');
    this.displayObjects.push(bubble);
    return bubble;
  }

  private createRing(node: BubbleNode, origin: Vector): Ring {
    const ring = new Ring(node, this.svg, origin, 0, {
      stroke: '#888',
      strokeDasharray: '4 4',
    });
    this.displayObjects.push(ring);
    return ring;
  }

  // ---------------------------------------------------------------------------
  // View / layout
  // ---------------------------------------------------------------------------

  /**
   * Look up the node by token, ask the LayoutPlanner for a target Layout,
   * then hand that Layout to a Transitioner. Splits cleanly into three
   * phases: planning (pure maths in LayoutPlanner), supersession (transition
   * lifecycle), and bookkeeping (currentCenter + first-node callback).
   */
  private changeView(token: string): void {
    const requestedNode = this.nodesByUrlToken[token];
    if (!requestedNode) return;

    const { layout, centeredNode } = this.planner.plan(requestedNode, this.plannerContext());

    const duration = this.currentCenter === centeredNode ? 0 : 1000;
    const tr = new Transitioner(duration);

    // If a transition is still running, supersede it: move its pending
    // completion callbacks onto the new one (so queued navigations still
    // fire) and stop it so two transitions never animate the same objects.
    const previous = this.currentTransition;
    if (previous?.running) {
      previous.transferCallbacksTo(tr);
      previous.stop();
    }

    this.currentTransition = tr;
    tr.changeLayout(layout);

    if (!this.currentCenter) this.config.firstNodeCallback?.(centeredNode);
    this.currentCenter = centeredNode;
  }

  /** Build the context bag the LayoutPlanner needs. */
  private plannerContext(): LayoutPlannerContext {
    return {
      width: this.container.clientWidth,
      height: this.container.clientHeight,
      origin: this.origin,
      root: this.treeRoot,
      displayObjects: this.displayObjects,
      scaleTarget: this,
      getBubble: (n, keepHidden) =>
        this.getDisplayObject(DisplayKind.Bubble, n, keepHidden) as BaseBubble | undefined,
      getRing: (n) =>
        this.getDisplayObject(DisplayKind.Ring, n) as Ring | undefined,
    };
  }

  // ---------------------------------------------------------------------------
  // Display-object lookup
  // ---------------------------------------------------------------------------

  private getDisplayObject(
    kind: DisplayKind,
    node: BubbleNode,
    keepHidden?: boolean,
  ): DisplayObject | undefined {
    for (const obj of this.displayObjects) {
      if (obj.kind !== kind) continue;
      if (obj.node === node) {
        if (!keepHidden) obj.hideFlag = false;
        return obj;
      }
    }
    return undefined;
  }

  // ---------------------------------------------------------------------------
  // Sorting
  // ---------------------------------------------------------------------------

  /**
   * Sort children for ring placement.
   *
   * When `alternate` is true (the default for amount sorting) the result is
   * interleaved: largest, smallest, 2nd largest, 2nd smallest, etc. This
   * prevents the ring from clustering all the big bubbles on one side and
   * all the tiny ones on the other.
   *
   * When sorting by label we keep a simple alphabetical order — alternating
   * would scramble the names.
   */
  private sortChildren(
    children: BubbleNode[],
    alternate = false,
    sortBy?: SortBy,
  ): BubbleNode[] {
    const compareFn = sortBy === SortBy.Label
      ? (a: BubbleNode, b: BubbleNode) => (a.label ?? '') > (b.label ?? '') ? 1 : -1
      : (a: BubbleNode, b: BubbleNode) => a.amount - b.amount;

    const sorted = [...children].sort(compareFn);
    if (!alternate) return sorted;

    // Two-pointer interleave: take from the top, then from the bottom,
    // alternating until we meet in the middle.
    const result: BubbleNode[] = [];
    let lo = 0, hi = sorted.length - 1, useHi = true;
    while (lo <= hi) {
      result.push(useHi ? sorted[hi--]! : sorted[lo++]!);
      useHi = !useHi;
    }
    return result;
  }

  // ---------------------------------------------------------------------------
  // History / URL
  // ---------------------------------------------------------------------------

  private initHistory(): void {
    this.history.init(this.urlChanged.bind(this));
  }

  private urlChanged(hash: string): void {
    if (!this.freshUrl && hash.includes('/~/')) {
      this.baseUrl = hash.substring(0, hash.indexOf('/~/'));
    }
    this.freshUrl = hash;

    if (this.currentTransition?.running) {
      this.currentTransition.onComplete(this.changeUrl.bind(this));
    } else {
      this.changeUrl();
    }
  }

  private changeUrl(): void {
    const parts = this.freshUrl.split('/');
    const token = parts[parts.length - 1] ?? '';

    if (!this.freshUrl) {
      this.navigateTo(this.treeRoot);
      return;
    }

    if (this.nodesByUrlToken[token]) {
      const canonicalUrl = this.urlForNode(this.nodesByUrlToken[token]!);
      if (this.freshUrl !== canonicalUrl) {
        this.history.load(canonicalUrl);
      } else {
        this.navigateTo(this.nodesByUrlToken[token]!, true);
      }
    } else {
      this.navigateTo(this.treeRoot);
    }
  }

  private urlForNode(node: BubbleNode): string {
    const parts: string[] = [];
    let n: BubbleNode | undefined = node;
    while (n) {
      parts.unshift(n.urlToken ?? '');
      n = n.parent;
    }
    return `${this.baseUrl}/~/${parts.join('/')}`;
  }

  // ---------------------------------------------------------------------------
  // Config defaults
  // ---------------------------------------------------------------------------

  private resolveConfig(config: BubbleConfig): ResolvedBubbleConfig {
    const bubbleType = Array.isArray(config.bubbleType)
      ? config.bubbleType
      : [config.bubbleType ?? BubbleType.Plain];

    return {
      ...config,
      formatValue: config.formatValue ?? formatNumber,
      clearColors: config.clearColors ?? false,
      autoColors: config.autoColors ?? false,
      rootPath: config.rootPath ?? '',
      minRadiusLabels: config.minRadiusLabels ?? 40,
      minRadiusAmounts: config.minRadiusAmounts ?? 20,
      minRadiusHideLabels: config.minRadiusHideLabels ?? 0,
      cutLabelsAt: config.cutLabelsAt ?? 50,
      bubbleType,
    };
  }
}
