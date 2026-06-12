/**
 * randomTree.ts
 *
 * Deterministic random tree generator.  Used to exercise BubbleTree with
 * arbitrary fan-out and depth.  The same seed always produces the same
 * tree so screenshot / visual-regression tests stay stable.
 */
import type { BubbleNode } from '../../types/bubbleNode.js';

/** Mulberry32 — small, fast, seeded PRNG with good distribution. */
function makeRng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface RandomTreeOptions {
  seed?: number;
  depth?: number;
  /** Approximate children per node (actual count varies ±50%). */
  fanout?: number;
  /** Maximum amount at the leaves. */
  maxLeafAmount?: number;
}

export function generateRandomTree(options: RandomTreeOptions = {}): BubbleNode {
  const { seed = 42, depth = 3, fanout = 5, maxLeafAmount = 100 } = options;
  const rng = makeRng(seed);

  let nodeCounter = 0;
  const newId = () => `n${nodeCounter++}`;

  /** Recursively build a subtree of the given depth. */
  const build = (currentDepth: number): BubbleNode => {
    if (currentDepth === 0) {
      return {
        id: newId(),
        label: `Leaf ${nodeCounter}`,
        amount: Math.round(rng() * maxLeafAmount) + 1,
      };
    }
    const childCount = Math.max(2, Math.round(fanout * (0.5 + rng())));
    const children: BubbleNode[] = [];
    let amount = 0;
    for (let i = 0; i < childCount; i++) {
      const child = build(currentDepth - 1);
      children.push(child);
      amount += child.amount;
    }
    return {
      id: newId(),
      label: `Node ${nodeCounter}`,
      amount,
      children,
    };
  };

  const tree = build(depth);
  tree.label = 'Random Total';
  return tree;
}
