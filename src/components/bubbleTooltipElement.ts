/**
 * bubbleTooltipElement.ts
 *
 * `<bubble-tooltip>` — a reusable floating tooltip card.  Listens to
 * `bubble-tooltip` events bubbling up from a `<bubble-tree>` (or any
 * element that dispatches a CustomEvent with a {@link TooltipEvent} detail)
 * and positions itself next to the cursor.
 *
 * The tooltip is purely presentational: it does not know anything about
 * BubbleTree internals other than the shape of the event payload.
 */
import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import { TooltipEventType } from '../enums/tooltipEventType.js';
import type { TooltipEvent } from '../types/tooltipEvent.js';
import type { BubbleNode } from '../types/bubbleNode.js';

@customElement('bubble-tooltip')
export class BubbleTooltipElement extends LitElement {
  /** Selector of the element whose tooltip events we listen to. */
  @property() target = 'bubble-tree';

  /** Custom formatter for the amount line. */
  @property({ attribute: false })
  formatValue: (n: number) => string = (n) => String(n);

  @state() private node: BubbleNode | null = null;
  @state() private posX = 0;
  @state() private posY = 0;
  @state() private visible = false;

  private targetEl: Element | null = null;
  private boundHandler = (event: Event) => this.handle(event as CustomEvent<TooltipEvent>);

  static styles = css`
    :host {
      position: absolute;
      pointer-events: none;
      z-index: 9999;
      max-width: 220px;
      font-family: system-ui, sans-serif;
      font-size: 13px;
      background: #fff;
      border: 1px solid #bbb;
      border-radius: 4px;
      box-shadow: 3px 3px 8px rgba(0 0 0 / 0.2);
      padding: 8px 10px;
      transition: opacity 120ms ease, translate 120ms ease;
      opacity: 0;
      translate: 8px 8px;
    }
    :host([visible]) {
      opacity: 1;
    }
    h4 {
      margin: 0 0 4px;
      font-size: 13px;
      font-weight: 600;
    }
    .amount {
      font-weight: 600;
      color: #333;
    }
    .desc {
      color: #666;
      font-size: 12px;
      margin-top: 4px;
    }
  `;

  connectedCallback(): void {
    super.connectedCallback();
    // Defer the lookup so the target element has time to upgrade.
    queueMicrotask(() => this.attachListeners());
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.detachListeners();
  }

  private attachListeners(): void {
    this.targetEl = document.querySelector(this.target);
    this.targetEl?.addEventListener('bubble-tooltip', this.boundHandler);
  }

  private detachListeners(): void {
    this.targetEl?.removeEventListener('bubble-tooltip', this.boundHandler);
    this.targetEl = null;
  }

  /** Position the tooltip and toggle visibility based on the event type. */
  private handle(event: CustomEvent<TooltipEvent>): void {
    const detail = event.detail;
    if (detail.type === TooltipEventType.Hide) {
      this.visible = false;
      this.removeAttribute('visible');
      return;
    }
    this.node = detail.node;
    this.posX = detail.mousePos.x + 12;
    this.posY = detail.mousePos.y + 12;
    this.visible = true;
    this.setAttribute('visible', '');
    this.style.left = `${this.posX}px`;
    this.style.top = `${this.posY}px`;
  }

  render() {
    if (!this.node) return html``;
    return html`
      <h4>${this.node.label ?? this.node.name ?? 'Unnamed'}</h4>
      <div class="amount">${this.formatValue(this.node.amount)}</div>
      ${this.node.shortLabel && this.node.shortLabel !== this.node.label
        ? html`<div class="desc">${this.node.shortLabel}</div>`
        : ''}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'bubble-tooltip': BubbleTooltipElement;
  }
}
