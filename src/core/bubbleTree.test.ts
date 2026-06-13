/**
 * bubbleTree.test.ts — construction, teardown, and listener hygiene.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { BubbleTree } from './bubbleTree.js';
import type { BubbleNode } from '../types/bubbleNode.js';

/** Track every instance so afterEach can tear them down (no leaked listeners). */
const created: BubbleTree[] = [];
function track(tree: BubbleTree): BubbleTree {
  created.push(tree);
  return tree;
}

function makeContainer(): HTMLElement {
  const el = document.createElement('div');
  // happy-dom reports 0x0 without explicit sizing; stub the metrics the
  // layout maths reads so construction produces a sane paper size.
  Object.defineProperties(el, {
    clientWidth: { value: 800, configurable: true },
    clientHeight: { value: 600, configurable: true },
  });
  document.body.appendChild(el);
  return el;
}

const sampleData: BubbleNode = {
  label: 'Total',
  amount: 100,
  children: [
    { label: 'A', amount: 60 },
    { label: 'B', amount: 40 },
  ],
};

describe('BubbleTree', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    window.location.hash = '';
  });

  afterEach(() => {
    while (created.length) created.pop()!.destroy();
  });

  it('creates an SVG canvas inside the container', () => {
    const container = makeContainer();
    track(new BubbleTree({ container, data: sampleData }));
    expect(container.querySelector('svg.bubbletree-canvas')).toBeTruthy();
  });

  it('ignores resize events fired before setData (no treeRoot yet)', () => {
    const container = makeContainer();
    track(new BubbleTree({ container, data: sampleData }));
    // No setData() call: a resize must be a no-op rather than throwing.
    expect(() => window.dispatchEvent(new Event('resize'))).not.toThrow();
  });

  it('removes the resize listener on destroy', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const container = makeContainer();
    const tree = new BubbleTree({ container, data: sampleData });
    tree.destroy();
    expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    removeSpy.mockRestore();
  });

  it('is idempotent: destroy() can be called twice safely', () => {
    const container = makeContainer();
    const tree = new BubbleTree({ container, data: sampleData });
    tree.destroy();
    expect(() => tree.destroy()).not.toThrow();
  });

  it('stops responding to resize after destroy', () => {
    const container = makeContainer();
    const tree = new BubbleTree({ container, data: sampleData });
    tree.setData(sampleData);
    tree.destroy();
    // Dispatching resize must not throw now that listeners are gone.
    expect(() => window.dispatchEvent(new Event('resize'))).not.toThrow();
  });
});
