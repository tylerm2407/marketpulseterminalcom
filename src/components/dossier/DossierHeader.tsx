import { ArrowDown, ArrowUp, Eye, EyeOff, FileDown, Share2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { StockData } from '@/types/stock';
import { useWatchlistStore } from '@/stores/watchlistStore';
import { formatLargeNumber, formatCurrency, formatPercent, formatNumber } from '@/lib/formatters';

export function DossierHeader({ stock }: { stock: StockData }) {
  const { addTicker, removeTicker } = useWatchlistStore();
  const watching = useWatchlistStore((s) => s.tickers.includes(stock.ticker));
  const isPositive = stock.change >= 0;

  return (
    <div className="bg-card rounded-lg border border-border card-elevated p-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-foreground">{stock.name}</h1>
            <Badge variant="secondary" className="text-xs font-mono">{stock.ticker}</Badge>
            <Badge variant="outline" className="text-xs">{stock.exchange}</Badge>
            <Badge variant="outline" className="text-xs">{stock.sector}</Badge>
          </div>
          <div className="flex items-center gap-4 mt-3">
            <span className="text-3xl font-bold text-foreground font-mono">{formatCurrency(stock.price)}</span>
            <div className={`flex items-center gap-1 text-lg font-semibold ${isPositive ? 'text-gain' : 'text-loss'}`}>
              {isPositive ? <ArrowUp className="h-5 w-5" /> : <ArrowDown className="h-5 w-5" />}
              <span className="font-mono">{formatCurrency(Math.abs(stock.change))}</span>
              <span className="font-mono">({formatPercent(stock.changePercent)})</span>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
            <span>Mkt Cap: <span className="font-medium text-foreground">{formatLargeNumber(stock.marketCap)}</span></span>
            <span>Vol: <span className="font-medium text-foreground">{formatCompactNumber(stock.volume)}</span></span>
            <span>52W: <span className="font-medium text-foreground">{formatCurrency(stock.low52w)} – {formatCurrency(stock.high52w)}</span></span>
            <span>β: <span className="font-medium text-foreground">{stock.beta.toFixed(2)}</span></span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant={watching ? 'default' : 'outline'}
            size="sm"
            onClick={() => watching ? removeTicker(stock.ticker) : addTicker(stock.ticker)}
            className={watching ? 'bg-accent hover:bg-accent/90 text-accent-foreground' : ''}
          >
            {watching ? <EyeOff className="h-4 w-4 mr-1.5" /> : <Eye className="h-4 w-4 mr-1.5" />}
            {watching ? 'Watching' : 'Watch'}
          </Button>
          <Button variant="outline" size="sm"><Share2 className="h-4 w-4 mr-1.5" /> Share</Button>
          <Button variant="outline" size="sm"><FileDown className="h-4 w-4 mr-1.5" /> Export</Button>
        </div>
      </div>
      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border flex-wrap">
        <Badge
          variant={stock.dataCompleteness > 90 ? 'default' : 'secondary'}
          className={stock.dataCompleteness > 90 ? 'bg-accent text-accent-foreground' : ''}
        >
          Data Quality: {stock.dataCompleteness}%
        </Badge>
        <span className="text-xs text-muted-foreground">Last updated: {stock.lastUpdated}</span>
        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground">
          <RefreshCw className="h-3 w-3 mr-1" /> Refresh
        </Button>
        {stock.earningsDate && (
          <span className="text-xs text-muted-foreground ml-auto">
            Earnings: <span className="font-medium text-foreground">{stock.earningsDate}</span>
          </span>
        )}
      </div>
    </div>
  );
}

function formatCompactNumber(value: number): string {
  if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  return value.toLocaleString();
}
