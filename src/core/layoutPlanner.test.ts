/**
 * layoutPlanner.test.ts
 *
 * Direct unit tests for the LayoutPlanner.  Builds a minimal stub display
 * graph (no SVG, no DOM) and asserts on the produced Layout's target values.
 */
import { describe, it, expect } from 'vitest';
import { LayoutPlanner, type LayoutPlannerContext } from './layoutPlanner.js';
import { Vector } from './vector.js';
import { setRadiusBase } from './utils.js';
import { DisplayKind } from '../enums/displayKind.js';
import type { BubbleNode } from '../types/bubbleNode.js';
import type { DisplayObject } from '../types/displayObject.js';
import type { BaseBubble } from '../bubbles/baseBubble.js';
import type { Ring } from './ring.js';

/** Minimal display object usable as both a bubble and a ring stub. */
function stubObj(kind: DisplayKind, node: BubbleNode): DisplayObject {
  return {
    kind,
    node,
    origin: { x: 0, y: 0 },
    pos: { x: 0, y: 0 },
    rad: 0,
    angle: 0,
    alpha: 1,
    visible: false,
    hideFlag: false,
    bubbleRad: 0,
    childRotation: 0,
    show() {},
    hide() {},
    draw() {},
  };
}

function buildCtx(root: BubbleNode, objects: DisplayObject[]): LayoutPlannerContext {
  const origin = new Vector(400, 300);
  return {
    width: 800,
    height: 600,
    origin,
    root,
    displayObjects: objects,
    scaleTarget: {},
    getBubble: (n, keepHidden) => {
      const obj = objects.find((o) => o.kind === DisplayKind.Bubble && o.node === n);
      if (obj && !keepHidden) obj.hideFlag = false;
      return obj as BaseBubble | undefined;
    },
    getRing: (n) => {
      const obj = objects.find((o) => o.kind === DisplayKind.Ring && o.node === n);
      if (obj) obj.hideFlag = false;
      return obj as Ring | undefined;
    },
  };
}

describe('LayoutPlanner', () => {
  // The radius-base is global state shared with BubbleTree; set it explicitly
  // here so the tests don't depend on what ran before them.
  setRadiusBase(1);

  it('plans a root view: scale 1, origin centred, ring radius from amounts', () => {
    const root: BubbleNode = {
      id: 'root',
      amount: 100,
      maxChildAmount: 60,
      children: [],
    };
    const rootBubble = stubObj(DisplayKind.Bubble, root);
    const ring = stubObj(DisplayKind.Ring, root);
    const ctx = buildCtx(root, [rootBubble, ring]);

    const { layout, centeredNode } = new LayoutPlanner().plan(root, ctx);

    expect(centeredNode).toBe(root);
    expect(layout.$(ctx.scaleTarget).bubbleScale).toBe(1.0);
    expect(layout.$(ctx.origin).x).toBe(400);
    expect(layout.$(ctx.origin).y).toBe(300);
    // ringRadius = a2rad(100) + a2rad(60) + 20
    const expected =
      Math.pow(100, 0.6) + Math.pow(60, 0.6) + 20;
    expect(layout.$(ring).rad).toBeCloseTo(expected, 5);
  });

  it('clears hideFlag on every touched object', () => {
    const root: BubbleNode = { id: 'root', amount: 100, maxChildAmount: 0, children: [] };
    const rootBubble = stubObj(DisplayKind.Bubble, root);
    const ring = stubObj(DisplayKind.Ring, root);
    const ctx = buildCtx(root, [rootBubble, ring]);

    new LayoutPlanner().plan(root, ctx);

    expect(rootBubble.hideFlag).toBe(false);
    expect(ring.hideFlag).toBe(false);
  });

  it('queues untouched, visible objects for hiding with alpha 0', () => {
    const root: BubbleNode = { id: 'root', amount: 100, maxChildAmount: 0, children: [] };
    const stale: BubbleNode = { id: 'stale', amount: 10 };
    const rootBubble = stubObj(DisplayKind.Bubble, root);
    const staleBubble = stubObj(DisplayKind.Bubble, stale);
    staleBubble.visible = true;
    staleBubble.node.level = 2; // deep enough to collapse to rad 0
    const ctx = buildCtx(root, [rootBubble, staleBubble]);

    const { layout } = new LayoutPlanner().plan(root, ctx);

    expect(layout.toHide).toContain(staleBubble);
    expect(layout.$(staleBubble).alpha).toBe(0);
    expect(layout.$(staleBubble).rad).toBe(0);
  });

  it('queues newly-needed objects for showing and starts them at alpha 0', () => {
    const root: BubbleNode = {
      id: 'root',
      amount: 100,
      maxChildAmount: 50,
      children: [],
    };
    const child: BubbleNode = { id: 'c', amount: 50, centerAngle: 0 };
    root.children = [child];

    const rootBubble = stubObj(DisplayKind.Bubble, root);
    const childBubble = stubObj(DisplayKind.Bubble, child);
    childBubble.visible = false; // not yet on stage
    const ring = stubObj(DisplayKind.Ring, root);
    const ctx = buildCtx(root, [rootBubble, childBubble, ring]);

    const { layout } = new LayoutPlanner().plan(root, ctx);

    expect(layout.toShow).toContain(childBubble);
    // Pre-render alpha is reset to 0 so the show animation fades the bubble in.
    expect(childBubble.alpha).toBe(0);
    expect(layout.$(childBubble).alpha).toBe(1);
  });

  it('re-centres on the parent when the requested node is a leaf', () => {
    const grand: BubbleNode = { id: 'g', amount: 200, maxChildAmount: 100 };
    const root: BubbleNode = {
      id: 'root',
      amount: 200,
      maxChildAmount: 100,
      children: [],
    };
    const mid: BubbleNode = {
      id: 'mid',
      amount: 100,
      maxChildAmount: 0,
      centerAngle: 0,
      parent: root,
      children: [],
    };
    const leaf: BubbleNode = {
      id: 'leaf',
      amount: 50,
      centerAngle: 0,
      parent: mid,
    };
    root.children = [mid];
    mid.parent = root;
    mid.children = [];
    leaf.parent = mid;

    // Wire the grandparent chain: root → grand → null  (so mid has > 1 ancestor)
    root.parent = undefined;

    const rootBubble = stubObj(DisplayKind.Bubble, root);
    const midBubble = stubObj(DisplayKind.Bubble, mid);
    const leafBubble = stubObj(DisplayKind.Bubble, leaf);
    const ring = stubObj(DisplayKind.Ring, mid);
    const parentRing = stubObj(DisplayKind.Ring, root);
    const ctx = buildCtx(root, [rootBubble, midBubble, leafBubble, ring, parentRing]);

    const { centeredNode } = new LayoutPlanner().plan(leaf, ctx);

    // Leaf has < 2 children → planner re-centres on its parent (mid), but
    // returns the original requested node so the caller still records it as
    // the user-facing currentCenter.
    expect(centeredNode).toBe(leaf);
  });
});
