/**
 * historyManager.ts
 *
 * Thin adapter around the native hashchange event that provides the same
 * init() / load() interface that the original jquery.history plugin offered.
 *
 * Only hash-based routing is supported (no pushState) because the library
 * is embedded inside arbitrary pages and must not interfere with their router.
 */
type HashCallback = (hash: string) => void;

export class HistoryManager {
  private callback: HashCallback | null = null;
  private listening = false;
  private boundHandler = () => this.handleChange();

  init(callback: HashCallback): void {
    this.callback = callback;
    if (!this.listening) {
      window.addEventListener('hashchange', this.boundHandler);
      this.listening = true;
    }
    const initial = this.currentHash() || '/';
    this.callback(initial);
  }

  load(url: string): void {
    if (this.currentHash() === url) {
      this.callback?.(url);
    } else {
      window.location.hash = url;
    }
  }

  destroy(): void {
    if (this.listening) {
      window.removeEventListener('hashchange', this.boundHandler);
      this.listening = false;
    }
  }

  private currentHash(): string {
    return decodeURI(window.location.hash.replace(/^#/, ''));
  }

  private handleChange(): void {
    this.callback?.(this.currentHash());
  }
}
