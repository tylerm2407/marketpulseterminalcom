import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowUp, ArrowDown, Star } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useWatchlistStore } from '@/stores/watchlistStore';
import { useWatchlistQuotes } from '@/hooks/useStockData';
import { formatCurrency, formatPercent, formatLargeNumber } from '@/lib/formatters';

// Map sector ETF tickers to the stocks that compose them
const SECTOR_STOCKS: Record<string, { name: string; tickers: string[] }> = {
  XLK: {
    name: 'Technology',
    tickers: ['AAPL', 'MSFT', 'NVDA', 'AVGO', 'ADBE', 'CRM', 'AMD', 'INTC', 'CSCO', 'ORCL', 'ACN', 'TXN', 'QCOM', 'INTU', 'AMAT'],
  },
  XLF: {
    name: 'Financial Services',
    tickers: ['BRK.B', 'JPM', 'V', 'MA', 'BAC', 'WFC', 'GS', 'MS', 'SPGI', 'BLK', 'C', 'AXP', 'SCHW', 'MMC', 'CB'],
  },
  XLV: {
    name: 'Healthcare',
    tickers: ['UNH', 'JNJ', 'LLY', 'ABBV', 'MRK', 'PFE', 'TMO', 'ABT', 'DHR', 'BMY', 'AMGN', 'MDT', 'ISRG', 'GILD', 'CVS'],
  },
  XLC: {
    name: 'Communication Services',
    tickers: ['META', 'GOOGL', 'GOOG', 'NFLX', 'DIS', 'CMCSA', 'T', 'VZ', 'TMUS', 'CHTR', 'EA', 'TTWO', 'WBD', 'OMC', 'PARA'],
  },
  XLY: {
    name: 'Consumer Cyclical',
    tickers: ['AMZN', 'TSLA', 'HD', 'MCD', 'NKE', 'LOW', 'SBUX', 'TJX', 'BKNG', 'CMG', 'MAR', 'GM', 'F', 'ORLY', 'ROST'],
  },
  XLP: {
    name: 'Consumer Defensive',
    tickers: ['PG', 'KO', 'PEP', 'COST', 'WMT', 'PM', 'MO', 'MDLZ', 'CL', 'KMB', 'GIS', 'SYY', 'HSY', 'KHC', 'STZ'],
  },
  XLE: {
    name: 'Energy',
    tickers: ['XOM', 'CVX', 'COP', 'SLB', 'EOG', 'PXD', 'MPC', 'PSX', 'VLO', 'OXY', 'WMB', 'KMI', 'HES', 'HAL', 'DVN'],
  },
  XLI: {
    name: 'Industrials',
    tickers: ['RTX', 'HON', 'UNP', 'UPS', 'BA', 'CAT', 'DE', 'LMT', 'GE', 'MMM', 'NOC', 'GD', 'ITW', 'EMR', 'WM'],
  },
  XLB: {
    name: 'Materials',
    tickers: ['LIN', 'APD', 'SHW', 'ECL', 'FCX', 'NEM', 'DOW', 'DD', 'NUE', 'VMC', 'MLM', 'PPG', 'ALB', 'IFF', 'CE'],
  },
  XLRE: {
    name: 'Real Estate',
    tickers: ['PLD', 'AMT', 'CCI', 'EQIX', 'PSA', 'SPG', 'O', 'DLR', 'WELL', 'AVB', 'EQR', 'VTR', 'ARE', 'MAA', 'UDR'],
  },
  XLU: {
    name: 'Utilities',
    tickers: ['NEE', 'DUK', 'SO', 'D', 'AEP', 'SRE', 'XEL', 'EXC', 'ED', 'WEC', 'ES', 'AWK', 'DTE', 'ETR', 'FE'],
  },
};

export default function SectorStocks() {
  const { ticker } = useParams<{ ticker: string }>();
  const sectorInfo = ticker ? SECTOR_STOCKS[ticker.toUpperCase()] : null;
  const stockTickers = sectorInfo?.tickers ?? [];
  const { data: quotes, isLoading } = useWatchlistQuotes(stockTickers);
  const quoteMap = new Map((quotes || []).map(q => [q.ticker, q]));
  const { addTicker, removeTicker, isWatching } = useWatchlistStore();

  if (!sectorInfo) {
    return (
      <div className="min-h-screen bg-background pb-16 sm:pb-0">
        <div className="container mx-auto px-4 py-8 max-w-5xl text-center">
          <p className="text-muted-foreground">Sector not found.</p>
          <Link to="/heatmap" className="text-accent text-sm hover:underline mt-2 inline-block">← Back to Heat Map</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16 sm:pb-0">
      <section className="container mx-auto px-4 py-8 max-w-5xl">
        <Link to="/heatmap" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Heat Map
        </Link>

        <h1 className="text-2xl font-bold text-foreground mb-1">{sectorInfo.name} Sector</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Top holdings in the {sectorInfo.name} sector ({ticker?.toUpperCase()})
        </p>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {stockTickers.map((t) => {
              const q = quoteMap.get(t);
              const price = q?.price ?? 0;
              const changePercent = q?.changePercent ?? 0;
              const isPositive = changePercent >= 0;
              const name = q?.name ?? t;

              return (
                <Link
                  key={t}
                  to={`/stock/${t}`}
                  className="bg-card rounded-lg border border-border p-4 hover:border-accent/40 transition-all group relative"
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      isWatching(t) ? removeTicker(t) : addTicker(t);
                    }}
                    className="absolute top-3 right-3 z-10 p-1 rounded-full hover:bg-muted transition-colors"
                  >
                    <Star className={`h-3.5 w-3.5 ${isWatching(t) ? 'fill-accent text-accent' : 'text-muted-foreground hover:text-accent'}`} />
                  </button>
                  <div className="pr-7 mb-2">
                    <span className="font-bold text-sm font-mono text-foreground group-hover:text-accent transition-colors">{t}</span>
                    <div className="text-xs text-muted-foreground truncate">{name}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-mono text-foreground">{price > 0 ? formatCurrency(price) : '—'}</span>
                    <span className={`text-xs font-mono font-semibold flex items-center gap-0.5 ${isPositive ? 'text-gain' : 'text-loss'}`}>
                      {isPositive ? <ArrowUp className="h-2.5 w-2.5" /> : <ArrowDown className="h-2.5 w-2.5" />}
                      {changePercent !== 0 ? formatPercent(changePercent) : '—'}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
}
