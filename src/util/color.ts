/**
 * color.ts
 *
 * Thin wrappers around d3-color for the colour operations BubbleTree needs:
 *  - hslColor()          → create a colour from HSL components
 *  - adjustLightness()   → multiply the L channel of an existing hex colour
 *  - adjustSaturation()  → multiply the S channel of an existing hex colour
 *
 * These replace the vis4color helper from the original jQuery codebase.
 */
import { hsl, color as parseColor, type HSLColor } from 'd3-color';

export function hslColor(h: number, s: number, l: number): string {
  return hsl(h, s, l).formatHex();
}

export function adjustLightness(hex: string, factor: number): string {
  const c = parseColor(hex);
  if (!c) return hex;
  const h = c.copy() as HSLColor;
  const asHsl = hsl(h);
  asHsl.l = Math.max(0, Math.min(1, asHsl.l * factor));
  return asHsl.formatHex();
}

export function adjustSaturation(hex: string, factor: number): string {
  const c = parseColor(hex);
  if (!c) return hex;
  const asHsl = hsl(c);
  asHsl.s = Math.max(0, Math.min(1, asHsl.s * factor));
  return asHsl.formatHex();
}
