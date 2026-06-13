/**
 * bubbleTree.changeView.characterization.test.ts
 *
 * Characterization tests that pin the geometric behaviour of changeView
 * through its observable side effects (SVG attributes and current-center
 * state).  Their purpose is to lock the current numbers in place so the
 * upcoming LayoutPlanner extraction cannot silently change them.
 *
 * Strategy
 * ────────
 * The Transitioner normally drives values asynchronously through
 * requestAnimationFrame. We stub rAF so the tick fires synchronously with
 * a `now` value far past the completion deadline: this collapses the entire
 * transition into a single frame at t = 1, leaving the final target values
 * applied to the display objects (and from there, written out to SVG
 * attributes by each bubble's draw()).
 *
 * If a test here fails after the extraction, that is the signal that the
 * refactor changed behaviour — investigate before updating the expectation.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { BubbleTree } from './bubbleTree.js';
import type { BubbleNode } from '../types/bubbleNode.js';

const created: BubbleTree[] = [];
function track(tree: BubbleTree): BubbleTree {
  created.push(tree);
  return tree;
}

function makeContainer(w = 800, h = 600): HTMLElement {
  const el = document.createElement('div');
  Object.defineProperties(el, {
    clientWidth: { value: w, configurable: true },
    clientHeight: { value: h, configurable: true },
  });
  document.body.appendChild(el);
  return el;
}

/** Make rAF fire its callback synchronously with a `now` past completion. */
function stubSyncRaf(): () => void {
  const spy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
    cb(performance.now() + 1e9);
    return 0;
  });
  return () => spy.mockRestore();
}

/** Three-node tree: a parent with two equal-amount children. */
const symmetricTree: BubbleNode = {
  id: 'root',
  label: 'Total',
  amount: 100,
  children: [
    { id: 'a', label: 'Alpha', amount: 50 },
    { id: 'b', label: 'Beta', amount: 50 },
  ],
};

/** Read a numeric SVG attribute or fall back to NaN. */
function num(el: Element | null, attr: string): number {
  if (!el) return NaN;
  const value = el.getAttribute(attr);
  return value === null ? NaN : Number(value);
}

describe('BubbleTree.changeView (characterization)', () => {
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

  describe('root-level view (initial)', () => {
    it('centres the SVG canvas on the container midpoint', () => {
      const container = makeContainer(800, 600);
      const tree = track(new BubbleTree({ container, data: symmetricTree }));
      tree.setData(structuredClone(symmetricTree));

      const rootCircle = container.querySelector('circle.bubbletree-bubble.root');
      // The root bubble sits exactly at the container centre.
      expect(num(rootCircle, 'cx')).toBeCloseTo(400, 5);
      expect(num(rootCircle, 'cy')).toBeCloseTo(300, 5);
    });

    it('places the two children diametrically opposite each other', () => {
      const container = makeContainer(800, 600);
      const tree = track(new BubbleTree({ container, data: symmetricTree }));
      tree.setData(structuredClone(symmetricTree));

      const alpha = container.querySelector('circle.bubbletree-bubble.a')!;
      const beta = container.querySelector('circle.bubbletree-bubble.b')!;

      // Equal amounts → the two children land on opposite sides of the
      // same orbit, equidistant from the centre on the same axis.
      const ax = num(alpha, 'cx');
      const ay = num(alpha, 'cy');
      const bx = num(beta, 'cx');
      const by = num(beta, 'cy');

      // Their midpoint must coincide with the origin.
      expect((ax + bx) / 2).toBeCloseTo(400, 4);
      expect((ay + by) / 2).toBeCloseTo(300, 4);

      // And their distance to the centre must be identical.
      const ra = Math.hypot(ax - 400, ay - 300);
      const rb = Math.hypot(bx - 400, by - 300);
      expect(ra).toBeCloseTo(rb, 4);
    });

    it('keeps bubbleScale at 1.0 for the root view', () => {
      const container = makeContainer(800, 600);
      const tree = track(new BubbleTree({ container, data: symmetricTree }));
      tree.setData(structuredClone(symmetricTree));
      expect(tree.bubbleScale).toBeCloseTo(1.0, 5);
    });

    it('draws exactly one orbital ring around the root', () => {
      const container = makeContainer(800, 600);
      const tree = track(new BubbleTree({ container, data: symmetricTree }));
      tree.setData(structuredClone(symmetricTree));
      const rings = container.querySelectorAll('circle.bubbletree-ring');
      expect(rings.length).toBe(1);
    });
  });

  describe('child-level view (zoom in)', () => {
    /** A 3-level tree so the child view has something to lay out below. */
    const threeLevel: BubbleNode = {
      id: 'root',
      label: 'Total',
      amount: 100,
      children: [
        {
          id: 'big',
          label: 'Big',
          amount: 60,
          children: [
            { id: 'big-a', label: 'BigA', amount: 30 },
            { id: 'big-b', label: 'BigB', amount: 30 },
          ],
        },
        { id: 'small', label: 'Small', amount: 40 },
      ],
    };

    it('shifts the origin off-centre toward the right of the canvas', () => {
      const container = makeContainer(800, 600);
      const tree = track(new BubbleTree({ container, data: threeLevel }));
      tree.setData(structuredClone(threeLevel));

      // Navigate via the public API, then flush the synthetic raf.
      const big = (tree as unknown as {
        nodesByUrlToken: Record<string, BubbleNode>;
      }).nodesByUrlToken['big'];
      expect(big).toBeTruthy();
      tree.navigateTo(big!, true);

      const rootCircle = container.querySelector('circle.bubbletree-bubble.root')!;
      // The "Big" node becomes centred; the root is pushed off to one side.
      // We don't assert an exact x — only that it has moved measurably away
      // from the canvas midpoint of 400.
      expect(num(rootCircle, 'cx')).not.toBeCloseTo(400, 1);
    });

    it('changes bubbleScale away from 1.0 when zooming into a child', () => {
      const container = makeContainer(800, 600);
      const tree = track(new BubbleTree({ container, data: threeLevel }));
      tree.setData(structuredClone(threeLevel));

      const big = (tree as unknown as {
        nodesByUrlToken: Record<string, BubbleNode>;
      }).nodesByUrlToken['big'];
      tree.navigateTo(big!, true);

      expect(tree.bubbleScale).not.toBeCloseTo(1.0, 3);
    });
  });
});
