/**
 * bubbleStyle.ts
 *
 * Declarative style map supplied via BubbleConfig.bubbleStyles.
 * Styles can be keyed by node.id, node.name, or node.taxonomy, or
 * derived dynamically through the getStyle() callback.
 */
import type { BubbleNode } from './bubbleNode.js';

export interface BubbleStyleEntry {
  color?: string;
  shortLabel?: string;
  icon?: string;
  opacity?: number;
}

export interface BubbleStyles {
  id?: Record<string, BubbleStyleEntry>;
  name?: Record<string, BubbleStyleEntry>;
  getStyle?: (node: BubbleNode, index: number) => BubbleStyleEntry;
  [taxonomy: string]:
    | Record<string, BubbleStyleEntry>
    | ((node: BubbleNode, index: number) => BubbleStyleEntry)
    | undefined;
}
