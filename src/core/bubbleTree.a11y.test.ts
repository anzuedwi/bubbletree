/**
 * bubbleTree.a11y.test.ts — ARIA attributes on the SVG canvas and on every
 * bubble circle.
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

const sampleData: BubbleNode = {
  id: 'root',
  label: 'Total',
  amount: 100,
  children: [
    { id: 'a', label: 'Alpha', amount: 60 },
    { id: 'b', label: 'Beta', amount: 40 },
  ],
};

/** Synchronous rAF so the transition completes inside the test. */
function stubSyncRaf(): () => void {
  const spy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
    cb(performance.now() + 1e9);
    return 0;
  });
  return () => spy.mockRestore();
}

describe('ARIA semantics', () => {
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

  it('tags the SVG canvas with role="tree" and an accessible name', () => {
    const container = makeContainer();
    track(new BubbleTree({ container, data: sampleData }));
    const svg = container.querySelector('svg.bubbletree-canvas')!;
    expect(svg.getAttribute('role')).toBe('tree');
    expect(svg.getAttribute('aria-label')).toBeTruthy();
  });

  it('tags every bubble circle as role="treeitem"', () => {
    const container = makeContainer();
    const tree = track(new BubbleTree({ container, data: sampleData }));
    tree.setData(sampleData);

    const circles = container.querySelectorAll('circle.bubbletree-bubble');
    expect(circles.length).toBeGreaterThan(0);
    for (const c of circles) {
      expect(c.getAttribute('role')).toBe('treeitem');
      expect(c.getAttribute('tabindex')).toBe('-1');
      expect(c.getAttribute('aria-level')).toBeTruthy();
    }
  });

  it('sets aria-level matching node depth (1-indexed)', () => {
    const container = makeContainer();
    const tree = track(new BubbleTree({ container, data: sampleData }));
    tree.setData(sampleData);

    const rootCircle = container.querySelector('circle.bubbletree-bubble.root')!;
    const childCircle = container.querySelector('circle.bubbletree-bubble.a')!;
    expect(rootCircle.getAttribute('aria-level')).toBe('1');
    expect(childCircle.getAttribute('aria-level')).toBe('2');
  });

  it('uses an aria-label combining node label and amount', () => {
    const container = makeContainer();
    const tree = track(new BubbleTree({ container, data: sampleData }));
    tree.setData(sampleData);
    const rootCircle = container.querySelector('circle.bubbletree-bubble.root')!;
    const label = rootCircle.getAttribute('aria-label')!;
    expect(label).toContain('Total');
    // formatNumber turns 100 into '100' (below the k threshold)
    expect(label).toContain('100');
  });

  it('marks the centred parent with aria-expanded="true"', () => {
    const container = makeContainer();
    const tree = track(new BubbleTree({ container, data: sampleData }));
    tree.setData(sampleData);
    const rootCircle = container.querySelector('circle.bubbletree-bubble.root')!;
    expect(rootCircle.getAttribute('aria-expanded')).toBe('true');
  });

  it('omits aria-expanded on leaf bubbles', () => {
    const container = makeContainer();
    const tree = track(new BubbleTree({ container, data: sampleData }));
    tree.setData(sampleData);
    const leaf = container.querySelector('circle.bubbletree-bubble.a')!;
    expect(leaf.hasAttribute('aria-expanded')).toBe(false);
  });
});
