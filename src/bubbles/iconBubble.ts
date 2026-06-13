/**
 * iconBubble.ts
 *
 * Bubble renderer that fetches an external SVG icon and renders its path
 * data inside the circle.  Icons are loaded via fetch(), cached in a
 * module-level Map, and scaled/translated with an SVG transform attribute.
 *
 * Replaces BubbleTree.Bubbles.Icon (Raphael + jQuery + vis4loader).
 * Key differences from the original:
 *  - fetch() instead of vis4loader XHR
 *  - DOMParser instead of jQuery $(svg) wrapping
 *  - Module-level Map for deduplication (was per-instance)
 */
import { BaseBubble } from './baseBubble.js';
import { createSvgElement } from '../util/dom.js';

const iconCache = new Map<string, Promise<string>>();

async function loadIconPathData(url: string): Promise<string> {
  let promise = iconCache.get(url);
  if (!promise) {
    promise = (async () => {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to load icon ${url}: ${response.status}`);
      const text = await response.text();
      const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
      const paths = doc.querySelectorAll('path');
      let combined = '';
      paths.forEach((p) => {
        const d = p.getAttribute('d');
        if (d) combined += `${d} `;
      });
      return combined.trim();
    })();
    iconCache.set(url, promise);
  }
  return promise;
}

export class IconBubble extends BaseBubble {
  private hasIcon = false;
  private iconLoaded = false;
  private iconPathData = '';
  private iconPath: SVGPathElement | null = null;

  show(): void {
    this.hasIcon = Boolean(this.node.icon);
    const r = Math.max(5, this.bubbleRad * this.tree.bubbleScale);
    this.circle = this.createCircle(r);
    this.dashedBorder = this.createDashedBorder(Math.min(r - 3, r * 0.95), '4 4');
    this.tree.svg.append(this.circle, this.dashedBorder);

    this.label = this.createPrimaryLabel();
    this.label2 = this.createSecondaryLabel();
    this.tree.container.append(this.label, this.label2);

    if ((this.node.children?.length ?? 0) > 0) {
      this.circle.style.cursor = 'pointer';
      this.label.style.cursor = 'pointer';
    }

    this.attachInteractions([this.circle, this.label, this.dashedBorder]);
    this.visible = true;

    if (this.hasIcon) void this.loadIcon();
  }

  hide(): void {
    this.circle?.remove();
    this.dashedBorder?.remove();
    this.label?.remove();
    this.label2?.remove();
    this.iconPath?.remove();
    this.circle = this.dashedBorder = null;
    this.label = this.label2 = null;
    this.iconPath = null;
    this.visible = false;
  }

  private async loadIcon(): Promise<void> {
    if (!this.node.icon) return;
    const url = `${this.tree.config.rootPath}${this.node.icon}`;
    try {
      this.iconPathData = await loadIconPathData(url);
      this.iconLoaded = true;
      this.displayIcon();
    } catch {
      this.iconLoaded = false;
    }
  }

  private displayIcon(): void {
    if (!this.iconPathData || !this.visible) return;
    const path = createSvgElement('path');
    path.classList.add('bubbletree-icon');
    path.setAttribute('d', this.iconPathData);
    path.setAttribute('fill', '#fff');
    this.tree.svg.append(path);
    this.iconPath = path;
    this.draw();
  }

  draw(): void {
    if (!this.visible) return;
    this.computePosition();
    const r = Math.max(5, this.bubbleRad * this.tree.bubbleScale);
    const showIcon = this.hasIcon && r > 15;
    const showLabel = this.hasIcon ? r > 40 : r > 20;

    this.setOrHide(this.circle, {
      cx: String(this.pos.x),
      cy: String(this.pos.y),
      r: String(r),
      'fill-opacity': String(this.alpha),
    });

    if ((this.node.children?.length ?? 0) > 1) {
      this.setOrHide(this.dashedBorder, {
        cx: String(this.pos.x),
        cy: String(this.pos.y),
        r: String(Math.min(r - 3, r - 4)),
        'stroke-opacity': String(this.alpha * 0.9),
      });
    } else {
      this.setOrHide(this.dashedBorder, { 'stroke-opacity': '0' });
    }

    if (this.label && this.label2) {
      const desc = this.label.querySelector<HTMLElement>('.bubbletree-desc');
      this.label.hidden = !showLabel;
      this.label2.hidden = showLabel && !((showIcon && r < 70) || (!showIcon && r < 40));
      if (desc) desc.hidden = showLabel && ((showIcon && r < 70) || (!showIcon && r < 40));
    }

    if (this.label) {
      const labelHeight = this.label.offsetHeight;
      const ly = showIcon ? this.pos.y + r * 0.77 - labelHeight : this.pos.y - labelHeight * 0.5;
      const w = showIcon ? r * 1.2 : 2 * r;
      const x = showIcon ? this.pos.x - r * 0.6 : this.pos.x - r;
      this.label.style.setProperty('--bt-label-width', `${w}px`);
      this.label.style.setProperty('--bt-label-x', `${x}px`);
      this.label.style.setProperty('--bt-label-y', `${ly}px`);
      this.label.style.setProperty('--bt-label-opacity', String(this.alpha));
    }

    this.positionSecondaryLabel(r);

    if (this.iconPath && this.iconLoaded) {
      if (showIcon && this.label) {
        const labelHeight = showLabel ? this.label.offsetHeight : 0;
        const scale = (r - labelHeight * 0.5) / 60;
        const tx = this.pos.x / scale - 50;
        const ty = (this.pos.y - labelHeight * 0.5) / scale - 50;
        this.iconPath.setAttribute('transform', `scale(${scale}) translate(${tx}, ${ty})`);
        this.iconPath.setAttribute('fill-opacity', String(this.alpha));
      } else {
        this.iconPath.setAttribute('fill-opacity', '0');
      }
    }
  }
}
