import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp, ArrowDown, Plus, X, GitCompareArrows, Search } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useStockDossier } from '@/hooks/useStockData';
import { stockDirectory } from '@/data/stockDirectory';
import { formatCurrency, formatLargeNumber, formatPercent } from '@/lib/formatters';
import type { StockData } from '@/types/stock';

function CompareSearch({ onSelect, excludeTickers }: { onSelect: (ticker: string) => void; excludeTickers: string[] }) {
  const [query, setQuery] = useState('');
  const results = query.length >= 1
    ? stockDirectory
        .filter(s => !excludeTickers.includes(s.t))
        .filter(s => s.t.toLowerCase().includes(query.toLowerCase()) || s.n.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 6)
    : [];

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Add stock to compare..."
          className="pl-9 h-10"
        />
      </div>
      {results.length > 0 && (
        <div className="absolute z-20 top-full mt-1 w-full bg-card border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {results.map(s => (
            <button
              key={s.t}
              onClick={() => { onSelect(s.t); setQuery(''); }}
              className="w-full px-3 py-2 text-left hover:bg-muted transition-colors flex items-center gap-2 text-sm"
            >
              <span className="font-bold font-mono text-foreground">{s.t}</span>
              <span className="text-muted-foreground truncate">{s.n}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function StockColumn({ ticker, onRemove }: { ticker: string; onRemove: () => void }) {
  const { data: stock, isLoading } = useStockDossier(ticker);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-6 w-20" />
        {Array.from({ length: 15 }).map((_, i) => (
          <Skeleton key={i} className="h-5 w-full" />
        ))}
      </div>
    );
  }

  if (!stock) return <div className="text-sm text-muted-foreground">Failed to load {ticker}</div>;

  return <StockMetrics stock={stock} onRemove={onRemove} />;
}

function StockMetrics({ stock, onRemove }: { stock: StockData; onRemove: () => void }) {
  const isPositive = stock.change >= 0;
  const latestAnnual = stock.financials.annual[0];
  const prevAnnual = stock.financials.annual[1];
  const revenueGrowth = prevAnnual && prevAnnual.revenue > 0
    ? ((latestAnnual?.revenue - prevAnnual.revenue) / prevAnnual.revenue) * 100
    : null;

  return (
    <div className="space-y-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <Link to={`/stock/${stock.ticker}`} className="group">
          <span className="font-bold font-mono text-foreground group-hover:text-accent transition-colors">{stock.ticker}</span>
          <div className="text-xs text-muted-foreground truncate max-w-[140px]">{stock.name}</div>
        </Link>
        <button onClick={onRemove} className="p-1 rounded hover:bg-muted transition-colors">
          <X className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>
      {/* Metrics */}
      <MetricRow label="Price" value={formatCurrency(stock.price)} />
      <MetricRow label="Change" value={formatPercent(stock.changePercent)} className={isPositive ? 'text-gain' : 'text-loss'} />
      <MetricRow label="Market Cap" value={formatLargeNumber(stock.marketCap)} />
      <MetricRow label="P/E" value={stock.valuation.pe > 0 ? stock.valuation.pe.toFixed(1) + 'x' : 'N/A'} />
      <MetricRow label="Forward P/E" value={stock.valuation.forwardPe > 0 ? stock.valuation.forwardPe.toFixed(1) + 'x' : 'N/A'} />
      <MetricRow label="P/S" value={stock.valuation.ps > 0 ? stock.valuation.ps.toFixed(1) + 'x' : 'N/A'} />
      <MetricRow label="P/B" value={stock.valuation.pb > 0 ? stock.valuation.pb.toFixed(1) + 'x' : 'N/A'} />
      <MetricRow label="EV/EBITDA" value={stock.valuation.evEbitda > 0 ? stock.valuation.evEbitda.toFixed(1) + 'x' : 'N/A'} />
      <MetricRow label="Revenue" value={latestAnnual ? formatLargeNumber(latestAnnual.revenue) : 'N/A'} />
      <MetricRow label="Rev Growth" value={revenueGrowth !== null ? `${revenueGrowth >= 0 ? '+' : ''}${revenueGrowth.toFixed(1)}%` : 'N/A'}
        className={revenueGrowth !== null ? (revenueGrowth >= 0 ? 'text-gain' : 'text-loss') : ''} />
      <MetricRow label="Net Margin" value={latestAnnual ? `${latestAnnual.netMargin.toFixed(1)}%` : 'N/A'} />
      <MetricRow label="Op Margin" value={latestAnnual ? `${latestAnnual.operatingMargin.toFixed(1)}%` : 'N/A'} />
      <MetricRow label="FCF" value={latestAnnual ? formatLargeNumber(latestAnnual.freeCashFlow) : 'N/A'} />
      <MetricRow label="Debt/Assets" value={latestAnnual && latestAnnual.totalAssets > 0
        ? `${((latestAnnual.totalDebt / latestAnnual.totalAssets) * 100).toFixed(0)}%` : 'N/A'} />
      <MetricRow label="Current Ratio" value={latestAnnual ? latestAnnual.currentRatio.toFixed(2) : 'N/A'} />
      <MetricRow label="Div Yield" value={stock.dividendYield > 0 ? `${stock.dividendYield.toFixed(2)}%` : '—'} />
      <MetricRow label="Beta" value={stock.beta > 0 ? stock.beta.toFixed(2) : 'N/A'} />
      <MetricRow label="Employees" value={stock.employees > 0 ? stock.employees.toLocaleString() : 'N/A'} />
    </div>
  );
}

function MetricRow({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`text-xs font-mono font-medium ${className || 'text-foreground'}`}>{value}</span>
    </div>
  );
}

const METRIC_LABELS = [
  'Price', 'Change', 'Market Cap', 'P/E', 'Forward P/E', 'P/S', 'P/B', 'EV/EBITDA',
  'Revenue', 'Rev Growth', 'Net Margin', 'Op Margin', 'FCF', 'Debt/Assets', 'Current Ratio',
  'Div Yield', 'Beta', 'Employees',
];

const StockComparison = () => {
  const [tickers, setTickers] = useState<string[]>(['AAPL', 'MSFT']);

  const addTicker = (ticker: string) => {
    if (tickers.length < 4 && !tickers.includes(ticker)) {
      setTickers(prev => [...prev, ticker]);
    }
  };

  const removeTicker = (ticker: string) => {
    setTickers(prev => prev.filter(t => t !== ticker));
  };

  return (
    <div className="min-h-screen bg-background pb-16 sm:pb-0">
      <section className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-accent/10 text-accent">
            <GitCompareArrows className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Compare Stocks</h1>
            <p className="text-sm text-muted-foreground">Side-by-side comparison of key metrics</p>
          </div>
        </div>

        {/* Add stocks */}
        {tickers.length < 4 && (
          <div className="max-w-sm mb-6">
            <CompareSearch onSelect={addTicker} excludeTickers={tickers} />
          </div>
        )}

        {tickers.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <GitCompareArrows className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p className="text-sm">Search and add stocks to compare them side by side.</p>
          </div>
        )}

        {tickers.length > 0 && (
          <div className="overflow-x-auto -mx-4 px-4">
            <div className="flex gap-4 min-w-0" style={{ minWidth: tickers.length * 220 }}>
              {/* Labels column */}
              <div className="w-0 sm:w-24 shrink-0 hidden sm:block">
                <div className="h-[60px]" /> {/* spacer for header */}
                {METRIC_LABELS.map(label => (
                  <div key={label} className="py-1.5 border-b border-border/50 last:border-0">
                    <span className="text-xs text-muted-foreground">{label}</span>
                  </div>
                ))}
              </div>
              {/* Stock columns */}
              {tickers.map(ticker => (
                <div key={ticker} className="flex-1 min-w-[200px] bg-card rounded-lg border border-border p-4">
                  <StockColumn ticker={ticker} onRemove={() => removeTicker(ticker)} />
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
};

export default StockComparison;
