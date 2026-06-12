/**
 * BubbleBreadcrumbs.stories.ts
 *
 * Stories combining `<bubble-tree>` + `<bubble-breadcrumbs>` to show the
 * breadcrumb trail respond to navigation events.
 */
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import { BubbleType } from '../enums/bubbleType.js';
import { governmentBudget } from './data/index.js';

const meta: Meta = {
  title: 'BubbleTree/Breadcrumbs',
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 8px; height: 640px;">
      <bubble-breadcrumbs target="#breadcrumb-tree"></bubble-breadcrumbs>
      <div style="flex: 1;">
        <bubble-tree
          id="breadcrumb-tree"
          .data=${governmentBudget}
          bubble-type=${BubbleType.Plain}
          ?auto-colors=${true}
        ></bubble-tree>
      </div>
    </div>
  `,
};
