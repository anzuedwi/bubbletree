/**
 * transitioner.ts
 *
 * Drives animated transitions between two layouts using requestAnimationFrame
 * and the d3-ease exponential-out curve.
 *
 * Replaces the Tween.js (TWEEN) library used in the original codebase.
 * Key differences:
 *  - No global update loop; each Transitioner drives its own rAF chain.
 *  - Easing is applied at the property level rather than per-object.
 *  - When duration is 0 (same-node re-centre), values are set synchronously.
 */
import { easeExpOut } from 'd3-ease';
import type { Layout } from './layout.js';
import type { DisplayObject } from '../types/displayObject.js';

type DrawableValues = Record<string, number>;

export class Transitioner {
  running = false;
  private layout: Layout | null = null;
  private completeCallbacks: Array<() => void> = [];

  constructor(public duration: number) {}

  changeLayout(layout: Layout): void {
    this.running = true;
    this.layout = layout;

    for (const obj of layout.toShow) obj.show();

    if (this.duration <= 0) {
      for (let i = 0; i < layout.objects.length; i++) {
        const target = layout.objects[i] as DrawableValues & Partial<DisplayObject>;
        const props = layout.props[i]!;
        Object.assign(target, props);
        target.draw?.();
      }
      this.completed();
      return;
    }

    const start = performance.now();
    const fromStates = layout.objects.map((target, i) => {
      const props = layout.props[i]!;
      const from: DrawableValues = {};
      for (const key of Object.keys(props)) {
        from[key] = (target as DrawableValues)[key] ?? 0;
      }
      return from;
    });

    const tick = (now: number) => {
      if (!this.running || this.layout !== layout) return;
      const t = Math.min(1, (now - start) / this.duration);
      const eased = easeExpOut(t);

      for (let i = 0; i < layout.objects.length; i++) {
        const target = layout.objects[i] as DrawableValues & Partial<DisplayObject>;
        const props = layout.props[i]!;
        const from = fromStates[i]!;
        for (const key of Object.keys(props)) {
          target[key] = from[key]! + (props[key]! - from[key]!) * eased;
        }
        target.draw?.();
      }

      if (t < 1) requestAnimationFrame(tick);
      else this.completed();
    };

    requestAnimationFrame(tick);
  }

  onComplete(callback: () => void): void {
    this.completeCallbacks.push(callback);
  }

  private completed(): void {
    this.running = false;
    if (!this.layout) return;
    for (const obj of this.layout.objects) {
      (obj as Partial<DisplayObject>).draw?.();
    }
    for (const obj of this.layout.toHide) obj.hide();
    const callbacks = this.completeCallbacks.slice();
    this.completeCallbacks = [];
    for (const cb of callbacks) cb();
  }
}
