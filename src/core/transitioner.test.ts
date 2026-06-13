/**
 * transitioner.test.ts — synchronous (duration 0) behaviour, callback
 * handoff, and stop() semantics. The rAF path is exercised indirectly by
 * the BubbleTree integration tests.
 */
import { describe, it, expect, vi } from 'vitest';
import { Transitioner } from './transitioner.js';
import { Layout } from './layout.js';

describe('Transitioner', () => {
  it('applies target values synchronously when duration is 0', () => {
    const target = { rad: 0, draw: vi.fn() };
    const layout = new Layout();
    layout.$(target).rad = 100;

    const tr = new Transitioner(0);
    tr.changeLayout(layout);

    expect(target.rad).toBe(100);
    expect(target.draw).toHaveBeenCalled();
    expect(tr.running).toBe(false);
  });

  it('fires completion callbacks after a synchronous transition', () => {
    const cb = vi.fn();
    const tr = new Transitioner(0);
    tr.onComplete(cb);
    tr.changeLayout(new Layout());
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('transfers pending callbacks to a successor', () => {
    const cb = vi.fn();
    const first = new Transitioner(1000);
    first.onComplete(cb);

    const second = new Transitioner(0);
    first.transferCallbacksTo(second);
    first.stop();

    // The callback must not have fired on the stopped transition...
    expect(cb).not.toHaveBeenCalled();

    // ...but must fire once the successor completes.
    second.changeLayout(new Layout());
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('stop() discards callbacks and marks the transition not running', () => {
    const cb = vi.fn();
    const tr = new Transitioner(1000);
    tr.onComplete(cb);
    tr.stop();
    expect(tr.running).toBe(false);
    expect(cb).not.toHaveBeenCalled();
  });
});
