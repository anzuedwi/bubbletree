/**
 * viewChangeEvent.ts
 *
 * Custom event dispatched by BubbleTree whenever the centred node changes.
 *
 * Why a CustomEvent class instead of a plain detail object?
 *  - Event listeners get standardised access to `target`, `timeStamp`, and
 *    `defaultPrevented` for free.
 *  - The Lit wrapper can re-dispatch the same event on the host element
 *    without remapping fields.
 *  - It composes with the DOM event ecosystem (e.g. Storybook's actions
 *    addon, devtools' event timeline).
 */

import type { BubbleNode } from './bubbleNode.js';

export interface ViewChangeEventDetail {
  /** The node now centred in the view. */
  node: BubbleNode;
  /** The previously centred node, or null on the first view change. */
  previous: BubbleNode | null;
}

/**
 * Event name used both when adding listeners on a BubbleTree instance and
 * when listening on a `<bubble-tree>` element.
 */
export const VIEW_CHANGE_EVENT = 'viewchange';

export class ViewChangeEvent extends CustomEvent<ViewChangeEventDetail> {
  constructor(detail: ViewChangeEventDetail) {
    super(VIEW_CHANGE_EVENT, { detail, bubbles: true });
  }
}
