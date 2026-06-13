/**
 * bubbleTreeElement.test.ts — wrapper lifecycle: it must not leak BubbleTree
 * instances when reconfigured or removed.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { BubbleTreeElement } from '../../components/bubbleTreeElement.js';
import type { BubbleNode } from '../../types/bubbleNode.js';

const sampleData: BubbleNode = {
  label: 'Total',
  amount: 100,
  children: [
    { label: 'A', amount: 60 },
    { label: 'B', amount: 40 },
  ],
};

async function mount(): Promise<BubbleTreeElement> {
  const el = document.createElement('bubble-tree') as BubbleTreeElement;
  // happy-dom reports 0x0; stub the metrics BubbleTree reads.
  Object.defineProperties(el, {
    clientWidth: { value: 800, configurable: true },
    clientHeight: { value: 600, configurable: true },
  });
  el.data = structuredClone(sampleData);
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

describe('<bubble-tree> lifecycle', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    window.location.hash = '';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders an SVG canvas', async () => {
    const el = await mount();
    expect(el.shadowRoot!.querySelector('svg.bubbletree-canvas')).toBeTruthy();
  });

  it('does not stack resize listeners across rebuilds', async () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const el = await mount();

    const addsAfterMount = addSpy.mock.calls.filter(([t]) => t === 'resize').length;

    // Trigger several rebuilds via reactive property changes.
    el.autoColors = true;
    await el.updateComplete;
    el.minRadiusLabels = 30;
    await el.updateComplete;

    const removes = removeSpy.mock.calls.filter(([t]) => t === 'resize').length;
    const adds = addSpy.mock.calls.filter(([t]) => t === 'resize').length;

    // Each rebuild adds one and removes one, so net live listeners stay at 1.
    expect(adds - removes).toBe(addsAfterMount - 0);
    addSpy.mockRestore();
    removeSpy.mockRestore();
  });

  it('tears down the tree on disconnect', async () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const el = await mount();
    el.remove();
    expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    removeSpy.mockRestore();
  });
});
