/**
 * BubbleTooltip.stories.ts
 *
 * Stories that combine `<bubble-tree>` with `<bubble-tooltip>` to show the
 * tooltip presenting node data on hover.
 */
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import { BubbleType } from '../enums/bubbleType.js';
import { governmentBudget } from './data/index.js';
import { formatNumber } from '../util/format.js';

const meta: Meta = {
  title: 'BubbleTree/Tooltip',
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj;

/** Plain bubbles plus a floating tooltip card. */
export const Default: Story = {
  render: () => html`
    <div style="position: relative; height: 600px;">
      <bubble-tree
        id="tooltip-tree"
        .data=${governmentBudget}
        bubble-type=${BubbleType.Plain}
        ?auto-colors=${true}
      ></bubble-tree>
      <bubble-tooltip
        target="#tooltip-tree"
        .formatValue=${formatNumber}
      ></bubble-tooltip>
    </div>
  `,
};

/** Donut bubbles with the same tooltip. */
export const WithDonuts: Story = {
  render: () => html`
    <div style="position: relative; height: 600px;">
      <bubble-tree
        id="donut-tooltip-tree"
        .data=${governmentBudget}
        bubble-type=${BubbleType.Donut}
        ?auto-colors=${true}
      ></bubble-tree>
      <bubble-tooltip
        target="#donut-tooltip-tree"
        .formatValue=${formatNumber}
      ></bubble-tooltip>
    </div>
  `,
};
