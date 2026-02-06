export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatLargeNumber(value: number): string {
  if (Math.abs(value) >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (Math.abs(value) >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (Math.abs(value) >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (Math.abs(value) >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
  return `$${value.toLocaleString()}`;
}

export function formatCompactNumber(value: number): string {
  if (Math.abs(value) >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
  if (Math.abs(value) >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
  if (Math.abs(value) >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  return value.toLocaleString();
}

export function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

export function formatMargin(value: number): string {
  return `${value.toFixed(1)}%`;
}

export const CHART_COLORS = {
  primary: 'hsl(215, 50%, 16%)',
  accent: 'hsl(172, 66%, 32%)',
  warning: 'hsl(38, 92%, 50%)',
  gain: 'hsl(152, 56%, 38%)',
  loss: 'hsl(0, 72%, 51%)',
  purple: 'hsl(262, 60%, 55%)',
  muted: 'hsl(215, 15%, 46%)',
};

export const SEGMENT_COLORS = [
  'hsl(215, 50%, 16%)',
  'hsl(172, 66%, 32%)',
  'hsl(38, 92%, 50%)',
  'hsl(262, 60%, 55%)',
  'hsl(0, 72%, 51%)',
  'hsl(195, 70%, 45%)',
  'hsl(330, 60%, 50%)',
];
