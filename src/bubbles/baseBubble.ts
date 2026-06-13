/**
 * baseBubble.ts
 *
 * Abstract base class shared by PlainBubble, DonutBubble, and IconBubble.
 *
 * Responsibilities:
 *  - Polar → Cartesian coordinate conversion (computePosition)
 *  - SVG circle and dashed-border factory methods
 *  - HTML label (inner + outer) factory methods
 *  - CSS-custom-property label positioning (--bt-label-x/y/width/opacity)
 *    replaces jQuery .css() inline-style mutations
 *  - MouseEventGroup wiring for click, hover, unhover
 *  - Tooltip event forwarding to BubbleTree
 *
 * Subclasses implement show(), hide(), and draw().
 */
import { Vector } from '../core/vector.js';
import { MouseEventGroup } from '../core/mouseEventGroup.js';
import { amountToRadius } from '../core/utils.js';
import { createSvgElement, createDiv } from '../util/dom.js';
import { cssToken } from '../util/css.js';
import { DisplayKind } from '../enums/displayKind.js';
import { TooltipEventType } from '../enums/tooltipEventType.js';
import type { BubbleTree } from '../core/bubbleTree.js';
import type { BubbleNode } from '../types/bubbleNode.js';
import type { DisplayObject } from '../types/displayObject.js';
import type { Point } from '../types/point.js';

export abstract class BaseBubble implements DisplayObject {
  readonly kind = DisplayKind.Bubble;
  alpha = 1;
  visible = false;
  hideFlag = false;
  initialized = false;
  childRotation = 0;
  pos: Vector = new Vector(0, 0);
  bubbleRad: number;

  protected circle: SVGCircleElement | null = null;
  protected dashedBorder: SVGCircleElement | null = null;
  protected label: HTMLDivElement | null = null;
  protected label2: HTMLDivElement | null = null;
  protected mouseGroup: MouseEventGroup | null = null;

  constructor(
    public node: BubbleNode,
    public readonly tree: BubbleTree,
    public origin: Point,
    public rad: number,
    public angle: number,
    public color: string,
  ) {
    this.bubbleRad = amountToRadius(node.amount);
    this.computePosition();
    this.prepareLabel();
    this.initialized = true;
  }

  protected computePosition(): void {
    this.pos.x = this.origin.x + Math.cos(this.angle) * this.rad;
    this.pos.y = this.origin.y - Math.sin(this.angle) * this.rad;
  }

  protected prepareLabel(): void {
    const cutAt = this.tree.config.cutLabelsAt;
    if (!this.node.shortLabel && this.node.label) {
      this.node.shortLabel =
        this.node.label.length > cutAt + 3
          ? `${this.node.label.substring(0, cutAt)}...`
          : this.node.label;
    }
  }

  protected createCircle(radius: number): SVGCircleElement {
    const circle = createSvgElement('circle');
    circle.classList.add('bubbletree-bubble');
    circle.setAttribute('cx', String(this.pos.x));
    circle.setAttribute('cy', String(this.pos.y));
    circle.setAttribute('r', String(radius));
    circle.setAttribute('fill', this.color);
    const token = cssToken(this.node.id);
    if (token) circle.classList.add(token);
    return circle;
  }

  protected createDashedBorder(radius: number, dasharray: string): SVGCircleElement {
    const circle = createSvgElement('circle');
    circle.classList.add('bubbletree-dashed');
    circle.setAttribute('cx', String(this.pos.x));
    circle.setAttribute('cy', String(this.pos.y));
    circle.setAttribute('r', String(radius));
    circle.setAttribute('fill', 'none');
    circle.setAttribute('stroke', '#fff');
    circle.setAttribute('stroke-dasharray', dasharray);
    return circle;
  }

  protected createPrimaryLabel(): HTMLDivElement {
    const label = createDiv(['bubbletree-label', cssToken(this.node.id)].filter(Boolean).join(' '));
    const amount = createDiv('bubbletree-amount');
    amount.textContent = this.tree.config.formatValue(this.node.amount);
    const desc = createDiv('bubbletree-desc');
    desc.textContent = this.node.shortLabel ?? '';
    label.append(amount, desc);
    return label;
  }

  protected createSecondaryLabel(): HTMLDivElement {
    const label = createDiv(['bubbletree-label2', cssToken(this.node.id)].filter(Boolean).join(' '));
    const span = document.createElement('span');
    span.textContent = this.node.shortLabel ?? '';
    label.append(span);
    return label;
  }

  protected attachInteractions(elements: Element[]): void {
    const group = new MouseEventGroup(this, elements);
    group.click(() => {
      this.tree.onNodeClick(this.node);
      this.tree.navigateTo(this.node);
    });
    group.hover(({ origEvent }) =>
      this.tree.tooltip({
        type: TooltipEventType.Show,
        node: this.node,
        target: this,
        bubblePos: { x: this.pos.x, y: this.pos.y },
        mousePos: this.localMousePos(origEvent),
        origEvent,
      }),
    );
    group.unhover(({ origEvent }) =>
      this.tree.tooltip({
        type: TooltipEventType.Hide,
        node: this.node,
        target: this,
        bubblePos: { x: this.pos.x, y: this.pos.y },
        mousePos: this.localMousePos(origEvent),
        origEvent,
      }),
    );
    this.mouseGroup = group;
  }

  protected localMousePos(event: MouseEvent): Point {
    const rect = this.tree.container.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  protected setOrHide(circle: SVGCircleElement | null, attrs: Record<string, string>): void {
    if (!circle) return;
    for (const [k, v] of Object.entries(attrs)) circle.setAttribute(k, v);
  }

  protected positionPrimaryLabel(radius: number): void {
    if (!this.label) return;
    const labelHeight = this.label.offsetHeight;
    this.label.style.setProperty('--bt-label-width', `${2 * radius}px`);
    this.label.style.setProperty('--bt-label-x', `${this.pos.x - radius}px`);
    this.label.style.setProperty('--bt-label-y', `${this.pos.y - labelHeight * 0.5}px`);
    this.label.style.setProperty('--bt-label-opacity', String(this.alpha));
  }

  protected positionSecondaryLabel(radius: number): void {
    if (!this.label2) return;
    const w = Math.max(70, 3 * radius);
    this.label2.style.setProperty('--bt-label-width', `${w}px`);
    this.label2.style.setProperty('--bt-label-x', `${this.pos.x - w * 0.5}px`);
    this.label2.style.setProperty('--bt-label-y', `${this.pos.y + radius}px`);
    this.label2.style.setProperty('--bt-label-opacity', String(this.alpha));
  }

  abstract show(): void;
  abstract hide(): void;
  abstract draw(): void;
}
