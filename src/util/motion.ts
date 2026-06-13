/**
 * motion.ts
 *
 * Honour the user's prefers-reduced-motion OS setting in the animation
 * pipeline. CSS transitions are already gated by `@media (prefers-reduced-
 * motion: reduce)` in the stylesheet, but the JS-driven Transitioner runs
 * its own 1000 ms rAF tween regardless. This helper folds the OS setting
 * into the duration so a user who has asked for reduced motion gets a
 * synchronous, animation-free view change.
 */

/** True when the user's OS asks for reduced motion. SSR-safe. */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Return the duration to use for a transition. When the user has asked
 * for reduced motion the duration collapses to 0, which the Transitioner
 * applies synchronously (no rAF chain).
 */
export function effectiveDuration(requested: number): number {
  return prefersReducedMotion() ? 0 : requested;
}
