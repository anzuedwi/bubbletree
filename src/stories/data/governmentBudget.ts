/**
 * governmentBudget.ts
 *
 * Government spending example.  Three levels deep, hand-tuned colours
 * matching the original demo, useful for showing the "donut" bubble type
 * with breakdowns.
 */
import type { BubbleNode } from '../../types/bubbleNode.js';

export const governmentBudget: BubbleNode = {
  id: 'total',
  label: 'Total Spending 2024',
  amount: 4200000,
  color: '#1f77b4',
  children: [
    {
      id: 'health',
      label: 'Health',
      amount: 1280000,
      color: '#d62728',
      children: [
        { id: 'h-hospitals', label: 'Hospitals', amount: 720000 },
        { id: 'h-public-health', label: 'Public Health', amount: 240000 },
        { id: 'h-research', label: 'Medical Research', amount: 180000 },
        { id: 'h-medicines', label: 'Subsidised Medicines', amount: 140000 },
      ],
    },
    {
      id: 'education',
      label: 'Education',
      amount: 980000,
      color: '#2ca02c',
      children: [
        { id: 'e-primary', label: 'Primary Schools', amount: 410000 },
        { id: 'e-secondary', label: 'Secondary Schools', amount: 320000 },
        { id: 'e-tertiary', label: 'Universities', amount: 180000 },
        { id: 'e-vocational', label: 'Vocational Training', amount: 70000 },
      ],
    },
    {
      id: 'defence',
      label: 'Defence',
      amount: 620000,
      color: '#9467bd',
      children: [
        { id: 'd-personnel', label: 'Personnel', amount: 280000 },
        { id: 'd-equipment', label: 'Equipment', amount: 220000 },
        { id: 'd-ops', label: 'Operations', amount: 120000 },
      ],
    },
    {
      id: 'transport',
      label: 'Transport',
      amount: 540000,
      color: '#ff7f0e',
      children: [
        { id: 't-roads', label: 'Roads', amount: 240000 },
        { id: 't-rail', label: 'Rail', amount: 180000 },
        { id: 't-aviation', label: 'Aviation', amount: 60000 },
        { id: 't-ports', label: 'Ports', amount: 60000 },
      ],
    },
    {
      id: 'welfare',
      label: 'Social Welfare',
      amount: 780000,
      color: '#8c564b',
      children: [
        { id: 'w-pensions', label: 'Pensions', amount: 420000 },
        { id: 'w-unemployment', label: 'Unemployment', amount: 180000 },
        { id: 'w-disability', label: 'Disability', amount: 110000 },
        { id: 'w-housing', label: 'Housing Assistance', amount: 70000 },
      ],
    },
  ],
};
