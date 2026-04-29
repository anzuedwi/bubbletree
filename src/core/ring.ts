/**
 * ring.ts
 *
 * A dashed circular ring rendered as an SVG <circle> around a parent
 * bubble's children.  The ring's radius is animated by the Transitioner
 * to expand when zooming in and collapse when zooming out.
 *
 * Replaces Raphael's paper.circle() with a plain SVGCircleElement.
 */
import { createSvgElement } from '../util/dom.js';
import { DisplayKind } from '../enums/displayKind.js';
import type { BubbleNode } from '../types/bubbleNode.js';
import type { DisplayObject } from '../types/displayObject.js';
import type { Point } from '../types/point.js';

export interface RingAttributes {
  stroke?: string;
  strokeDasharray?: string;
}

export class Ring implements DisplayObject {
  readonly kind = DisplayKind.Ring;
  alpha = 1;
  visible = false;
  hideFlag = false;
  pos: Point;
  angle = 0;

  private circle: SVGCircleElement | null = null;

  constructor(
    public node: BubbleNode,
    private readonly svg: SVGSVGElement,
    public origin: Point,
    public rad: number,
    private readonly attributes: RingAttributes,
  ) {
    this.pos = origin;
  }

  show(): void {
    const circle = createSvgElement('circle');
    circle.classList.add('bubbletree-ring');
    if (this.attributes.stroke) circle.setAttribute('stroke', this.attributes.stroke);
    if (this.attributes.strokeDasharray) {
      circle.setAttribute('stroke-dasharray', this.attributes.strokeDasharray);
    }
    circle.setAttribute('fill', 'none');
    this.svg.insertBefore(circle, this.svg.firstChild);
    this.circle = circle;
    this.visible = true;
    this.draw();
  }

  hide(): void {
    this.circle?.remove();
    this.circle = null;
    this.visible = false;
  }

  draw(): void {
    if (!this.visible || !this.circle) return;
    this.circle.setAttribute('cx', String(this.origin.x));
    this.circle.setAttribute('cy', String(this.origin.y));
    this.circle.setAttribute('r', String(Math.max(0, this.rad)));
    this.circle.setAttribute('stroke-opacity', String(this.alpha));
  }
}
