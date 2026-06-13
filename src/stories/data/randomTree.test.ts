/**
 * randomTree.test.ts — deterministic PRNG-based generator.
 */
import { describe, it, expect } from 'vitest';
import { generateRandomTree } from './randomTree.js';
import type { BubbleNode } from '../../types/bubbleNode.js';

function countNodes(node: BubbleNode): number {
  return 1 + (node.children?.reduce((s, c) => s + countNodes(c), 0) ?? 0);
}

function maxDepth(node: BubbleNode): number {
  if (!node.children?.length) return 1;
  return 1 + Math.max(...node.children.map(maxDepth));
}

describe('generateRandomTree', () => {
  it('produces identical trees for the same seed', () => {
    const a = generateRandomTree({ seed: 5 });
    const b = generateRandomTree({ seed: 5 });
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it('produces different trees for different seeds', () => {
    const a = generateRandomTree({ seed: 1 });
    const b = generateRandomTree({ seed: 2 });
    expect(JSON.stringify(a)).not.toBe(JSON.stringify(b));
  });

  it('respects the depth option', () => {
    expect(maxDepth(generateRandomTree({ seed: 1, depth: 1 }))).toBe(2);
    expect(maxDepth(generateRandomTree({ seed: 1, depth: 3 }))).toBe(4);
  });

  it('builds a non-trivial tree by default', () => {
    expect(countNodes(generateRandomTree())).toBeGreaterThan(10);
  });
});
