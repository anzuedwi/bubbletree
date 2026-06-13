/**
 * css.test.ts — cssToken normalisation rules.
 */
import { describe, it, expect } from 'vitest';
import { cssToken } from './css.js';

describe('cssToken', () => {
  it('returns empty string for nullish input', () => {
    expect(cssToken(undefined)).toBe('');
    expect(cssToken(null)).toBe('');
    expect(cssToken('')).toBe('');
  });

  it('passes through already-valid tokens', () => {
    expect(cssToken('health')).toBe('health');
    expect(cssToken('h-public-health')).toBe('h-public-health');
    expect(cssToken('snake_case')).toBe('snake_case');
  });

  it('collapses whitespace and punctuation into single hyphens', () => {
    expect(cssToken('Medical Supplies')).toBe('Medical-Supplies');
    expect(cssToken('a / b : c')).toBe('a-b-c');
  });

  it('prefixes ids that start with a digit so they are valid selectors', () => {
    expect(cssToken('2024')).toBe('id-2024');
    expect(cssToken('3m-budget')).toBe('id-3m-budget');
  });

  it('trims leading and trailing separators', () => {
    expect(cssToken('  spaced  ')).toBe('spaced');
    expect(cssToken('--weird--')).toBe('weird');
  });

  it('produces a token usable by classList.add without throwing', () => {
    const el = document.createElement('div');
    expect(() => el.classList.add(cssToken('Has Spaces'))).not.toThrow();
    expect(el.classList.contains('Has-Spaces')).toBe(true);
  });
});
