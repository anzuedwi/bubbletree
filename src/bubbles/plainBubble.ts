/**
 * plainBubble.ts
 *
 * The default bubble renderer: a solid filled circle with an optional
 * dashed inner ring (shown when the node has multiple children) and two
 * levels of HTML label:
 *
 *   r ≥ minRadiusLabels   → inner label (amount + description)
 *   r ≥ minRadiusAmounts  → inner label, description hidden
 *   r ≥ minRadiusHide     → inner label hidden, outer label shown
 *   r < minRadiusHide     → both labels hidden
 *
 * Replaces BubbleTree.Bubbles.Plain (Raphael + jQuery).
 */
import { BaseBubble } from './baseBubble.js';

export class PlainBubble extends BaseBubble {
  show(): void {
    const r = Math.max(5, this.bubbleRad * this.tree.bubbleScale);
    this.circle = this.createCircle(r);
    this.dashedBorder = this.createDashedBorder(r - 3, '4 4');
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
  }

  hide(): void {
    this.circle?.remove();
    this.dashedBorder?.remove();
    this.label?.remove();
    this.label2?.remove();
    this.circle = this.dashedBorder = null;
    this.label = this.label2 = null;
    this.visible = false;
  }

  draw(): void {
    if (!this.visible) return;
    this.computePosition();
    const r = Math.max(5, this.bubbleRad * this.tree.bubbleScale);
    const config = this.tree.config;

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
        r: String(Math.max(0, r - 4)),
        'stroke-opacity': String(this.alpha * 0.9),
      });
    } else {
      this.setOrHide(this.dashedBorder, { 'stroke-opacity': '0' });
    }

    if (this.label && this.label2) {
      const desc = this.label.querySelector<HTMLElement>('.bubbletree-desc');

      // Start fully visible, then hide progressively as the radius shrinks.
      // The thresholds form a single cascade (largest radius first):
      //   r >= minRadiusLabels   inner amount + description, no outer label
      //   r >= minRadiusAmounts  inner amount only, outer label shown
      //   r >= minRadiusHide…    outer label only
      //   smaller                nothing
      this.label.hidden = false;
      this.label2.hidden = false;
      if (desc) desc.hidden = false;

      if (r >= config.minRadiusLabels) {
        this.label2.hidden = true;
      } else if (r >= config.minRadiusAmounts) {
        if (desc) desc.hidden = true;
      } else if (r >= config.minRadiusHideLabels) {
        this.label.hidden = true;
      } else {
        this.label.hidden = true;
        this.label2.hidden = true;
      }
    }

    this.positionPrimaryLabel(r);
    this.positionSecondaryLabel(r);
  }
}
