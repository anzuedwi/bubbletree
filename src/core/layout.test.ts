/**
 * layout.test.ts — Layout target-state accumulation.
 */
import { describe, it, expect } from 'vitest';
import { Layout } from './layout.js';

describe('Layout', () => {
  it('returns the same props object for the same target', () => {
    const layout = new Layout();
    const obj = { rad: 0 };
    const a = layout.$(obj);
    const b = layout.$(obj);
    expect(a).toBe(b);
  });

  it('writes target values that can be read back', () => {
    const layout = new Layout();
    const obj = { rad: 0 };
    layout.$(obj).rad = 42;
    expect(layout.$(obj).rad).toBe(42);
  });

  it('queues objects for show / hide separately', () => {
    const layout = new Layout();
    const target = {
      kind: 'bubble' as const,
      node: { amount: 1 },
      origin: { x: 0, y: 0 },
      pos: { x: 0, y: 0 },
      rad: 0,
      angle: 0,
      alpha: 1,
      visible: false,
      hideFlag: false,
      show() {},
      hide() {},
      draw() {},
    };
    layout.show(target as never);
    layout.hide(target as never);
    expect(layout.toShow).toContain(target);
    expect(layout.toHide).toContain(target);
  });
});
