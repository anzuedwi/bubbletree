/**
 * bubbleTreeElement.ts
 *
 * `<bubble-tree>` — a Lit-based custom element that wraps the BubbleTree
 * library so it can be embedded declaratively in HTML, Storybook stories,
 * or any framework that speaks the Web Components standard.
 *
 *   <bubble-tree
 *     bubble-type="plain"
 *     auto-colors
 *     min-radius-labels="40"
 *     height="500px">
 *   </bubble-tree>
 *
 * The `data` property accepts a {@link BubbleNode} object directly (no
 * serialisation through attributes).  Whenever any reactive property
 * changes the underlying BubbleTree is re-instantiated.
 */
import { LitElement, css, html, type PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { BubbleTree } from '../core/bubbleTree.js';
import { BubbleType } from '../enums/bubbleType.js';
import type { BubbleConfig } from '../types/bubbleConfig.js';
import type { BubbleNode } from '../types/bubbleNode.js';
import type { BubbleStyles } from '../types/bubbleStyle.js';
import type { TooltipEvent } from '../types/tooltipEvent.js';

@customElement('bubble-tree')
export class BubbleTreeElement extends LitElement {
  /** Hierarchical dataset to render. */
  @property({ attribute: false })
  data: BubbleNode | null = null;

  /** Which bubble renderer to use ('plain' | 'donut' | 'icon'). */
  @property({ attribute: 'bubble-type' })
  bubbleType: BubbleType = BubbleType.Plain;

  /** Optional custom style map. */
  @property({ attribute: false })
  bubbleStyles?: BubbleStyles;

  /** Generate colours automatically based on hierarchy. */
  @property({ type: Boolean, attribute: 'auto-colors' })
  autoColors = false;

  /** Strip existing colours from the data before rendering. */
  @property({ type: Boolean, attribute: 'clear-colors' })
  clearColors = false;

  /** Bubbles below this radius hide their descriptive label. */
  @property({ type: Number, attribute: 'min-radius-labels' })
  minRadiusLabels = 40;

  /** Bubbles below this radius hide their amount label too. */
  @property({ type: Number, attribute: 'min-radius-amounts' })
  minRadiusAmounts = 20;

  /** Truncate node labels longer than this number of characters. */
  @property({ type: Number, attribute: 'cut-labels-at' })
  cutLabelsAt = 50;

  /** Tooltip callback (assigned via property, not attribute). */
  @property({ attribute: false })
  onTooltip?: (event: TooltipEvent) => void;

  /** Node click callback. */
  @property({ attribute: false })
  onNodeClick?: (node: BubbleNode) => void;

  private tree: BubbleTree | null = null;

  static styles = css`
    :host {
      display: block;
      position: relative;
      width: 100%;
      height: var(--bubble-tree-height, 500px);
      overflow: hidden;
    }
    .bubbletree-wrapper {
      position: absolute;
      inset: 0;
    }
    .bubbletree {
      position: absolute;
      inset: 0;
    }
  `;

  render() {
    return html`
      <div class="bubbletree-wrapper">
        <div class="bubbletree" part="canvas"></div>
      </div>
    `;
  }

  /**
   * Lit lifecycle: fires after the first render *and* after every reactive
   * update.  We tear down and rebuild the BubbleTree only when something
   * structural changed; cheap attribute flips don't require a rebuild but
   * the library doesn't currently expose live reconfiguration, so we
   * rebuild any time a reactive property changes.
   */
  protected updated(changed: PropertyValues): void {
    if (!this.data) return;
    if (
      changed.has('data') ||
      changed.has('bubbleType') ||
      changed.has('bubbleStyles') ||
      changed.has('autoColors') ||
      changed.has('clearColors') ||
      changed.has('minRadiusLabels') ||
      changed.has('minRadiusAmounts') ||
      changed.has('cutLabelsAt')
    ) {
      this.rebuild();
    }
  }

  /** Construct a fresh BubbleTree from the current props. */
  private rebuild(): void {
    const container = this.renderRoot.querySelector<HTMLElement>('.bubbletree');
    if (!container || !this.data) return;

    // Clone the data so consumers can keep their reference intact;
    // BubbleTree mutates its input by attaching parent/level metadata.
    const dataCopy = structuredClone(this.data);

    const config: BubbleConfig = {
      container,
      data: dataCopy,
      bubbleType: this.bubbleType,
      bubbleStyles: this.bubbleStyles,
      autoColors: this.autoColors,
      clearColors: this.clearColors,
      minRadiusLabels: this.minRadiusLabels,
      minRadiusAmounts: this.minRadiusAmounts,
      cutLabelsAt: this.cutLabelsAt,
      tooltip: (event) => {
        this.onTooltip?.(event);
        this.dispatchEvent(new CustomEvent('bubble-tooltip', { detail: event }));
      },
      nodeClickCallback: (node) => {
        this.onNodeClick?.(node);
        this.dispatchEvent(new CustomEvent('node-click', { detail: node }));
      },
    };

    this.tree = new BubbleTree(config);
    this.tree.setData(dataCopy);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'bubble-tree': BubbleTreeElement;
  }
}
