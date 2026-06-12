/**
 * utils.test.ts — amount-to-radius scaling formula.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { amountToRadius, setRadiusBase } from './utils.js';

describe('amountToRadius', () => {
  beforeEach(() => setRadiusBase(1));

  it('returns 0 for amount 0', () => {
    expect(amountToRadius(0)).toBe(0);
  });

  it('clamps negative amounts to 0', () => {
    expect(amountToRadius(-50)).toBe(0);
  });

  it('grows with diminishing returns (exponent 0.6)', () => {
    setRadiusBase(1);
    const r1 = amountToRadius(1);
    const r10 = amountToRadius(10);
    const r100 = amountToRadius(100);
    // r10 / r1 should be 10^0.6 ≈ 3.98
    expect(r10 / r1).toBeCloseTo(Math.pow(10, 0.6), 4);
    expect(r100 / r10).toBeCloseTo(Math.pow(10, 0.6), 4);
  });

  it('shrinks output as the base grows', () => {
    setRadiusBase(1);
    const small = amountToRadius(1000);
    setRadiusBase(100);
    const big = amountToRadius(1000);
    expect(big).toBeLessThan(small);
  });
});
