/**
 * index.ts
 *
 * Public entry point for the BubbleTree library.
 *
 * Usage:
 *   import { BubbleTree, BubbleType } from 'bubbletree';
 *   import 'bubbletree/style.css';
 *
 *   new BubbleTree({ container: '#chart', data: myTree });
 */

// Core
export { BubbleTree } from './core/bubbleTree.js';
export { Loader } from './core/loader.js';

// Bubble variants
export { PlainBubble } from './bubbles/plainBubble.js';
export { DonutBubble } from './bubbles/donutBubble.js';
export { IconBubble } from './bubbles/iconBubble.js';

// Enums
export { BubbleType } from './enums/bubbleType.js';
export { SortBy } from './enums/sortBy.js';
export { TooltipEventType } from './enums/tooltipEventType.js';
export { DisplayKind } from './enums/displayKind.js';

// Types
export type { BubbleConfig, ResolvedBubbleConfig } from './types/bubbleConfig.js';
export type { BubbleNode } from './types/bubbleNode.js';
export type { BubbleStyles, BubbleStyleEntry } from './types/bubbleStyle.js';
export type { Breakdown } from './types/breakdown.js';
export type { TooltipEvent, TooltipCallback } from './types/tooltipEvent.js';
export {
  ViewChangeEvent,
  VIEW_CHANGE_EVENT,
  type ViewChangeEventDetail,
} from './types/viewChangeEvent.js';
export type { DisplayObject } from './types/displayObject.js';
export type { Point } from './types/point.js';

// CSS bundle (picked up by Vite, emitted as bubbletree.css)
import './styles/bubbletree.css';
