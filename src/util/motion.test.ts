/**
 * motion.test.ts — reduced-motion duration gating.
 */
import { describe, it, expect, afterEach, vi } from 'vitest';
import { prefersReducedMotion, effectiveDuration } from './motion.js';

function mockMatchMedia(reduce: boolean): () => void {
  const original = window.matchMedia;
  window.matchMedia = ((query: string) => ({
    matches: query.includes('reduce') && reduce,
    media: query,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    onchange: null,
    dispatchEvent() {
      return false;
    },
  })) as typeof window.matchMedia;
  return () => {
    window.matchMedia = original;
  };
}

describe('prefersReducedMotion', () => {
  let restore: () => void = () => {};
  afterEach(() => restore());

  it('returns true when the media query matches', () => {
    restore = mockMatchMedia(true);
    expect(prefersReducedMotion()).toBe(true);
  });

  it('returns false when the media query does not match', () => {
    restore = mockMatchMedia(false);
    expect(prefersReducedMotion()).toBe(false);
  });

  it('returns false when matchMedia is unavailable (SSR)', () => {
    const original = window.matchMedia;
    // @ts-expect-error simulate environment without matchMedia
    delete window.matchMedia;
    expect(prefersReducedMotion()).toBe(false);
    window.matchMedia = original;
  });
});

describe('effectiveDuration', () => {
  let restore: () => void = () => {};
  afterEach(() => restore());

  it('passes the requested duration through when motion is allowed', () => {
    restore = mockMatchMedia(false);
    expect(effectiveDuration(1000)).toBe(1000);
  });

  it('collapses to 0 when reduced motion is requested', () => {
    restore = mockMatchMedia(true);
    expect(effectiveDuration(1000)).toBe(0);
  });
});
