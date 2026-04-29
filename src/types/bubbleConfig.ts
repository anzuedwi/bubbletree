/**
 * bubbleConfig.ts
 *
 * BubbleConfig — the object consumers pass to new BubbleTree(config).
 * ResolvedBubbleConfig is the internal form after defaults are applied;
 * it is not part of the public API.
 */
import type { BubbleNode } from './bubbleNode.js';
import type { BubbleStyles } from './bubbleStyle.js';
import type { TooltipCallback } from './tooltipEvent.js';
import type { BubbleType } from '../enums/bubbleType.js';
import type { SortBy } from '../enums/sortBy.js';

export interface BubbleConfig {
  data: BubbleNode | string;
  container: string | Element;
  bubbleType?: BubbleType | BubbleType[];
  bubbleStyles?: BubbleStyles;
  formatValue?: (n: number) => string;
  clearColors?: boolean;
  autoColors?: boolean;
  rootPath?: string;
  minRadiusLabels?: number;
  minRadiusAmounts?: number;
  minRadiusHideLabels?: number;
  cutLabelsAt?: number;
  maxNodesPerLevel?: number;
  sortBy?: SortBy;
  initYear?: number;
  tooltip?: TooltipCallback;
  tooltipCallback?: TooltipCallback;
  initTooltip?: (node: BubbleNode, element: Element) => void;
  nodeClickCallback?: (node: BubbleNode) => void;
  firstNodeCallback?: (node: BubbleNode) => void;
}

export interface ResolvedBubbleConfig extends BubbleConfig {
  formatValue: (n: number) => string;
  clearColors: boolean;
  autoColors: boolean;
  rootPath: string;
  minRadiusLabels: number;
  minRadiusAmounts: number;
  minRadiusHideLabels: number;
  cutLabelsAt: number;
  bubbleType: BubbleType[];
}
