/**
 * BubbleLegend.stories.ts
 *
 * Standalone stories for the `<bubble-legend>` component.
 */
import type { Meta, StoryObj } from '@storybook/web-components';
import { expect, within } from '@storybook/test';
import { html } from 'lit';

import type { LegendEntry } from '../components/bubbleLegendElement.js';

interface Args {
  title: string;
  entries: LegendEntry[];
  width: string;
}

const meta: Meta<Args> = {
  title: 'Components/Legend',
  tags: ['autodocs'],
  argTypes: {
    width: { control: 'text' },
  },
  render: (args) => html`
    <div style="width: ${args.width}; border: 1px dashed #ccc; padding: 8px;">
      <bubble-legend title=${args.title} .entries=${args.entries}></bubble-legend>
    </div>
  `,
};

export default meta;
type Story = StoryObj<Args>;

const sampleEntries: LegendEntry[] = [
  { label: 'Health', color: '#d62728' },
  { label: 'Education', color: '#2ca02c' },
  { label: 'Defence', color: '#9467bd' },
  { label: 'Transport', color: '#ff7f0e' },
  { label: 'Welfare', color: '#8c564b' },
];

export const Horizontal: Story = {
  args: { title: 'Departments', entries: sampleEntries, width: '600px' },
  play: async ({ canvasElement }) => {
    const legend = canvasElement.querySelector('bubble-legend');
    expect(legend).toBeTruthy();
    // Light DOM check: ensure all 5 entries got rendered.
    const swatches = legend?.shadowRoot?.querySelectorAll('.entry');
    expect(swatches?.length).toBe(sampleEntries.length);
  },
};

export const Stacked: Story = {
  args: { title: 'Departments', entries: sampleEntries, width: '260px' },
};
