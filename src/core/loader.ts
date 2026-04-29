/**
 * loader.ts
 *
 * Convenience wrapper that accepts a BubbleConfig whose data property
 * is either an inline object or a URL string.  When a URL is supplied
 * it fetches the JSON, then instantiates BubbleTree and calls setData().
 *
 * Replaces the original $.ajax()-based Loader.
 */
import type { BubbleConfig } from '../types/bubbleConfig.js';
import type { BubbleNode } from '../types/bubbleNode.js';
import { BubbleTree } from './bubbleTree.js';

export class Loader {
  instance: BubbleTree | null = null;

  constructor(public readonly config: BubbleConfig) {
    if (typeof config.data === 'string') {
      this.loadData(config.data);
    } else {
      this.run(config.data);
    }
  }

  private async loadData(url: string): Promise<void> {
    const response = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`Failed to load ${url}: ${response.status}`);
    const data = (await response.json()) as BubbleNode;
    this.run(data);
  }

  private run(data: BubbleNode): void {
    const tree = new BubbleTree(this.config);
    tree.setData(data);
    this.instance = tree;
  }
}
