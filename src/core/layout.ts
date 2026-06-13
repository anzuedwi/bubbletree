/**
 * layout.ts
 *
 * Captures the desired end-state for a view transition.
 *
 * Callers write target values using the fluent $ accessor:
 *   layout.$(bubble).rad = 120;
 *   layout.$(ring).alpha = 0;
 *
 * Objects in toShow are made visible before the tween starts;
 * objects in toHide are removed after the tween completes.
 * This mirrors the "Flare-style transitioner" pattern from the original.
 */
import type { DisplayObject } from '../types/displayObject.js';

type AnyTarget = object;

export class Layout {
  readonly objects: AnyTarget[] = [];
  readonly props: Record<string, number>[] = [];
  readonly toHide: DisplayObject[] = [];
  readonly toShow: DisplayObject[] = [];

  $<T extends AnyTarget>(obj: T): Record<string, number> {
    const existingIndex = this.objects.indexOf(obj);
    if (existingIndex !== -1) return this.props[existingIndex]!;
    const props: Record<string, number> = {};
    this.objects.push(obj);
    this.props.push(props);
    return props;
  }

  show(obj: DisplayObject): void {
    this.toShow.push(obj);
  }

  hide(obj: DisplayObject): void {
    this.toHide.push(obj);
  }
}
