/**
 * bubbleLegendElement.ts
 *
 * `<bubble-legend>` — colour-key legend for a BubbleTree.  Accepts a list
 * of `{ label, color }` entries via the `entries` property.  Purely
 * presentational; renders as a horizontal pill row by default but switches
 * to a vertical stack on narrow viewports via a container query.
 */
import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

export interface LegendEntry {
  label: string;
  color: string;
}

@customElement('bubble-legend')
export class BubbleLegendElement extends LitElement {
  @property({ attribute: false }) entries: LegendEntry[] = [];
  @property() title = 'Legend';

  static styles = css`
    :host {
      display: block;
      font-family: system-ui, sans-serif;
      font-size: 13px;
      container-type: inline-size;
    }
    .title {
      font-weight: 600;
      margin-bottom: 6px;
    }
    .row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .entry {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 3px 8px;
      background: #f5f5f5;
      border-radius: 999px;
    }
    .swatch {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }
    @container (max-width: 320px) {
      .row {
        flex-direction: column;
      }
    }
  `;

  render() {
    return html`
      <div class="title">${this.title}</div>
      <div class="row">
        ${this.entries.map(
          (e) => html`
            <span class="entry">
              <span class="swatch" style="background:${e.color}"></span>
              ${e.label}
            </span>
          `,
        )}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'bubble-legend': BubbleLegendElement;
  }
}
