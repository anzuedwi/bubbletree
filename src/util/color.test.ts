/**
 * color.test.ts — verifies the d3-color wrappers behave as expected for
 * the inputs BubbleTree gives them.
 */
import { describe, it, expect } from 'vitest';
import { hsl } from 'd3-color';
import { hslColor, adjustLightness, adjustSaturation } from './color.js';

describe('hslColor', () => {
  it('returns a valid hex string', () => {
    expect(hslColor(0, 1, 0.5)).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it('produces pure red for h=0, s=1, l=0.5', () => {
    expect(hslColor(0, 1, 0.5).toLowerCase()).toBe('#ff0000');
  });
});

describe('adjustLightness', () => {
  it('makes a colour lighter when factor > 1', () => {
    const before = hsl(hslColor(0, 1, 0.4));
    const after = hsl(adjustLightness('#cc0000', 1.5));
    expect(after.l).toBeGreaterThan(before.l);
  });

  it('clamps lightness to [0, 1]', () => {
    expect(hsl(adjustLightness('#ffffff', 5)).l).toBeLessThanOrEqual(1);
    expect(hsl(adjustLightness('#000000', 0)).l).toBe(0);
  });
});

describe('adjustSaturation', () => {
  it('reduces saturation when factor < 1', () => {
    const before = hsl('#ff0000');
    const after = hsl(adjustSaturation('#ff0000', 0.5));
    expect(after.s).toBeLessThan(before.s);
  });
});
