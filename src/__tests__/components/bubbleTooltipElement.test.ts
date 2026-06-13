/**
 * bubbleTooltipElement.test.ts — show/hide visibility toggling and position
 * update on bubble-tooltip events.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import type { BubbleTooltipElement } from '../../components/bubbleTooltipElement.js';
import type { TooltipEvent } from '../../types/tooltipEvent.js';
import { TooltipEventType } from '../../enums/tooltipEventType.js';
import type { BubbleNode } from '../../types/bubbleNode.js';

async function mount(): Promise<{
  tooltip: BubbleTooltipElement;
  target: HTMLElement;
}> {
  document.body.innerHTML = '';
  const target = document.createElement('div');
  target.id = 'tree';
  const tooltip = document.createElement('bubble-tooltip') as BubbleTooltipElement;
  tooltip.target = '#tree';
  document.body.append(target, tooltip);
  await tooltip.updateComplete;
  await Promise.resolve();
  return { tooltip, target };
}

function fakeEvent(type: TooltipEventType, node: BubbleNode): TooltipEvent {
  return {
    type,
    node,
    target: null,
    bubblePos: { x: 0, y: 0 },
    mousePos: { x: 120, y: 80 },
  };
}

describe('<bubble-tooltip>', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('starts hidden', async () => {
    const { tooltip } = await mount();
    expect(tooltip.hasAttribute('visible')).toBe(false);
  });

  it('becomes visible on a SHOW event', async () => {
    const { tooltip, target } = await mount();
    const node: BubbleNode = { label: 'Health', amount: 100 };
    target.dispatchEvent(
      new CustomEvent('bubble-tooltip', { detail: fakeEvent(TooltipEventType.Show, node) }),
    );
    await tooltip.updateComplete;
    expect(tooltip.hasAttribute('visible')).toBe(true);
    expect(tooltip.style.left).toBe('132px');
    expect(tooltip.style.top).toBe('92px');
  });

  it('hides on a HIDE event', async () => {
    const { tooltip, target } = await mount();
    const node: BubbleNode = { label: 'Health', amount: 100 };
    target.dispatchEvent(
      new CustomEvent('bubble-tooltip', { detail: fakeEvent(TooltipEventType.Show, node) }),
    );
    await tooltip.updateComplete;
    target.dispatchEvent(
      new CustomEvent('bubble-tooltip', { detail: fakeEvent(TooltipEventType.Hide, node) }),
    );
    await tooltip.updateComplete;
    expect(tooltip.hasAttribute('visible')).toBe(false);
  });

  it('renders the formatted amount', async () => {
    const { tooltip, target } = await mount();
    tooltip.formatValue = (n) => `$${n}`;
    const node: BubbleNode = { label: 'Health', amount: 42 };
    target.dispatchEvent(
      new CustomEvent('bubble-tooltip', { detail: fakeEvent(TooltipEventType.Show, node) }),
    );
    await tooltip.updateComplete;
    expect(tooltip.shadowRoot!.textContent).toContain('$42');
    expect(tooltip.shadowRoot!.textContent).toContain('Health');
  });
});
