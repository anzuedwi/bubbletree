/**
 * format.ts
 *
 * Number formatting utilities.  formatNumber() is the default
 * BubbleConfig.formatValue implementation, expressing large values
 * as human-readable suffixed strings (1.2k, 3.4m, etc.).
 */
export function formatNumber(value: number): string {
  let prefix = '';
  let n = value;
  if (n < 0) {
    n = -n;
    prefix = '-';
  }
  if (n >= 1_000_000_000_000) return `${prefix}${Math.round(n / 100_000_000_000) / 10}t`;
  if (n >= 1_000_000_000) return `${prefix}${Math.round(n / 100_000_000) / 10}b`;
  if (n >= 1_000_000) return `${prefix}${Math.round(n / 100_000) / 10}m`;
  if (n >= 1_000) return `${prefix}${Math.round(n / 100) / 10}k`;
  return `${prefix}${n}`;
}
