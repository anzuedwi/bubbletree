/**
 * donutBubble.ts
 *
 * Extended bubble that overlays SVG arc segments on top of the base circle,
 * forming a donut chart to visualise breakdown proportions within a node.
 *
 * Breakdown slices are read from node.breakdowns[].  Each slice maps to a
 * separate <path> element; colour and opacity can be styled via BubbleStyles.
 *
 * Replaces BubbleTree.Bubbles.Donut (Raphael + jQuery).
 */
import { BaseBubble } from './baseBubble.js';
import { createSvgElement } from '../util/dom.js';
import type { BubbleNode } from '../types/bubbleNode.js';
import type { BubbleStyleEntry, BubbleStyles } from '../types/bubbleStyle.js';
import type { BubbleTree } from '../core/bubbleTree.js';
import type { Point } from '../types/point.js';

export class DonutBubble extends BaseBubble {
  private breakdown: number[] = [];
  private breakdownColors: Array<string | false> = [];
  private breakdownOpacities: number[] = [0.2, 0.7, 0.45, 0.6, 0.35];
  private breakdownArcs: SVGPathElement[] = [];

  constructor(
    node: BubbleNode,
    tree: BubbleTree,
    origin: Point,
    rad: number,
    angle: number,
    color: string,
  ) {
    super(node, tree, origin, rad, angle, color);
    this.computeBreakdown();
  }

  private computeBreakdown(): void {
    const styles = this.tree.config.bubbleStyles;
    const breakdowns = this.node.breakdowns ?? [];
    this.breakdown = [];
    this.breakdownColors = new Array(breakdowns.length).fill(false);

    for (let i = 0; i < breakdowns.length; i++) {
      const b = breakdowns[i]!;
      b.famount = this.tree.config.formatValue(b.amount);
      this.breakdown.push(b.amount / this.node.amount);

      const entry = this.lookupStyle(styles, b.name);
      if (entry?.opacity !== undefined) this.breakdownOpacities[i] = entry.opacity;
      if (entry?.color) {
        this.breakdownColors[i] = entry.color;
        this.breakdownOpacities[i] = 1;
      }
    }
  }

  private lookupStyle(
    styles: BubbleStyles | undefined,
    name?: string,
  ): BubbleStyleEntry | undefined {
    if (!styles || !name) return undefined;
    return styles.name?.[name];
  }

  show(): void {
    const r = Math.max(5, this.bubbleRad * this.tree.bubbleScale);
    this.circle = this.createCircle(r);
    this.dashedBorder = this.createDashedBorder(r * 0.85, '2 4');
    this.tree.svg.append(this.circle, this.dashedBorder);

    this.label = this.createPrimaryLabel();
    this.label2 = this.createSecondaryLabel();
    this.tree.container.append(this.label, this.label2);

    if ((this.node.children?.length ?? 0) > 1) {
      this.circle.style.cursor = 'pointer';
      this.label.style.cursor = 'pointer';
    }

    if (this.breakdown.length > 1) {
      this.breakdownArcs = this.breakdown.map((_, i) => {
        const arc = createSvgElement('path');
        arc.classList.add('bubbletree-arc');
        arc.setAttribute('fill', (this.breakdownColors[i] || '#fff') as string);
        arc.setAttribute('stroke', '#fff');
        this.tree.svg.append(arc);
        arc.addEventListener('click', () => {
          this.tree.onNodeClick(this.node);
          this.tree.navigateTo(this.node);
        });
        return arc;
      });
    }

    this.attachInteractions([this.circle, this.label]);
    this.visible = true;
  }

  hide(): void {
    this.circle?.remove();
    this.dashedBorder?.remove();
    this.label?.remove();
    this.label2?.remove();
    for (const arc of this.breakdownArcs) arc.remove();
    this.breakdownArcs = [];
    this.circle = this.dashedBorder = null;
    this.label = this.label2 = null;
    this.visible = false;
  }

  draw(): void {
    if (!this.visible) return;
    this.computePosition();
    const r = Math.max(5, this.bubbleRad * this.tree.bubbleScale);

    this.setOrHide(this.circle, {
      cx: String(this.pos.x),
      cy: String(this.pos.y),
      r: String(r),
      'fill-opacity': String(this.alpha),
    });

    if ((this.node.children?.length ?? 0) > 1) {
      this.setOrHide(this.dashedBorder, {
        cx: String(this.pos.x),
        cy: String(this.pos.y),
        r: String(r * 0.85),
        'stroke-opacity': String(this.alpha * 0.8),
      });
    } else {
      this.setOrHide(this.dashedBorder, { 'stroke-opacity': '0' });
    }

    if (this.breakdown.length > 1) {
      const ir = r * 0.85;
      let oa = -Math.PI * 0.5;
      for (let i = 0; i < this.breakdown.length; i++) {
        const da = this.breakdown[i]! * Math.PI * 2;
        const x0 = this.pos.x + Math.cos(oa) * ir;
        const y0 = this.pos.y + Math.sin(oa) * ir;
        const x1 = this.pos.x + Math.cos(oa + da) * ir;
        const y1 = this.pos.y + Math.sin(oa + da) * ir;
        const x2 = this.pos.x + Math.cos(oa + da) * r;
        const y2 = this.pos.y + Math.sin(oa + da) * r;
        const x3 = this.pos.x + Math.cos(oa) * r;
        const y3 = this.pos.y + Math.sin(oa) * r;
        oa += da;
        const sweepLarge = da > Math.PI ? '1' : '0';
        const path = `M${x0} ${y0} A${ir},${ir} 0 ${sweepLarge},1 ${x1},${y1} L${x2} ${y2} A${r},${r} 0 ${sweepLarge},0 ${x3} ${y3} Z`;

        const arc = this.breakdownArcs[i];
        if (!arc) continue;
        arc.setAttribute('d', path);
        arc.setAttribute('stroke-opacity', String(this.alpha * 0.2));
        arc.setAttribute('fill-opacity', String(this.breakdownOpacities[i]! * this.alpha));
      }
    }

    if (this.label && this.label2) {
      const showLabel = r > 20;
      const desc = this.label.querySelector<HTMLElement>('.bubbletree-desc');
      this.label.hidden = !showLabel;
      this.label2.hidden = showLabel && r >= 40;
      if (desc) desc.hidden = showLabel && r < 40;
    }

    this.positionPrimaryLabel(r * 0.9);
    this.positionSecondaryLabel(r);
  }
}
