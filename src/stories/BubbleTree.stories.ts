/**
 * BubbleTree.stories.ts
 *
 * Storybook stories for the `<bubble-tree>` custom element across multiple
 * datasets and bubble types.  These double as the visual catalogue and as
 * interaction smoke tests via @storybook/test.
 */
import type { Meta, StoryObj } from '@storybook/web-components';
import { expect, within, waitFor } from '@storybook/test';
import { html } from 'lit';

import { BubbleType } from '../enums/bubbleType.js';
import {
  governmentBudget,
  companyOrgChart,
  fileSystem,
  donutBreakdown,
  generateRandomTree,
} from './data/index.js';
import type { BubbleNode } from '../types/bubbleNode.js';

interface Args {
  data: BubbleNode;
  bubbleType: BubbleType;
  autoColors: boolean;
  minRadiusLabels: number;
  minRadiusAmounts: number;
  cutLabelsAt: number;
  height: string;
}

const meta: Meta<Args> = {
  title: 'BubbleTree/Visualisations',
  tags: ['autodocs'],
  argTypes: {
    bubbleType: {
      control: 'select',
      options: Object.values(BubbleType),
    },
    autoColors: { control: 'boolean' },
    minRadiusLabels: { control: { type: 'range', min: 10, max: 80, step: 5 } },
    minRadiusAmounts: { control: { type: 'range', min: 0, max: 60, step: 5 } },
    cutLabelsAt: { control: { type: 'range', min: 10, max: 100, step: 5 } },
    height: { control: 'text' },
  },
  render: (args) => html`
    <div style="height: ${args.height};">
      <bubble-tree
        .data=${args.data}
        bubble-type=${args.bubbleType}
        ?auto-colors=${args.autoColors}
        min-radius-labels=${args.minRadiusLabels}
        min-radius-amounts=${args.minRadiusAmounts}
        cut-labels-at=${args.cutLabelsAt}
        style="--bubble-tree-height: ${args.height};"
      ></bubble-tree>
    </div>
  `,
};

export default meta;

type Story = StoryObj<Args>;

/** Government spending — coloured manually per department. */
export const GovernmentBudget: Story = {
  args: {
    data: governmentBudget,
    bubbleType: BubbleType.Plain,
    autoColors: false,
    minRadiusLabels: 40,
    minRadiusAmounts: 20,
    cutLabelsAt: 50,
    height: '600px',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => {
      const svg = canvasElement.querySelector('bubble-tree')?.shadowRoot?.querySelector('svg');
      expect(svg).toBeTruthy();
    });
  },
};

/** Org chart — uses `name` keys and auto-generated colours. */
export const OrgChart: Story = {
  args: {
    ...GovernmentBudget.args,
    data: companyOrgChart,
    autoColors: true,
  },
};

/** Disk usage — deep + narrow tree. */
export const FileSystem: Story = {
  args: {
    ...GovernmentBudget.args,
    data: fileSystem,
    autoColors: true,
  },
};

/** Energy mix — donut renderer with breakdown segments. */
export const EnergyDonut: Story = {
  args: {
    ...GovernmentBudget.args,
    data: donutBreakdown,
    bubbleType: BubbleType.Donut,
  },
};

/** Procedurally generated tree — exercises deep fan-out. */
export const RandomTree: Story = {
  args: {
    ...GovernmentBudget.args,
    data: generateRandomTree({ seed: 7, depth: 3, fanout: 5 }),
    autoColors: true,
  },
};

/** Auto-colours starting from a single seed colour. */
export const AutoColours: Story = {
  args: {
    ...GovernmentBudget.args,
    data: governmentBudget,
    autoColors: true,
  },
};

/** Tiny container — exercises the "hide labels at small radius" branches. */
export const Compact: Story = {
  args: {
    ...GovernmentBudget.args,
    data: governmentBudget,
    height: '300px',
    minRadiusLabels: 30,
    minRadiusAmounts: 15,
    cutLabelsAt: 20,
  },
};
