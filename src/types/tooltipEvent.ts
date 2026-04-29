/**
 * tooltipEvent.ts
 *
 * Payload passed to the caller's tooltip callback on every hover/unhover.
 * The caller is responsible for positioning and populating a tooltip DOM
 * element; BubbleTree only fires the event.
 */
import type { BubbleNode } from './bubbleNode.js';
import type { Point } from './point.js';
import type { TooltipEventType } from '../enums/tooltipEventType.js';

export interface TooltipEvent {
  type: TooltipEventType;
  node: BubbleNode;
  target: unknown;
  bubblePos: Point;
  mousePos: Point;
  origEvent?: Event;
}

export type TooltipCallback = (event: TooltipEvent) => void;
