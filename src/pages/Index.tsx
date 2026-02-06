import { Link } from 'react-router-dom';
import { BarChart3, ArrowUp, ArrowDown, Shield, Search, TrendingUp, FileText, Eye } from 'lucide-react';
import { SearchBar } from '@/components/search/SearchBar';
import { Footer } from '@/components/layout/Footer';
import { TickerMarquee } from '@/components/TickerMarquee';
import { Sparkline } from '@/components/Sparkline';
import { stocksList } from '@/data/mockStocks';
import { useWatchlistQuotes, useSparklines } from '@/hooks/useStockData';
import { formatCurrency, formatPercent, formatLargeNumber } from '@/lib/formatters';
import { Badge } from '@/components/ui/badge';

const EXPLORE_TICKERS = ['AAPL', 'MSFT', 'NVDA', 'GOOGL', 'AMZN', 'TSLA'];

const Index = () => {
  const { data: liveQuotes } = useWatchlistQuotes(EXPLORE_TICKERS);
  const { data: sparklines } = useSparklines(EXPLORE_TICKERS);
  const quoteMap = new Map((liveQuotes || []).map(q => [q.ticker, q]));
  const sparkMap = new Map((sparklines || []).map(s => [s.symbol, s.prices]));
  const trendingStocks = stocksList.slice(0, 6);

  return (
    <div className="min-h-screen bg-background pb-16 sm:pb-0">
      {/* Hero */}
      <section className="hero-gradient text-primary-foreground">
        <div className="container mx-auto px-4 pt-16 pb-12 max-w-3xl text-center">
          <div className="flex items-center justify-center gap-2.5 mb-6">
            <BarChart3 className="h-8 w-8 text-accent" />
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Stock<span className="text-accent">Dossier</span>
            </h1>
          </div>
          <p className="text-lg text-primary-foreground/80 mb-8 leading-relaxed max-w-xl mx-auto">
            Transparent, unbiased stock analysis. Every metric shows its methodology. Every source is linked. No recommendations — just facts.
          </p>
          <div className="max-w-lg mx-auto">
            <SearchBar variant="hero" />
          </div>
          <p className="text-xs text-primary-foreground/40 mt-4">
            Try: AAPL, MSFT, NVDA, GOOGL, AMZN, TSLA
          </p>
        </div>
        {/* Live ticker marquee */}
        <TickerMarquee variant="hero" />
      </section>

      {/* Trending */}
      <section className="container mx-auto px-4 py-12 max-w-5xl">
        <h2 className="text-lg font-semibold text-foreground mb-6">Explore Stocks</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {trendingStocks.map(stock => {
            const live = quoteMap.get(stock.ticker);
            const sparkData = sparkMap.get(stock.ticker);
            const price = live?.price ?? stock.price;
            const change = live?.change ?? stock.change;
            const changePercent = live?.changePercent ?? stock.changePercent;
            const marketCap = live?.marketCap ?? stock.marketCap;
            const isPositive = change >= 0;
            return (
              <Link
                key={stock.ticker}
                to={`/stock/${stock.ticker}`}
                className="bg-card rounded-lg border border-border card-elevated p-4 hover:border-accent/40 transition-all duration-200 group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground font-mono group-hover:text-accent transition-colors">{stock.ticker}</span>
                    <Badge variant="outline" className="text-[10px]">{stock.sector}</Badge>
                  </div>
                  <div className={`flex items-center gap-0.5 text-sm font-semibold ${isPositive ? 'text-gain' : 'text-loss'}`}>
                    {isPositive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                    <span className="font-mono">{formatPercent(changePercent)}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="text-sm text-muted-foreground truncate">{live?.name || stock.name}</div>
                  {sparkData && sparkData.length > 1 && (
                    <Sparkline data={sparkData} positive={isPositive} width={72} height={28} className="shrink-0" />
                  )}
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-mono font-medium text-foreground">{formatCurrency(price)}</span>
                  <span>{formatLargeNumber(marketCap)}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border bg-muted/30">
        <div className="container mx-auto px-4 py-12 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={Shield}
              title="Transparent Methodology"
              description="Every metric shows its calculation method and data sources. No black boxes."
            />
            <FeatureCard
              icon={FileText}
              title="Facts, Not Advice"
              description="We clearly separate raw data, derived metrics, and scenario analysis. Never a recommendation."
            />
            <FeatureCard
              icon={Eye}
              title="Full Disclosure"
              description="Data recency, limitations, and known gaps are always visible. Trust through transparency."
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

function FeatureCard({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-accent/10 text-accent mb-3">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="font-semibold text-foreground mb-1.5">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

export default Index;
