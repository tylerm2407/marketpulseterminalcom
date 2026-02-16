import { Link } from 'react-router-dom';
import { Footer } from '@/components/layout/Footer';
import { useWatchlistStore } from '@/stores/watchlistStore';
import { stocksMap } from '@/data/mockStocks';
import { ArrowDown, ArrowUp, Eye, EyeOff, ArrowRight, Loader2, Sparkles, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatPercent, formatLargeNumber } from '@/lib/formatters';
import { useWatchlistQuotes } from '@/hooks/useStockData';
import { WatchlistSummary } from '@/components/watchlist/WatchlistSummary';
import { useSubscription } from '@/hooks/useSubscription';

export default function Watchlist() {
  const { watchlistLimit } = useSubscription();
  const {
    tickers,
    removeTicker,
    dailySummaryEnabled,
    weeklySummaryEnabled,
    setDailySummary,
    setWeeklySummary,
  } = useWatchlistStore();
  const { data: liveQuotes, isLoading } = useWatchlistQuotes(tickers);
  const isAtLimit = watchlistLimit !== null && tickers.length >= watchlistLimit;

  const quoteMap = new Map(
    (liveQuotes || []).map(q => [q.ticker, q])
  );

  return (
    <div className="min-h-screen bg-background pb-16 sm:pb-0">
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Watchlist</h1>
          <p className="text-sm text-muted-foreground mt-1">
              {tickers.length}{watchlistLimit !== null ? `/${watchlistLimit}` : ''} stocks tracked
              {isLoading && <Loader2 className="h-3 w-3 animate-spin inline ml-2" />}
            </p>
          </div>
          {isAtLimit && (
            <Link to="/pricing">
              <Badge variant="outline" className="gap-1 text-accent border-accent/30 cursor-pointer hover:bg-accent/10">
                <Crown className="h-3 w-3" /> Upgrade for unlimited
              </Badge>
            </Link>
          )}
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
          <>
            {/* AI Summary Controls */}
            <div className="bg-card rounded-lg border border-border card-elevated p-4 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-accent" />
                <h2 className="text-sm font-bold text-foreground">AI News Summaries</h2>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <label className="flex items-center justify-between gap-3 flex-1 bg-background rounded-md p-3 border border-border cursor-pointer">
                  <div>
                    <span className="text-sm font-medium text-foreground">Daily Summary</span>
                    <p className="text-xs text-muted-foreground mt-0.5">Last 24h news & sentiment</p>
                  </div>
                  <Switch
                    checked={dailySummaryEnabled}
                    onCheckedChange={setDailySummary}
                  />
                </label>
                <label className="flex items-center justify-between gap-3 flex-1 bg-background rounded-md p-3 border border-border cursor-pointer">
                  <div>
                    <span className="text-sm font-medium text-foreground">Weekly Summary</span>
                    <p className="text-xs text-muted-foreground mt-0.5">Past week overview & themes</p>
                  </div>
                  <Switch
                    checked={weeklySummaryEnabled}
                    onCheckedChange={setWeeklySummary}
                  />
                </label>
              </div>

              {/* Summary panels */}
              {dailySummaryEnabled && (
                <div className="mt-4 bg-background rounded-md p-4 border border-border">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Daily Summary</h3>
                  <WatchlistSummary tickers={tickers} period="daily" />
                </div>
              )}
              {weeklySummaryEnabled && (
                <div className="mt-4 bg-background rounded-md p-4 border border-border">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Weekly Summary</h3>
                  <WatchlistSummary tickers={tickers} period="weekly" />
                </div>
              )}
            </div>

            {/* Stock list */}
            <div className="space-y-3">
              {tickers.map(ticker => {
                const liveQuote = quoteMap.get(ticker);
                const mockStock = stocksMap[ticker];

                const name = liveQuote?.name || mockStock?.name || ticker;
                const price = liveQuote?.price ?? mockStock?.price ?? 0;
                const change = liveQuote?.change ?? mockStock?.change ?? 0;
                const changePercent = liveQuote?.changePercent ?? mockStock?.changePercent ?? 0;
                const marketCap = liveQuote?.marketCap ?? mockStock?.marketCap ?? 0;
                const pe = liveQuote?.pe ?? mockStock?.valuation?.pe ?? 0;
                const isPositive = change >= 0;

                return (
                  <div key={ticker} className="bg-card rounded-lg border border-border card-elevated p-4 flex items-center gap-4 hover:border-accent/30 transition-colors animate-fade-in">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Link to={`/stock/${ticker}`} className="font-bold text-foreground hover:text-accent transition-colors font-mono">{ticker}</Link>
                        <span className="text-sm text-muted-foreground truncate">{name}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        {marketCap > 0 && <span>Mkt Cap: {formatLargeNumber(marketCap)}</span>}
                        {pe > 0 && <span>P/E: {pe.toFixed(1)}</span>}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      {price > 0 ? (
                        <>
                          <div className="font-bold text-foreground font-mono">{formatCurrency(price)}</div>
                          <div className={`flex items-center gap-1 text-sm justify-end ${isPositive ? 'text-gain' : 'text-loss'}`}>
                            {isPositive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                            <span className="font-mono">{formatPercent(changePercent)}</span>
                          </div>
                        </>
                      ) : (
                        <span className="text-sm text-muted-foreground">Loading...</span>
                      )}
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
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
