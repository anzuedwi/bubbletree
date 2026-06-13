/**
 * vector.test.ts — Vector class behaviour.
 */
import { describe, it, expect } from 'vitest';
import { Vector } from './vector.js';

describe('Vector', () => {
  it('reports length via the Euclidean norm', () => {
    expect(new Vector(3, 4).length()).toBe(5);
    expect(new Vector(0, 0).length()).toBe(0);
  });

  it('clones into an independent instance', () => {
    const a = new Vector(1, 2);
    const b = a.clone();
    b.x = 99;
    expect(a.x).toBe(1);
    expect(b.x).toBe(99);
  });

  it('normalises to the requested length', () => {
    const v = new Vector(3, 4);
    v.normalize(10);
    expect(v.length()).toBeCloseTo(10, 5);
  });

  it('no-ops when normalising a zero vector', () => {
    const v = new Vector(0, 0);
    v.normalize(10);
    expect(v.x).toBe(0);
    expect(v.y).toBe(0);
  });
});
