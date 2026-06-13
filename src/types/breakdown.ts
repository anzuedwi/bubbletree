/**
 * breakdown.ts
 *
 * A single segment of a donut chart rendered inside a bubble.
 * Breakdowns are optional — only DonutBubble uses them.
 */
export interface Breakdown {
  name?: string;
  amount: number;
  label?: string;
  famount?: string;
}
