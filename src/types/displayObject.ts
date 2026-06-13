/**
 * displayObject.ts
 *
 * Common interface for every renderable object managed by BubbleTree
 * (bubbles and rings). The Transitioner tweens the numeric properties
 * (rad, angle, alpha) and calls draw() on each frame.
 */
import type { BubbleNode } from './bubbleNode.js';
import type { Point } from './point.js';
import type { DisplayKind } from '../enums/displayKind.js';

export interface DisplayObject {
  readonly kind: DisplayKind;
  node: BubbleNode;
  origin: Point;
  pos: Point;
  rad: number;
  angle: number;
  alpha: number;
  visible: boolean;
  hideFlag: boolean;
  bubbleRad?: number;
  childRotation?: number;
  show(): void;
  hide(): void;
  draw(): void;
}
