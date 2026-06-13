/**
 * historyManager.test.ts — hash-based routing.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HistoryManager } from './historyManager.js';

describe('HistoryManager', () => {
  beforeEach(() => {
    window.location.hash = '';
  });

  it('fires the callback once on init with the initial hash', () => {
    const cb = vi.fn();
    const h = new HistoryManager();
    h.init(cb);
    expect(cb).toHaveBeenCalledTimes(1);
    expect(cb).toHaveBeenCalledWith('/');
    h.destroy();
  });

  it('fires the callback again when the hash changes', () => {
    const cb = vi.fn();
    const h = new HistoryManager();
    h.init(cb);
    window.location.hash = '/foo/bar';
    window.dispatchEvent(new Event('hashchange'));
    expect(cb).toHaveBeenCalledWith('/foo/bar');
    h.destroy();
  });

  it('load() short-circuits when the requested url equals the current hash', () => {
    const cb = vi.fn();
    const h = new HistoryManager();
    window.location.hash = '/already';
    h.init(cb);
    cb.mockClear();
    h.load('/already');
    expect(cb).toHaveBeenCalledWith('/already');
    h.destroy();
  });
});
