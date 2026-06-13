/**
 * bubbleTree.updateData.test.ts — in-place data updates.
 *
 * Covers the three update modes:
 *  - amount-only (every node matches, just radii change)
 *  - addition    (a new node appears and gets a fresh bubble)
 *  - removal     (a gone node has its bubble hidden and dropped)
 *
 * Bubble identity is the central invariant: a matched node keeps the same
 * SVG <circle> across the update so consumers can observe smooth
 * transitions rather than a flicker of "old removed, new added".
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { BubbleTree } from './bubbleTree.js';
import type { BubbleNode } from '../types/bubbleNode.js';

const created: BubbleTree[] = [];
function track(tree: BubbleTree): BubbleTree {
  created.push(tree);
  return tree;
}

function makeContainer(): HTMLElement {
  const el = document.createElement('div');
  Object.defineProperties(el, {
    clientWidth: { value: 800, configurable: true },
    clientHeight: { value: 600, configurable: true },
  });
  document.body.appendChild(el);
  return el;
}

function stubSyncRaf(): () => void {
  const spy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
    cb(performance.now() + 1e9);
    return 0;
  });
  return () => spy.mockRestore();
}

const initial: BubbleNode = {
  id: 'root',
  label: 'Total',
  amount: 100,
  children: [
    { id: 'a', label: 'Alpha', amount: 60 },
    { id: 'b', label: 'Beta', amount: 40 },
  ],
};

describe('BubbleTree.updateData', () => {
  let restoreRaf: () => void;

  beforeEach(() => {
    document.body.innerHTML = '';
    window.location.hash = '';
    restoreRaf = stubSyncRaf();
  });

  afterEach(() => {
    while (created.length) created.pop()!.destroy();
    restoreRaf();
  });

  it('falls back to setData when called before initial setData', () => {
    const container = makeContainer();
    const tree = track(new BubbleTree({ container, data: initial }));
    // Bypass setData; call updateData straight away.
    tree.updateData(initial);
    expect(tree.getRoot()?.label).toBe('Total');
  });

  it('preserves bubble identity when only amounts change', () => {
    const container = makeContainer();
    const tree = track(new BubbleTree({ container, data: initial }));
    tree.setData(initial);

    // Capture the live <circle> for the root before the update.
    const rootCircleBefore = container.querySelector('circle.bubbletree-bubble.root');
    expect(rootCircleBefore).toBeTruthy();

    const updated: BubbleNode = {
      id: 'root',
      label: 'Total',
      amount: 200, // doubled
      children: [
        { id: 'a', label: 'Alpha', amount: 120 },
        { id: 'b', label: 'Beta', amount: 80 },
      ],
    };
    tree.updateData(updated);

    const rootCircleAfter = container.querySelector('circle.bubbletree-bubble.root');
    // Same DOM node = same bubble, just animated.
    expect(rootCircleAfter).toBe(rootCircleBefore);
    // And the tree's view of the centred node now carries the new amount.
    expect(tree.getCurrentNode()?.amount).toBe(200);
  });

  it('adds a fresh bubble for a brand-new node', () => {
    const container = makeContainer();
    const tree = track(new BubbleTree({ container, data: initial }));
    tree.setData(initial);

    const updated: BubbleNode = {
      id: 'root',
      label: 'Total',
      amount: 130,
      children: [
        { id: 'a', label: 'Alpha', amount: 60 },
        { id: 'b', label: 'Beta', amount: 40 },
        { id: 'c', label: 'Gamma', amount: 30 }, // new
      ],
    };
    tree.updateData(updated);

    const gammaCircle = container.querySelector('circle.bubbletree-bubble.c');
    expect(gammaCircle).toBeTruthy();
    expect(tree.getRoot()?.children?.find((n) => n.id === 'c')).toBeTruthy();
  });

  it('removes the bubble for a node that disappeared', () => {
    const container = makeContainer();
    const tree = track(new BubbleTree({ container, data: initial }));
    tree.setData(initial);

    expect(container.querySelector('circle.bubbletree-bubble.b')).toBeTruthy();

    const updated: BubbleNode = {
      id: 'root',
      label: 'Total',
      amount: 60,
      children: [{ id: 'a', label: 'Alpha', amount: 60 }],
    };
    tree.updateData(updated);

    expect(container.querySelector('circle.bubbletree-bubble.b')).toBeNull();
    expect(tree.getRoot()?.children?.find((n) => n.id === 'b')).toBeUndefined();
  });

  it('does not mutate the caller-supplied data on updateData', () => {
    const container = makeContainer();
    const tree = track(new BubbleTree({ container, data: initial }));
    tree.setData(initial);

    const updated: BubbleNode = {
      id: 'root',
      label: 'Total',
      amount: 200,
      children: [{ id: 'a', label: 'Alpha', amount: 200 }],
    };
    const snapshot = JSON.stringify(updated);
    tree.updateData(updated);
    expect(JSON.stringify(updated)).toBe(snapshot);
  });

  it('falls back to the new root when the centred node disappears', () => {
    const container = makeContainer();
    const tree = track(new BubbleTree({ container, data: initial }));
    tree.setData(initial);

    // Force the centred node away from root by navigating to a child first.
    // (Alpha is a child but childView re-centres on root because alpha is a
    // leaf, so the centred node stays as root anyway. For the purposes of
    // this test, we observe that removing root's id leaves the tree pointed
    // at *some* node from the new root.)
    const replacement: BubbleNode = {
      id: 'new-root',
      label: 'Replaced',
      amount: 50,
      children: [{ id: 'x', label: 'X', amount: 50 }],
    };
    tree.updateData(replacement);
    expect(tree.getCurrentNode()?.label).toBe('Replaced');
  });
});
