/**
 * donutBreakdown.ts
 *
 * Dataset specifically shaped for the Donut bubble type — every leaf has a
 * `breakdowns` array, so the donut chart inside each circle has something
 * to render.
 */
import type { BubbleNode } from '../../types/bubbleNode.js';

export const donutBreakdown: BubbleNode = {
  id: 'energy',
  label: 'Energy Mix',
  amount: 1000,
  children: [
    {
      id: 'fossil',
      label: 'Fossil Fuels',
      amount: 580,
      color: '#cc4422',
      breakdowns: [
        { name: 'coal', label: 'Coal', amount: 240 },
        { name: 'gas', label: 'Natural Gas', amount: 220 },
        { name: 'oil', label: 'Oil', amount: 120 },
      ],
    },
    {
      id: 'nuclear',
      label: 'Nuclear',
      amount: 120,
      color: '#aa44aa',
      breakdowns: [
        { name: 'fission', label: 'Fission', amount: 110 },
        { name: 'fusion', label: 'Fusion (research)', amount: 10 },
      ],
    },
    {
      id: 'renewable',
      label: 'Renewable',
      amount: 300,
      color: '#22aa44',
      breakdowns: [
        { name: 'hydro', label: 'Hydro', amount: 120 },
        { name: 'wind', label: 'Wind', amount: 90 },
        { name: 'solar', label: 'Solar', amount: 70 },
        { name: 'geothermal', label: 'Geothermal', amount: 20 },
      ],
    },
  ],
};
