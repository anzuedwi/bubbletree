/**
 * format.test.ts — exhaustive cases for formatNumber.
 *
 * The formula reduces to: round(n / scale * 10) / 10, where scale is the
 * suffix's base (1k, 1m, …).  So 12_345 → 12.3k, not 12.35k.
 */
import { describe, it, expect } from 'vitest';
import { formatNumber } from './format.js';

describe('formatNumber', () => {
  it('returns small numbers unchanged', () => {
    expect(formatNumber(0)).toBe('0');
    expect(formatNumber(7)).toBe('7');
    expect(formatNumber(999)).toBe('999');
  });

  it('uses k suffix for thousands', () => {
    expect(formatNumber(1000)).toBe('1k');
    expect(formatNumber(1500)).toBe('1.5k');
    expect(formatNumber(12_345)).toBe('12.3k');
  });

  it('uses m suffix for millions', () => {
    expect(formatNumber(1_000_000)).toBe('1m');
    expect(formatNumber(2_500_000)).toBe('2.5m');
  });

  it('uses b suffix for billions', () => {
    expect(formatNumber(1_000_000_000)).toBe('1b');
  });

  it('uses t suffix for trillions', () => {
    expect(formatNumber(1_000_000_000_000)).toBe('1t');
  });

  it('preserves the minus sign for negatives', () => {
    expect(formatNumber(-1500)).toBe('-1.5k');
    expect(formatNumber(-7)).toBe('-7');
  });
});
