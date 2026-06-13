/**
 * angles.test.ts — pure-function tests for the angle helpers.
 */
import { describe, it, expect } from 'vitest';
import { unifyAngle, shortestAngle, shortestAngleTo } from './angles.js';

const TAU = Math.PI * 2;

describe('unifyAngle', () => {
  it('returns angles already in [0, 2π) unchanged', () => {
    expect(unifyAngle(0)).toBe(0);
    expect(unifyAngle(Math.PI)).toBeCloseTo(Math.PI, 10);
  });

  it('wraps negatives forward into the canonical range', () => {
    expect(unifyAngle(-Math.PI / 2)).toBeCloseTo((3 * Math.PI) / 2, 10);
  });

  it('wraps multiples of 2π down into the canonical range', () => {
    expect(unifyAngle(TAU + Math.PI / 4)).toBeCloseTo(Math.PI / 4, 10);
    expect(unifyAngle(3 * TAU)).toBeCloseTo(0, 10);
  });
});

describe('shortestAngle', () => {
  it('returns 0 when the angles match', () => {
    expect(shortestAngle(1, 1)).toBeCloseTo(0, 10);
  });

  it('returns the small positive arc when going forward is shorter', () => {
    // 350° → 10° must be +20° (in radians), not −340°.
    const from = (350 / 180) * Math.PI;
    const to = (10 / 180) * Math.PI;
    expect(shortestAngle(from, to)).toBeCloseTo((20 / 180) * Math.PI, 10);
  });

  it('returns the small negative arc when going backward is shorter', () => {
    // 10° → 350° must be −20°.
    const from = (10 / 180) * Math.PI;
    const to = (350 / 180) * Math.PI;
    expect(shortestAngle(from, to)).toBeCloseTo(-(20 / 180) * Math.PI, 10);
  });

  it('never returns a delta whose magnitude exceeds π', () => {
    for (let f = 0; f < TAU; f += 0.5) {
      for (let t = 0; t < TAU; t += 0.5) {
        expect(Math.abs(shortestAngle(f, t))).toBeLessThanOrEqual(Math.PI + 1e-9);
      }
    }
  });
});

describe('shortestAngleTo', () => {
  it('lands on an angle that unifies to the target', () => {
    const result = shortestAngleTo(10, Math.PI / 3);
    expect(unifyAngle(result)).toBeCloseTo(Math.PI / 3, 10);
  });
});
