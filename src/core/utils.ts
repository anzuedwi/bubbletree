/**
 * utils.ts
 *
 * Global radius-scaling state and the amount→radius conversion formula.
 *
 * amountToRadius(a) = (a / base)^0.6
 *
 * The exponent 0.6 gives a perceptually balanced mapping: doubling the
 * amount increases the radius by ~52% rather than 100%, preventing large
 * nodes from completely dominating the layout.
 *
 * `base` is recomputed whenever the container resizes so that the largest
 * node fills roughly half the available space.
 */
export const a2radState = { base: 1 };

export function amountToRadius(amount: number): number {
  return Math.pow(Math.max(0, amount) / a2radState.base, 0.6);
}

export function setRadiusBase(base: number): void {
  a2radState.base = base;
}
