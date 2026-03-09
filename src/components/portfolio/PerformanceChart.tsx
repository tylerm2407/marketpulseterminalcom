import { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';

type Period = '1W' | '1M' | '3M' | '1Y';

interface Holding {
  ticker: string;
  shares: number;
  buy_price: number;
  buy_date: string | null;
}

interface LiveQuote {
  ticker: string;
  price: number;
}

interface Props {
  holdings: Holding[];
  quoteMap: Map<string, LiveQuote>;
}

function generateHistoricalData(
  holdings: Holding[],
  quoteMap: Map<string, LiveQuote>,
  period: Period
) {
  const now = new Date();
  const days = period === '1W' ? 7 : period === '1M' ? 30 : period === '3M' ? 90 : 365;
  const points: { date: string; value: number }[] = [];

  // For each day, compute portfolio value using linear interpolation
  // from buy_price → current_price for each holding
  for (let i = days; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);

    let dayValue = 0;
    for (const h of holdings) {
      const buyDate = h.buy_date ? new Date(h.buy_date) : new Date(now.getTime() - 365 * 86400000);
      const currentPrice = quoteMap.get(h.ticker)?.price ?? h.buy_price;

      if (d < buyDate) continue; // not yet purchased

      const totalDays = Math.max((now.getTime() - buyDate.getTime()) / 86400000, 1);
      const elapsed = Math.max((d.getTime() - buyDate.getTime()) / 86400000, 0);
      const progress = Math.min(elapsed / totalDays, 1);

      // Simulate with slight daily noise for realism
      const basePrice = h.buy_price + (currentPrice - h.buy_price) * progress;
      const seed = dateStr.charCodeAt(dateStr.length - 1) + h.ticker.charCodeAt(0) + i;
      const noise = 1 + (((seed * 9301 + 49297) % 233280) / 233280 - 0.5) * 0.02;

      dayValue += h.shares * basePrice * noise;
    }

    const label =
      days <= 7
        ? d.toLocaleDateString('en-US', { weekday: 'short' })
        : days <= 30
          ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    points.push({ date: label, value: Math.round(dayValue * 100) / 100 });
  }

  // Reduce points for longer periods
  if (days > 30) {
    const step = Math.ceil(points.length / 60);
    return points.filter((_, i) => i % step === 0 || i === points.length - 1);
  }
  return points;
}

export function PerformanceChart({ holdings, quoteMap }: Props) {
  const [period, setPeriod] = useState<Period>('1M');

  const data = useMemo(
    () => generateHistoricalData(holdings, quoteMap, period),
    [holdings, quoteMap, period]
  );

  if (holdings.length === 0) return null;

  const first = data[0]?.value ?? 0;
  const last = data[data.length - 1]?.value ?? 0;
  const change = last - first;
  const positive = change >= 0;

  return (
    <Card className="mb-6">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-accent" />
          Portfolio Performance
          <span className={`text-sm font-mono ml-2 ${positive ? 'text-gain' : 'text-loss'}`}>
            {positive ? '+' : ''}{formatCurrency(change)}
          </span>
        </CardTitle>
        <ToggleGroup type="single" value={period} onValueChange={(v) => v && setPeriod(v as Period)} size="sm">
          {(['1W', '1M', '3M', '1Y'] as Period[]).map(p => (
            <ToggleGroupItem key={p} value={p} className="text-xs px-2.5 h-7">
              {p}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </CardHeader>
      <CardContent className="pt-0 pb-2">
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={positive ? 'hsl(var(--gain))' : 'hsl(var(--loss))'} stopOpacity={0.3} />
                <stop offset="100%" stopColor={positive ? 'hsl(var(--gain))' : 'hsl(var(--loss))'} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              hide
              domain={['auto', 'auto']}
            />
            <Tooltip
              contentStyle={{
                background: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px',
                color: 'hsl(var(--foreground))',
              }}
              formatter={(value: number) => [formatCurrency(value), 'Value']}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={positive ? 'hsl(var(--gain))' : 'hsl(var(--loss))'}
              strokeWidth={2}
              fill="url(#portfolioGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
