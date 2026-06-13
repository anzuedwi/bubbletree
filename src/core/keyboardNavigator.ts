/**
 * keyboardNavigator.ts
 *
 * Implements the WAI-ARIA tree keyboard interaction pattern over the
 * existing bubble graph.
 *
 * Roving-tabindex model
 * ─────────────────────
 * Exactly one bubble at a time carries `tabindex="0"`; every other bubble
 * has `tabindex="-1"`. The user Tabs into the tree once, then arrow keys
 * move focus around without leaving the tree.
 *
 *   ArrowRight  → orbital next sibling   (uses node.right)
 *   ArrowLeft   → orbital previous       (uses node.left)
 *   ArrowDown / Enter / Space
 *               → drill into the focused node (centre it)
 *   ArrowUp     → return to parent       (centre the parent)
 *   Home        → return to the root
 *
 * Movement triggers the same code path as a mouse click: the navigator
 * calls `tree.navigateTo(node)`, so the URL and currentCenter stay in sync.
 */

import type { BubbleTree } from './bubbleTree.js';
import type { BubbleNode } from '../types/bubbleNode.js';

export class KeyboardNavigator {
  /** The node that currently owns tabindex=0. */
  private focusedNode: BubbleNode | null = null;

  private readonly boundKeyDown = (e: Event) => this.handleKey(e as KeyboardEvent);

  constructor(private readonly tree: BubbleTree) {
    tree.svg.addEventListener('keydown', this.boundKeyDown);
  }

  /** Release the keydown listener. Called from BubbleTree.destroy(). */
  destroy(): void {
    this.tree.svg.removeEventListener('keydown', this.boundKeyDown);
  }

  /**
   * Make a node the keyboard-focused one: update tabindex on every bubble
   * circle (roving tabindex) and call .focus() on the chosen one.
   */
  focusNode(node: BubbleNode): void {
    this.focusedNode = node;
    for (const bubble of this.tree.getBubbles()) {
      const circle = bubble.getCircle();
      if (!circle) continue;
      const isFocused = bubble.node === node;
      circle.setAttribute('tabindex', isFocused ? '0' : '-1');
      if (isFocused) circle.focus({ preventScroll: true });
    }
  }

  /**
   * Sync the navigator's idea of the focused node to the centred view.
   * Called from BubbleTree on every viewchange so arrow-key starting
   * point follows mouse / URL navigation too.
   */
  syncTo(node: BubbleNode): void {
    this.focusedNode = node;
    for (const bubble of this.tree.getBubbles()) {
      const circle = bubble.getCircle();
      if (!circle) continue;
      circle.setAttribute('tabindex', bubble.node === node ? '0' : '-1');
    }
  }

  // ---------------------------------------------------------------------------
  // Key handling
  // ---------------------------------------------------------------------------

  private handleKey(event: KeyboardEvent): void {
    const current = this.focusedNode;
    if (!current) return;

    switch (event.key) {
      case 'ArrowRight':
        this.moveTo(current.right, event);
        break;
      case 'ArrowLeft':
        this.moveTo(current.left, event);
        break;
      case 'ArrowDown':
      case 'Enter':
      case ' ': // Space
        this.drillInto(current, event);
        break;
      case 'ArrowUp':
        this.moveTo(current.parent, event);
        break;
      case 'Home':
        this.moveTo(this.tree.getRoot(), event);
        break;
      default:
        return; // do not preventDefault on uninteresting keys
    }
  }

  /** Common branch: target may be undefined (e.g. root has no parent). */
  private moveTo(target: BubbleNode | undefined, event: KeyboardEvent): void {
    if (!target) return;
    event.preventDefault();
    this.focusNode(target);
    this.tree.navigateTo(target);
  }

  /**
   * Drilling in is a moveTo plus a navigateTo with explicit click semantics
   * (so caller-supplied nodeClickCallback fires too).
   */
  private drillInto(node: BubbleNode, event: KeyboardEvent): void {
    event.preventDefault();
    this.tree.onNodeClick(node);
    this.tree.navigateTo(node);
    this.focusNode(node);
  }
}
