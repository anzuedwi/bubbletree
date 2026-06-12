/**
 * bubbleBreadcrumbsElement.ts
 *
 * `<bubble-breadcrumbs>` — navigation breadcrumbs that update in response
 * to `node-click` events from an associated `<bubble-tree>`.  Click a crumb
 * to dispatch a `breadcrumb-navigate` event whose detail is the chosen node.
 */
import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import type { BubbleNode } from '../types/bubbleNode.js';

@customElement('bubble-breadcrumbs')
export class BubbleBreadcrumbsElement extends LitElement {
  /** Selector of the element whose node-click events we follow. */
  @property() target = 'bubble-tree';

  /** Label used for the root crumb when the data has no root label. */
  @property({ attribute: 'root-label' }) rootLabel = 'Root';

  @state() private trail: BubbleNode[] = [];

  private targetEl: Element | null = null;
  private boundHandler = (event: Event) =>
    this.handleClick(event as CustomEvent<BubbleNode>);

  static styles = css`
    :host {
      display: block;
      font-family: system-ui, sans-serif;
      font-size: 13px;
      padding: 6px 10px;
      background: #fafafa;
      border-radius: 4px;
    }
    ol {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }
    li {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    li + li::before {
      content: '›';
      color: #999;
    }
    button {
      background: none;
      border: none;
      padding: 2px 4px;
      color: #0066cc;
      cursor: pointer;
      font: inherit;
      border-radius: 2px;
      &:hover {
        background: #e6f0ff;
      }
      &:disabled {
        color: #333;
        cursor: default;
        font-weight: 600;
      }
    }
  `;

  connectedCallback(): void {
    super.connectedCallback();
    queueMicrotask(() => {
      this.targetEl = document.querySelector(this.target);
      this.targetEl?.addEventListener('node-click', this.boundHandler);
    });
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.targetEl?.removeEventListener('node-click', this.boundHandler);
  }

  /** Build the path from root → node and store it. */
  private handleClick(event: CustomEvent<BubbleNode>): void {
    const path: BubbleNode[] = [];
    let cursor: BubbleNode | undefined = event.detail;
    while (cursor) {
      path.unshift(cursor);
      cursor = cursor.parent;
    }
    this.trail = path;
  }

  private navigate(node: BubbleNode): void {
    this.dispatchEvent(
      new CustomEvent('breadcrumb-navigate', { detail: node, bubbles: true }),
    );
  }

  render() {
    if (this.trail.length === 0) {
      return html`<ol>
        <li>
          <button disabled>${this.rootLabel}</button>
        </li>
      </ol>`;
    }
    return html`
      <ol>
        ${this.trail.map(
          (node, i) => html`
            <li>
              <button
                ?disabled=${i === this.trail.length - 1}
                @click=${() => this.navigate(node)}
              >
                ${node.label ?? node.name ?? this.rootLabel}
              </button>
            </li>
          `,
        )}
      </ol>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'bubble-breadcrumbs': BubbleBreadcrumbsElement;
  }
}
