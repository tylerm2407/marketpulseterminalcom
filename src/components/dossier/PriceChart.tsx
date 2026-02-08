import { useState, useMemo } from 'react';
import type { StockData } from '@/types/stock';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Button } from '@/components/ui/button';
import { CHART_COLORS } from '@/lib/formatters';

type TimeRange = '1M' | '3M' | '6M' | '1Y' | 'ALL';

export function PriceChart({ stock }: { stock: StockData }) {
  const [range, setRange] = useState<TimeRange>('1Y');

  const filteredData = useMemo(() => {
    const data = stock.priceHistory;
    const now = new Date('2026-02-06');
    const cutoffMap: Record<TimeRange, number> = {
      '1M': 30,
      '3M': 90,
      '6M': 180,
      '1Y': 365,
      'ALL': 9999,
    };
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() - cutoffMap[range]);
    return data.filter(p => new Date(p.date) >= cutoff);
  }, [stock.priceHistory, range]);

  const priceData = filteredData.map(p => ({
    date: p.date,
    price: p.close,
    volume: p.volume,
  }));

  const ranges: TimeRange[] = ['1M', '3M', '6M', '1Y', 'ALL'];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1 overflow-x-auto pb-1 -mx-1 px-1">
        {ranges.map(r => (
          <Button
            key={r}
            variant={range === r ? 'default' : 'ghost'}
            size="sm"
            className={`h-9 sm:h-7 px-4 sm:px-3 text-xs touch-manipulation shrink-0 ${range === r ? 'bg-primary text-primary-foreground' : ''}`}
            onClick={() => setRange(r)}
          >
            {r}
          </Button>
        ))}
      </div>

      <div className="h-52 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={priceData}>
            <defs>
              <linearGradient id={`priceGrad-${stock.ticker}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART_COLORS.accent} stopOpacity={0.25} />
                <stop offset="100%" stopColor={CHART_COLORS.accent} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => {
                const d = new Date(v);
                return `${d.getMonth() + 1}/${d.getDate()}`;
              }}
              minTickGap={40}
            />
            <YAxis
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              width={50}
              domain={['auto', 'auto']}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid hsl(216,18%,90%)' }}
              formatter={(v: number) => [`$${v.toFixed(2)}`, 'Price']}
              labelFormatter={(label) => new Date(label).toLocaleDateString()}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke={CHART_COLORS.accent}
              strokeWidth={2}
              fill={`url(#priceGrad-${stock.ticker})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="h-20">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={priceData}>
            <XAxis dataKey="date" hide />
            <YAxis hide />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid hsl(216,18%,90%)' }}
              formatter={(v: number) => [`${(v / 1e6).toFixed(0)}M`, 'Volume']}
              labelFormatter={(label) => new Date(label).toLocaleDateString()}
            />
            <Bar dataKey="volume" fill={CHART_COLORS.muted} radius={[1, 1, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="text-xs text-muted-foreground italic">
        Not technical analysis advice — factual price behavior only.
      </p>
    </div>
  );
}
