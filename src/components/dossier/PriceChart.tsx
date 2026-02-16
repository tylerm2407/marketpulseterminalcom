import { useState, useMemo } from 'react';
import type { StockData, PricePoint } from '@/types/stock';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Line, LineChart, ComposedChart, ReferenceLine } from 'recharts';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { CHART_COLORS } from '@/lib/formatters';
import { SourceAttribution } from '@/components/SourceAttribution';

type TimeRange = '1M' | '3M' | '6M' | '1Y' | 'ALL';

interface Indicators {
  sma20: boolean;
  sma50: boolean;
  ema12: boolean;
  ema26: boolean;
  rsi: boolean;
}

function calculateSMA(data: number[], period: number): (number | null)[] {
  return data.map((_, i) => {
    if (i < period - 1) return null;
    const slice = data.slice(i - period + 1, i + 1);
    return slice.reduce((a, b) => a + b, 0) / period;
  });
}

function calculateEMA(data: number[], period: number): (number | null)[] {
  const result: (number | null)[] = [];
  const multiplier = 2 / (period + 1);
  let ema: number | null = null;

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null);
      continue;
    }
    if (ema === null) {
      // Seed with SMA
      ema = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
    } else {
      ema = (data[i] - ema) * multiplier + ema;
    }
    result.push(ema);
  }
  return result;
}

function calculateRSI(data: number[], period: number = 14): (number | null)[] {
  const result: (number | null)[] = [];
  if (data.length < period + 1) return data.map(() => null);

  const changes = data.map((v, i) => (i === 0 ? 0 : v - data[i - 1]));

  let avgGain = 0;
  let avgLoss = 0;

  // Initial average
  for (let i = 1; i <= period; i++) {
    if (changes[i] > 0) avgGain += changes[i];
    else avgLoss += Math.abs(changes[i]);
    result.push(null);
  }
  avgGain /= period;
  avgLoss /= period;

  // Remove the first null we added
  result.shift();

  for (let i = 0; i < period; i++) {
    result.push(null);
  }

  for (let i = period + 1; i < data.length; i++) {
    const change = changes[i];
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    result.push(100 - 100 / (1 + rs));
  }

  // Pad front
  while (result.length < data.length) {
    result.unshift(null);
  }

  return result.slice(0, data.length);
}

export function PriceChart({ stock }: { stock: StockData }) {
  const [range, setRange] = useState<TimeRange>('1Y');
  const [indicators, setIndicators] = useState<Indicators>({
    sma20: false,
    sma50: false,
    ema12: false,
    ema26: false,
    rsi: false,
  });

  const filteredData = useMemo(() => {
    const data = stock.priceHistory;
    const now = new Date();
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

  const chartData = useMemo(() => {
    const closes = filteredData.map(p => p.close);
    const sma20 = indicators.sma20 ? calculateSMA(closes, 20) : null;
    const sma50 = indicators.sma50 ? calculateSMA(closes, 50) : null;
    const ema12 = indicators.ema12 ? calculateEMA(closes, 12) : null;
    const ema26 = indicators.ema26 ? calculateEMA(closes, 26) : null;
    const rsi = indicators.rsi ? calculateRSI(closes, 14) : null;

    return filteredData.map((p, i) => ({
      date: p.date,
      price: p.close,
      volume: p.volume,
      ...(sma20 && { sma20: sma20[i] }),
      ...(sma50 && { sma50: sma50[i] }),
      ...(ema12 && { ema12: ema12[i] }),
      ...(ema26 && { ema26: ema26[i] }),
      ...(rsi && { rsi: rsi[i] }),
    }));
  }, [filteredData, indicators]);

  const hasOverlays = indicators.sma20 || indicators.sma50 || indicators.ema12 || indicators.ema26;
  const ranges: TimeRange[] = ['1M', '3M', '6M', '1Y', 'ALL'];

  const toggle = (key: keyof Indicators) => setIndicators(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="space-y-4">
      {/* Time range buttons */}
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

      {/* Indicator toggles */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="text-xs font-medium text-muted-foreground">Indicators:</span>
        {([
          ['sma20', 'SMA 20', CHART_COLORS.warning],
          ['sma50', 'SMA 50', CHART_COLORS.purple],
          ['ema12', 'EMA 12', CHART_COLORS.gain],
          ['ema26', 'EMA 26', CHART_COLORS.loss],
          ['rsi', 'RSI 14', CHART_COLORS.accent],
        ] as const).map(([key, label, color]) => (
          <label key={key} className="flex items-center gap-1.5 cursor-pointer">
            <Switch
              checked={indicators[key]}
              onCheckedChange={() => toggle(key)}
              className="h-4 w-7 [&>span]:h-3 [&>span]:w-3"
            />
            <span className="text-xs" style={{ color }}>{label}</span>
          </label>
        ))}
      </div>

      {/* Price chart with overlays */}
      <div className="h-52 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData}>
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
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid hsl(216,18%,90%)', background: 'hsl(var(--card))' }}
              formatter={(v: number, name: string) => {
                const labels: Record<string, string> = {
                  price: 'Price', sma20: 'SMA 20', sma50: 'SMA 50',
                  ema12: 'EMA 12', ema26: 'EMA 26',
                };
                return [`$${v.toFixed(2)}`, labels[name] || name];
              }}
              labelFormatter={(label) => new Date(label).toLocaleDateString()}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke={CHART_COLORS.accent}
              strokeWidth={2}
              fill={`url(#priceGrad-${stock.ticker})`}
            />
            {indicators.sma20 && <Line type="monotone" dataKey="sma20" stroke={CHART_COLORS.warning} strokeWidth={1.5} dot={false} connectNulls />}
            {indicators.sma50 && <Line type="monotone" dataKey="sma50" stroke={CHART_COLORS.purple} strokeWidth={1.5} dot={false} connectNulls />}
            {indicators.ema12 && <Line type="monotone" dataKey="ema12" stroke={CHART_COLORS.gain} strokeWidth={1.5} dot={false} connectNulls />}
            {indicators.ema26 && <Line type="monotone" dataKey="ema26" stroke={CHART_COLORS.loss} strokeWidth={1.5} dot={false} connectNulls />}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* RSI Panel */}
      {indicators.rsi && (
        <div className="h-24 border-t border-border pt-2">
          <div className="text-[10px] text-muted-foreground mb-1">RSI (14)</div>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis dataKey="date" hide />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 9 }}
                tickLine={false}
                axisLine={false}
                width={30}
                ticks={[30, 50, 70]}
              />
              <ReferenceLine y={70} stroke="hsl(var(--loss))" strokeDasharray="3 3" strokeOpacity={0.5} />
              <ReferenceLine y={30} stroke="hsl(var(--gain))" strokeDasharray="3 3" strokeOpacity={0.5} />
              <Tooltip
                contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid hsl(216,18%,90%)', background: 'hsl(var(--card))' }}
                formatter={(v: number) => [v.toFixed(1), 'RSI']}
                labelFormatter={(label) => new Date(label).toLocaleDateString()}
              />
              <Line type="monotone" dataKey="rsi" stroke={CHART_COLORS.accent} strokeWidth={1.5} dot={false} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Volume chart */}
      <div className="h-20">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
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

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground italic">
          Not technical analysis advice — factual price behavior only.
        </p>
        <SourceAttribution source="Polygon.io" />
      </div>
    </div>
  );
}
