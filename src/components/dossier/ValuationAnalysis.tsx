import type { StockData } from '@/types/stock';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { CHART_COLORS } from '@/lib/formatters';

export function ValuationAnalysis({ stock }: { stock: StockData }) {
  const { valuation } = stock;

  const multiplesData = [
    { metric: 'P/E', value: valuation.pe, sector: valuation.sectorMedian.pe, historical: valuation.historical5y.avgPe },
    { metric: 'P/S', value: valuation.ps, sector: valuation.sectorMedian.ps, historical: valuation.historical5y.avgPs },
    { metric: 'P/B', value: valuation.pb, sector: valuation.sectorMedian.pb, historical: valuation.historical5y.avgPb },
    { metric: 'EV/EBITDA', value: valuation.evEbitda, sector: valuation.sectorMedian.evEbitda, historical: null },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="P/E" value={valuation.pe} subtitle={`Fwd: ${valuation.forwardPe.toFixed(1)}`} />
        <MetricCard label="P/S" value={valuation.ps} subtitle={`Sector: ${valuation.sectorMedian.ps.toFixed(1)}`} />
        <MetricCard label="P/B" value={valuation.pb} subtitle={`Sector: ${valuation.sectorMedian.pb.toFixed(1)}`} />
        <MetricCard label="EV/EBITDA" value={valuation.evEbitda} subtitle={`PEG: ${valuation.pegRatio.toFixed(1)}`} />
      </div>

      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Valuation vs Sector Median</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={multiplesData} barGap={4}>
              <XAxis dataKey="metric" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={35} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid hsl(216,18%,90%)' }} />
              <Bar dataKey="value" name={stock.ticker} fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} />
              <Bar dataKey="sector" name="Sector Median" fill={CHART_COLORS.muted} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="p-4 bg-muted/50 rounded-lg border border-border">
        <h3 className="text-sm font-semibold text-foreground mb-2">Implied Market Expectations</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          At a P/E of {valuation.pe.toFixed(1)}x (vs sector median {valuation.sectorMedian.pe.toFixed(1)}x),
          the market implies {stock.name} will grow earnings ~{((valuation.pe / valuation.sectorMedian.pe - 1) * 100 / 3).toFixed(0)}% faster
          than peers annually over the next 3 years. Forward P/E of {valuation.forwardPe.toFixed(1)}x suggests
          analysts expect {((valuation.pe / valuation.forwardPe - 1) * 100).toFixed(0)}% earnings growth next year.
        </p>
      </div>

      <p className="text-xs text-muted-foreground italic">
        Valuation models are scenarios, not recommendations. Adjust assumptions to reflect your views.
      </p>
    </div>
  );
}

function MetricCard({ label, value, subtitle }: { label: string; value: number; subtitle: string }) {
  return (
    <div className="p-3 rounded-lg bg-muted/50 border border-border">
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className="text-xl font-bold text-foreground font-mono">{value.toFixed(1)}x</div>
      <div className="text-xs text-muted-foreground mt-0.5">{subtitle}</div>
    </div>
  );
}
