/**
 * bubbleNode.ts
 *
 * The raw data node passed in by the caller, plus runtime metadata
 * attached during tree traversal (level, parent, urlToken, etc.).
 * Children are optional at the leaves; the traversal adds an empty
 * array when absent.
 */
import type { Breakdown } from './breakdown.js';

export interface BubbleNode {
  id?: string;
  name?: string;
  label?: string;
  shortLabel?: string;
  amount: number;
  famount?: string;
  /**
   * Bubble fill colour. Use `undefined` (or omit) to inherit from the
   * parent or auto-assigned palette; do not use `false` to clear it —
   * the library handles colour clearing through `BubbleConfig.clearColors`.
   */
  color?: string;
  icon?: string;
  token?: string;
  taxonomy?: string;
  level?: number;
  parent?: BubbleNode;
  left?: BubbleNode;
  right?: BubbleNode;
  children?: BubbleNode[];
  breakdowns?: Breakdown[];
  breakdownsByName?: Record<string, Breakdown>;
  centerAngle?: number;
  maxChildAmount?: number;
  urlToken?: string;
}
