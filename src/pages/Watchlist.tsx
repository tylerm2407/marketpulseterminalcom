import { Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useWatchlistStore } from '@/stores/watchlistStore';
import { stocksMap } from '@/data/mockStocks';
import { ArrowDown, ArrowUp, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatPercent, formatLargeNumber } from '@/lib/formatters';

export default function Watchlist() {
  const { tickers, removeTicker } = useWatchlistStore();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Watchlist</h1>
            <p className="text-sm text-muted-foreground mt-1">{tickers.length} stocks tracked</p>
          </div>
        </div>

        {tickers.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-lg border border-border card-elevated">
            <Eye className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-foreground mb-2">No stocks yet</h2>
            <p className="text-sm text-muted-foreground mb-6">Search for a stock and click "Watch" to add it here.</p>
            <Link to="/">
              <Button>Search Stocks</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {tickers.map(ticker => {
              const stock = stocksMap[ticker];
              if (!stock) return null;
              const isPositive = stock.change >= 0;

              return (
                <div key={ticker} className="bg-card rounded-lg border border-border card-elevated p-4 flex items-center gap-4 hover:border-accent/30 transition-colors animate-fade-in">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Link to={`/stock/${ticker}`} className="font-bold text-foreground hover:text-accent transition-colors font-mono">{ticker}</Link>
                      <span className="text-sm text-muted-foreground truncate">{stock.name}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span>Mkt Cap: {formatLargeNumber(stock.marketCap)}</span>
                      <span>P/E: {stock.valuation.pe.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-bold text-foreground font-mono">{formatCurrency(stock.price)}</div>
                    <div className={`flex items-center gap-1 text-sm justify-end ${isPositive ? 'text-gain' : 'text-loss'}`}>
                      {isPositive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                      <span className="font-mono">{formatPercent(stock.changePercent)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link to={`/stock/${ticker}`}>
                      <Button variant="outline" size="sm" className="h-8">
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm" className="h-8 text-muted-foreground" onClick={() => removeTicker(ticker)}>
                      <EyeOff className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
