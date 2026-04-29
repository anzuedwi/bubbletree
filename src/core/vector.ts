/**
 * vector.ts
 *
 * A mutable 2-D vector used for the animated origin point and bubble
 * positions.  The Transitioner tweens `.x` and `.y` directly, so the
 * class is intentionally simple and avoids immutable value semantics.
 */
import type { Point } from '../types/point.js';

export class Vector implements Point {
  constructor(public x: number, public y: number) {}

  length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  normalize(targetLength = 1): void {
    const current = this.length();
    if (current === 0) return;
    this.x *= targetLength / current;
    this.y *= targetLength / current;
  }

  clone(): Vector {
    return new Vector(this.x, this.y);
  }
}
