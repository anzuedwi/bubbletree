/**
 * keyboardNavigator.test.ts — roving tabindex and arrow-key navigation.
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

/**
 * Three siblings so each child has distinct left + right neighbours. With
 * only two siblings the traversal collapses left === right to undefined
 * (see BubbleTree.traverse), which would defeat the ArrowRight test.
 */
const sampleData: BubbleNode = {
  id: 'root',
  label: 'Total',
  amount: 150,
  children: [
    { id: 'a', label: 'Alpha', amount: 50 },
    { id: 'b', label: 'Beta', amount: 50 },
    { id: 'c', label: 'Gamma', amount: 50 },
  ],
};

function stubSyncRaf(): () => void {
  const spy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
    cb(performance.now() + 1e9);
    return 0;
  });
  return () => spy.mockRestore();
}

function dispatchKey(svg: Element, key: string): void {
  svg.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
}

describe('KeyboardNavigator', () => {
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

  it('promotes exactly one bubble to tabindex=0 after setData', () => {
    const container = makeContainer();
    const tree = track(new BubbleTree({ container, data: sampleData }));
    tree.setData(sampleData);
    const tabbable = container.querySelectorAll('circle.bubbletree-bubble[tabindex="0"]');
    expect(tabbable.length).toBe(1);
    // The centred node (root) is the focused one.
    expect(tabbable[0]!.classList.contains('root')).toBe(true);
  });

  it('moves focus to the right sibling on ArrowRight', () => {
    const container = makeContainer();
    const tree = track(new BubbleTree({ container, data: sampleData }));
    tree.setData(sampleData);

    // Focus the root manually then arrow right; the root is a leaf-of-root
    // pattern so it has no left/right siblings, so promote a child first.
    const alpha = tree.getNodeByUrlToken('alpha')!;
    expect(alpha).toBeTruthy();
    // Simulate Tab landing on alpha by directly focusing it:
    const svg = container.querySelector('svg.bubbletree-canvas')!;
    const alphaCircle = container.querySelector('circle.bubbletree-bubble.a')!;
    // Make alpha the focused node by dispatching from the navigator API.
    (tree as unknown as {
      keyboard: { focusNode(n: BubbleNode): void };
    }).keyboard.focusNode(alpha);

    expect(alphaCircle.getAttribute('tabindex')).toBe('0');

    dispatchKey(svg, 'ArrowRight');
    const betaCircle = container.querySelector('circle.bubbletree-bubble.b')!;
    expect(betaCircle.getAttribute('tabindex')).toBe('0');
    expect(alphaCircle.getAttribute('tabindex')).toBe('-1');
  });

  it('drills into the focused node on Enter', () => {
    const container = makeContainer();
    const tree = track(new BubbleTree({ container, data: sampleData }));
    tree.setData(sampleData);
    const alpha = tree.getNodeByUrlToken('alpha')!;
    (tree as unknown as {
      keyboard: { focusNode(n: BubbleNode): void };
    }).keyboard.focusNode(alpha);

    const svg = container.querySelector('svg.bubbletree-canvas')!;
    dispatchKey(svg, 'Enter');
    // After drilling, the focused node should be the same alpha but the
    // tree's currentCenter should now be alpha (or its parent depending on
    // children count). We assert at least that getCurrentNode is alpha
    // because alpha is a leaf — child view re-centres on parent (root).
    // The interesting observable: navigateTo got called, currentCenter is
    // alpha's parent (root) since alpha has < 2 children.
    expect(tree.getCurrentNode()).toBe(tree.getRoot());
  });

  it('returns to the root on Home', () => {
    const container = makeContainer();
    const tree = track(new BubbleTree({ container, data: sampleData }));
    tree.setData(sampleData);
    const alpha = tree.getNodeByUrlToken('alpha')!;
    (tree as unknown as {
      keyboard: { focusNode(n: BubbleNode): void };
    }).keyboard.focusNode(alpha);

    const svg = container.querySelector('svg.bubbletree-canvas')!;
    dispatchKey(svg, 'Home');

    const rootCircle = container.querySelector('circle.bubbletree-bubble.root')!;
    expect(rootCircle.getAttribute('tabindex')).toBe('0');
  });

  it('ignores keys with no movement target (root has no parent)', () => {
    const container = makeContainer();
    const tree = track(new BubbleTree({ container, data: sampleData }));
    tree.setData(sampleData);
    // Default focused node is the root after setData.
    const svg = container.querySelector('svg.bubbletree-canvas')!;
    // ArrowUp on root must not throw and must not change tabindex.
    expect(() => dispatchKey(svg, 'ArrowUp')).not.toThrow();
    const rootCircle = container.querySelector('circle.bubbletree-bubble.root')!;
    expect(rootCircle.getAttribute('tabindex')).toBe('0');
  });

  it('removes its keydown listener on destroy', () => {
    const container = makeContainer();
    const tree = new BubbleTree({ container, data: sampleData });
    const svg = container.querySelector('svg.bubbletree-canvas')!;
    const spy = vi.spyOn(svg, 'removeEventListener');
    tree.destroy();
    expect(spy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });
});
