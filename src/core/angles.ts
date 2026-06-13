/**
 * angles.ts
 *
 * Pure angle helpers used by the layout maths.  All angles are in radians.
 *
 * These are stateless and module-level so any layout code can call them
 * without going through a BubbleTree instance.
 */

const TAU = Math.PI * 2;

/** Normalise an angle into the canonical [0, 2π) range. */
export function unifyAngle(a: number): number {
  let x = a;
  while (x >= TAU) x -= TAU;
  while (x < 0) x += TAU;
  return x;
}

/**
 * Signed shortest angular delta from `from` to `to`.
 *
 * Without this, a bubble at θ = 350° tweening to θ = 10° would spin the long
 * way (340° backward) instead of the short way (20° forward).
 */
export function shortestAngle(from: number, to: number): number {
  const f = unifyAngle(from);
  const t = unifyAngle(to);
  let sa = t - f;
  if (sa > Math.PI) sa -= TAU;
  if (sa < -Math.PI) sa += TAU;
  return sa;
}

/** `from` plus the shortest signed delta toward `to`. */
export function shortestAngleTo(from: number, to: number): number {
  return from + shortestAngle(from, to);
}
