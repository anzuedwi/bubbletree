/**
 * companyOrgChart.ts
 *
 * Headcount-by-department dataset.  Uses the `name` field instead of `id`
 * so it exercises the styleByName lookup path in BubbleStyles.
 */
import type { BubbleNode } from '../../types/bubbleNode.js';

export const companyOrgChart: BubbleNode = {
  name: 'company',
  label: 'Acme Corp',
  amount: 1240,
  children: [
    {
      name: 'engineering',
      label: 'Engineering',
      amount: 480,
      children: [
        { name: 'platform', label: 'Platform', amount: 120 },
        { name: 'product-eng', label: 'Product Engineering', amount: 180 },
        { name: 'data-eng', label: 'Data Engineering', amount: 80 },
        { name: 'sre', label: 'SRE', amount: 60 },
        { name: 'security', label: 'Security', amount: 40 },
      ],
    },
    {
      name: 'sales',
      label: 'Sales',
      amount: 220,
      children: [
        { name: 'enterprise', label: 'Enterprise', amount: 90 },
        { name: 'smb', label: 'SMB', amount: 80 },
        { name: 'partnerships', label: 'Partnerships', amount: 50 },
      ],
    },
    {
      name: 'marketing',
      label: 'Marketing',
      amount: 140,
      children: [
        { name: 'brand', label: 'Brand', amount: 35 },
        { name: 'growth', label: 'Growth', amount: 55 },
        { name: 'product-mkt', label: 'Product Marketing', amount: 50 },
      ],
    },
    {
      name: 'cs',
      label: 'Customer Success',
      amount: 180,
      children: [
        { name: 'support', label: 'Support', amount: 110 },
        { name: 'onboarding', label: 'Onboarding', amount: 40 },
        { name: 'professional-services', label: 'Professional Services', amount: 30 },
      ],
    },
    {
      name: 'gna',
      label: 'G&A',
      amount: 90,
      children: [
        { name: 'finance', label: 'Finance', amount: 25 },
        { name: 'legal', label: 'Legal', amount: 15 },
        { name: 'people', label: 'People Ops', amount: 30 },
        { name: 'it', label: 'IT', amount: 20 },
      ],
    },
    {
      name: 'research',
      label: 'Research',
      amount: 130,
    },
  ],
};
