/**
 * layoutPlanner.ts
 *
 * Computes the target layout (radii, angles, alphas, origin position) for
 * a view change.  Pure layout maths: no DOM access, no animation, no
 * history; just reads the data tree + current display-object positions
 * and writes target values into a Layout instance.
 *
 * The planner is intentionally stateless between calls — each `plan()`
 * call carries all its context through arguments. This keeps it easy to
 * test in isolation: hand it a few nodes and assert on the produced
 * Layout's target values.
 *
 * Side effects on inputs
 * ──────────────────────
 * For two specific properties the planner mutates display objects directly
 * instead of going through Layout, matching the original semantics:
 *
 *  - `hideFlag` is cleared on every object the plan touches (used by the
 *    caller's show/hide walk afterwards).
 *  - `childRotation` is set on the centred parent and its grandparent,
 *    because rotations have to be visible to the math on the next pass and
 *    are not animated.
 */

import { Layout } from './layout.js';
import { Vector } from './vector.js';
import { amountToRadius } from './utils.js';
import { shortestAngleTo } from './angles.js';
import { DisplayKind } from '../enums/displayKind.js';
import type { BubbleNode } from '../types/bubbleNode.js';
import type { DisplayObject } from '../types/displayObject.js';
import type { BaseBubble } from '../bubbles/baseBubble.js';
import type { Ring } from './ring.js';

/**
 * Anything the planner needs from BubbleTree.  Passed in to avoid a
 * circular import and to make the planner's dependencies explicit.
 */
export interface LayoutPlannerContext {
  /** Container width in CSS pixels. */
  width: number;
  /** Container height in CSS pixels. */
  height: number;
  /** The shared origin vector — written to with `layout.$(origin).x/y`. */
  origin: Vector;
  /** Root of the data tree. */
  root: BubbleNode;
  /** Every display object currently managed by the tree. */
  displayObjects: DisplayObject[];
  /**
   * Whatever object carries the global bubbleScale value (BubbleTree itself).
   * The planner writes the target through `layout.$(scaleTarget).bubbleScale`.
   */
  scaleTarget: object;
  /**
   * Look up a bubble by node. When `keepHidden` is false (the default the
   * planner uses while collecting touched objects) the hideFlag is cleared
   * on the returned object.
   */
  getBubble(node: BubbleNode, keepHidden?: boolean): BaseBubble | undefined;
  /** Look up the ring associated with a parent node. */
  getRing(node: BubbleNode): Ring | undefined;
}

/** Result of a planning pass. */
export interface PlannedView {
  /** The Layout populated with target values. */
  layout: Layout;
  /**
   * The node that ends up centred after the transition.  This may differ
   * from the requested node when the request was a childless leaf — the
   * view re-centres on its parent instead.
   */
  centeredNode: BubbleNode;
}

export class LayoutPlanner {
  /**
   * Produce a Layout that will, when applied by the Transitioner, move the
   * tree into the view centred on `requestedNode`.
   */
  plan(requestedNode: BubbleNode, ctx: LayoutPlannerContext): PlannedView {
    // Hide-all gate. Every getBubble/getRing call below clears its target's
    // hideFlag, so by the time we reach the show/hide walk the only objects
    // still flagged for hiding are the ones that this layout doesn't touch.
    for (const obj of ctx.displayObjects) obj.hideFlag = true;

    const layout = new Layout();
    let centeredNode: BubbleNode;

    if (this.isRootView(requestedNode, ctx.root)) {
      centeredNode = this.planRootView(requestedNode, layout, ctx);
    } else {
      centeredNode = this.planChildView(requestedNode, layout, ctx);
    }

    this.planShowHide(layout, ctx);
    return { layout, centeredNode };
  }

  // ---------------------------------------------------------------------------
  // Branch selection
  // ---------------------------------------------------------------------------

  /**
   * The view is "rooted" when the request *is* the root, or when the request
   * is a top-level node with fewer than two children of its own (which would
   * give nothing meaningful to fan out below).
   */
  private isRootView(node: BubbleNode, root: BubbleNode): boolean {
    if (node === root) return true;
    if (node.parent === root && (node.children?.length ?? 0) < 2) return true;
    return false;
  }

  // ---------------------------------------------------------------------------
  // Root-level view
  // ---------------------------------------------------------------------------

  private planRootView(
    node: BubbleNode,
    layout: Layout,
    ctx: LayoutPlannerContext,
  ): BubbleNode {
    const { root, origin, width, height } = ctx;

    // Whole-tree scale is identity at the root.
    layout.$(ctx.scaleTarget).bubbleScale = 1.0;
    layout.$(origin).x = width * 0.5;
    layout.$(origin).y = height * 0.5;

    const parent = ctx.getBubble(root);
    if (!parent) return root;

    // When the requested node is a leaf child of root we rotate the orbit so
    // the requested child appears at θ = 0.
    if (node !== root) parent.childRotation = -(node.centerAngle ?? 0);

    const ringRadius = amountToRadius(root.amount) + amountToRadius(root.maxChildAmount ?? 0) + 20;
    const ring = ctx.getRing(root);
    if (ring) layout.$(ring).rad = ringRadius;

    for (const child of root.children ?? []) {
      const bubble = ctx.getBubble(child);
      if (!bubble) continue;
      layout.$(bubble).angle = shortestAngleTo(
        bubble.angle,
        (child.centerAngle ?? 0) + (parent.childRotation ?? 0),
      );
      layout.$(bubble).rad = ringRadius;
    }

    return root;
  }

  // ---------------------------------------------------------------------------
  // Child-level view (zoom in)
  // ---------------------------------------------------------------------------

  private planChildView(
    requestedNode: BubbleNode,
    layout: Layout,
    ctx: LayoutPlannerContext,
  ): BubbleNode {
    const { origin, width, height } = ctx;
    const a2rad = amountToRadius;
    const maxRad = Math.min(width, height) * 0.35;

    // If the requested node is a leaf, re-centre on its parent instead, but
    // remember the original so the angle maths can offset accordingly.
    const origNode = requestedNode;
    const node = (requestedNode.children?.length ?? 0) < 2
      ? requestedNode.parent!
      : requestedNode;

    // Pick the scale that fits this node + its largest child into maxRad.
    const tgtScale = maxRad / (a2rad(node.amount) + a2rad(node.maxChildAmount ?? 0) * 2);
    layout.$(ctx.scaleTarget).bubbleScale = tgtScale;

    const parent = ctx.getBubble(node);
    if (!parent) return node;
    layout.$(parent).angle = shortestAngleTo(parent.angle, 0);

    const innerRingRadius = (a2rad(node.amount) + a2rad(node.maxChildAmount ?? 0)) * tgtScale + 20;
    const innerRing = ctx.getRing(node);
    if (innerRing) layout.$(innerRing).rad = innerRingRadius;

    // Collapse every ancestor so they shrink toward the new origin.
    this.collapseAncestors(node, layout, ctx);

    // Distance the parent ring is pushed out beyond the canvas edge.
    const outerOffset = this.computeOuterOffset(node, tgtScale, width);

    layout.$(origin).x = width * 0.5 - outerOffset - (node !== origNode ? innerRingRadius * 0.35 : 0);
    layout.$(origin).y = height * 0.5;

    const outerRingRadius = outerOffset + width * 0.1;
    const outerRing = ctx.getRing(node.parent!);
    if (outerRing) layout.$(outerRing).rad = outerRingRadius;
    layout.$(parent).rad = outerRingRadius;

    // Compensate the children's angles if we re-centred on the parent.
    const angleOffset = node !== origNode
      ? -((origNode.centerAngle ?? 0) + (parent.childRotation ?? 0))
      : 0;

    for (const child of node.children ?? []) {
      const bubble = ctx.getBubble(child);
      if (!bubble) continue;
      layout.$(bubble).angle = shortestAngleTo(
        bubble.angle,
        (child.centerAngle ?? 0) + (parent.childRotation ?? 0) + angleOffset,
      );
      layout.$(bubble).rad = innerRingRadius;
    }

    this.planSiblings(node, layout, ctx, tgtScale, outerRingRadius);
    return origNode;
  }

  /** Set every ancestor's target rad to 0 so they collapse into the origin. */
  private collapseAncestors(
    node: BubbleNode,
    layout: Layout,
    ctx: LayoutPlannerContext,
  ): void {
    const grandpa = ctx.getBubble(node.parent!);
    if (!grandpa) return;
    grandpa.childRotation = -(node.centerAngle ?? 0);
    layout.$(grandpa).rad = 0;

    let ancestor: BaseBubble | undefined = grandpa;
    while (ancestor?.node.parent) {
      ancestor = ctx.getBubble(ancestor.node.parent, true);
      if (ancestor) layout.$(ancestor).rad = 0;
    }
  }

  /**
   * The original computation for how far to push the parent ring out so the
   * centred node + its largest child stay visible without crowding the
   * siblings. Preserved verbatim from the legacy code.
   */
  private computeOuterOffset(node: BubbleNode, tgtScale: number, width: number): number {
    const a2rad = amountToRadius;
    const hw = width * 0.5;
    return Math.max(
      hw * 0.8 - tgtScale * (
        a2rad(node.parent?.amount ?? 0) +
        a2rad(Math.max(
          node.amount * 1.15 + (node.maxChildAmount ?? 0) * 1.15,
          a2rad(node.left?.amount ?? 0) * 0.85,
          a2rad(node.right?.amount ?? 0) * 0.85,
        ))
      ),
      tgtScale * a2rad(node.parent?.amount ?? 0) * -1 + hw * 0.15,
    );
  }

  /** Position the left and right siblings tangent to the outer ring. */
  private planSiblings(
    node: BubbleNode,
    layout: Layout,
    ctx: LayoutPlannerContext,
    tgtScale: number,
    outerRingRadius: number,
  ): void {
    const a2rad = amountToRadius;
    const siblCut = ctx.height * 0.07;
    const halfH = ctx.height * 0.5;

    if (node.left) {
      const sib = ctx.getBubble(node.left);
      if (sib) {
        const srad = a2rad(node.left.amount) * tgtScale;
        const sang = Math.PI * 2 - Math.asin((halfH + srad - siblCut) / outerRingRadius);
        layout.$(sib).rad = outerRingRadius;
        layout.$(sib).angle = shortestAngleTo(sib.angle, sang);
      }
    }
    if (node.right) {
      const sib = ctx.getBubble(node.right);
      if (sib) {
        const srad = a2rad(node.right.amount) * tgtScale;
        const sang = Math.asin((halfH + srad - siblCut) / outerRingRadius);
        layout.$(sib).rad = outerRingRadius;
        layout.$(sib).angle = shortestAngleTo(sib.angle, sang);
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Show / hide pass
  // ---------------------------------------------------------------------------

  /**
   * Walk every display object and decide whether to show it, hide it, or
   * leave its visibility alone. Untouched objects (those whose hideFlag the
   * plan never cleared) get target alpha 0 and are queued for hide; touched
   * objects get target alpha 1 and, if not yet visible, are queued for show.
   */
  private planShowHide(layout: Layout, ctx: LayoutPlannerContext): void {
    for (const obj of ctx.displayObjects) {
      if (obj.hideFlag && obj.visible) {
        layout.$(obj).alpha = 0;
        // Deep bubbles also collapse toward the centre as they fade.
        if (obj.kind === DisplayKind.Bubble && (obj.node.level ?? 0) > 1) {
          layout.$(obj).rad = 0;
        }
        layout.hide(obj);
      } else if (!obj.hideFlag) {
        layout.$(obj).alpha = 1;
        if (!obj.visible) {
          // Start invisible so the show animation fades the object in.
          (obj as DisplayObject & { alpha: number }).alpha = 0;
          layout.show(obj);
        }
      }
    }
  }
}
