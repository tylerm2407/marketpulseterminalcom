import { ArrowDown, ArrowUp, Eye, EyeOff, FileDown, Share2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { StockData } from '@/types/stock';
import { useWatchlistStore } from '@/stores/watchlistStore';
import { formatLargeNumber, formatCurrency, formatPercent, formatNumber } from '@/lib/formatters';
import { GlossaryTerm } from '@/components/GlossaryTerm';

export function DossierHeader({ stock }: { stock: StockData }) {
  const { addTicker, removeTicker } = useWatchlistStore();
  const watching = useWatchlistStore((s) => s.tickers.includes(stock.ticker));
  const isPositive = stock.change >= 0;

  return (
    <div className="bg-card rounded-lg border border-border card-elevated p-4 sm:p-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 sm:gap-4">
        <div className="min-w-0">
          {/* Name + badges row */}
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">{stock.name}</h1>
            <Badge variant="secondary" className="text-xs font-mono shrink-0">{stock.ticker}</Badge>
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <Badge variant="outline" className="text-[10px] sm:text-xs">{stock.exchange}</Badge>
            <Badge variant="outline" className="text-[10px] sm:text-xs">{stock.sector}</Badge>
          </div>

          {/* Price row */}
          <div className="flex items-baseline gap-3 mt-3 flex-wrap">
            <span className="text-2xl sm:text-3xl font-bold text-foreground font-mono">{formatCurrency(stock.price)}</span>
            <div className={`flex items-center gap-1 text-base sm:text-lg font-semibold ${isPositive ? 'text-gain' : 'text-loss'}`}>
              {isPositive ? <ArrowUp className="h-4 w-4 sm:h-5 sm:w-5" /> : <ArrowDown className="h-4 w-4 sm:h-5 sm:w-5" />}
              <span className="font-mono">{formatCurrency(Math.abs(stock.change))}</span>
              <span className="font-mono">({formatPercent(stock.changePercent)})</span>
            </div>
          </div>

          {/* Key stats - grid on mobile for better readability */}
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-x-4 gap-y-1 mt-2 text-xs sm:text-sm text-muted-foreground">
            <span><GlossaryTerm termKey="marketCap">Mkt Cap</GlossaryTerm>: <span className="font-medium text-foreground">{formatLargeNumber(stock.marketCap)}</span></span>
            <span><GlossaryTerm termKey="volume">Vol</GlossaryTerm>: <span className="font-medium text-foreground">{formatCompactNumber(stock.volume)}</span></span>
            <span><GlossaryTerm termKey="52w">52W</GlossaryTerm>: <span className="font-medium text-foreground">{formatCurrency(stock.low52w)} – {formatCurrency(stock.high52w)}</span></span>
            <span><GlossaryTerm termKey="beta">β</GlossaryTerm>: <span className="font-medium text-foreground">{stock.beta.toFixed(2)}</span></span>
          </div>
        </div>

        {/* Action buttons - full width on mobile, icons only on smallest */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant={watching ? 'default' : 'outline'}
            size="sm"
            onClick={() => watching ? removeTicker(stock.ticker) : addTicker(stock.ticker)}
            className={`h-9 sm:h-8 ${watching ? 'bg-accent hover:bg-accent/90 text-accent-foreground' : ''}`}
          >
            {watching ? <EyeOff className="h-4 w-4 sm:mr-1.5" /> : <Eye className="h-4 w-4 sm:mr-1.5" />}
            <span className="hidden sm:inline">{watching ? 'Watching' : 'Watch'}</span>
          </Button>
          <Button variant="outline" size="sm" className="h-9 sm:h-8">
            <Share2 className="h-4 w-4 sm:mr-1.5" />
            <span className="hidden sm:inline">Share</span>
          </Button>
          <Button variant="outline" size="sm" className="h-9 sm:h-8">
            <FileDown className="h-4 w-4 sm:mr-1.5" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </div>

      {/* Footer meta */}
      <div className="flex items-center gap-2 sm:gap-3 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border flex-wrap">
        <Badge
          variant={stock.dataCompleteness > 90 ? 'default' : 'secondary'}
          className={`text-[10px] sm:text-xs ${stock.dataCompleteness > 90 ? 'bg-accent text-accent-foreground' : ''}`}
        >
          Data Quality: {stock.dataCompleteness}%
        </Badge>
        <span className="text-[10px] sm:text-xs text-muted-foreground">Updated: {stock.lastUpdated}</span>
        <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] sm:text-xs text-muted-foreground hover:text-foreground">
          <RefreshCw className="h-3 w-3 mr-1" /> Refresh
        </Button>
        {stock.earningsDate && (
          <span className="text-[10px] sm:text-xs text-muted-foreground sm:ml-auto">
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
