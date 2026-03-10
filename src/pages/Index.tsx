import { Link } from 'react-router-dom';
import { useReferralDetection } from '@/hooks/useReferralDetection';
import { BarChart3, ArrowUp, ArrowDown, Shield, FileText, Eye, Star, Clock, CalendarDays, Activity, TrendingUp, Cpu, Zap, Shield as ShieldIcon, DollarSign, Globe2, LayoutGrid } from 'lucide-react';
import { SearchBar } from '@/components/search/SearchBar';
import { Footer } from '@/components/layout/Footer';
import { TickerMarquee } from '@/components/TickerMarquee';
import { Sparkline } from '@/components/Sparkline';
import { Skeleton } from '@/components/ui/skeleton';
import { MarketIndices } from '@/components/market/MarketIndices';
import { SectorHeatmap } from '@/components/market/SectorHeatmap';
import { MarketSentiment } from '@/components/market/MarketSentiment';
import { stocksList } from '@/data/mockStocks';
import { useWatchlistQuotes, useSparklines } from '@/hooks/useStockData';
import { useMarketOverview } from '@/hooks/useMarketOverview';
import { formatCurrency, formatPercent, formatLargeNumber } from '@/lib/formatters';
import { Badge } from '@/components/ui/badge';
import { useWatchlistStore } from '@/stores/watchlistStore';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { TiltCard } from '@/components/effects/TiltCard';
import { AmbientOrbs } from '@/components/effects/AmbientOrbs';

const EXPLORE_TICKERS = ['AAPL', 'MSFT', 'NVDA', 'GOOGL', 'AMZN', 'TSLA'];

const MARKET_THEMES = [
  { name: 'AI Infrastructure', icon: Cpu, tickers: ['NVDA', 'MSFT', 'GOOGL', 'AMZN'] },
  { name: 'Semiconductors', icon: Activity, tickers: ['NVDA', 'AMD', 'INTC', 'TSM'] },
  { name: 'Clean Energy', icon: Zap, tickers: ['ENPH', 'NEE', 'FSLR', 'BEP'] },
  { name: 'Defense & Aerospace', icon: ShieldIcon, tickers: ['LMT', 'RTX', 'NOC', 'GD'] },
  { name: 'Fintech', icon: DollarSign, tickers: ['PYPL', 'SQ', 'COIN', 'AFRM'] },
  { name: 'Consumer Tech', icon: Globe2, tickers: ['AAPL', 'AMZN', 'META', 'TSLA'] },
] as const;

const Index = () => {
  useReferralDetection();
  const { data: liveQuotes } = useWatchlistQuotes(EXPLORE_TICKERS);
  const { data: sparklines } = useSparklines(EXPLORE_TICKERS);
  const { data: marketOverview, isLoading: marketLoading } = useMarketOverview();
  const { addTicker, removeTicker, isWatching } = useWatchlistStore();
  const { items: recentlyViewed } = useRecentlyViewed();
  const quoteMap = new Map((liveQuotes || []).map(q => [q.ticker, q]));

  // upgrade_success handling is now in useAppAccess globally
  const sparkMap = new Map((sparklines || []).map(s => [s.symbol, s.prices]));
  const trendingStocks = stocksList.slice(0, 6);
  const isLoadingCards = !liveQuotes;

  return (
    <div className="min-h-screen pb-16 sm:pb-0 relative">
      {/* Hero */}
      <section className="hero-gradient text-[var(--text-primary)] relative overflow-hidden">
        <div className="dot-pattern absolute inset-0 opacity-[0.03]" />
        <AmbientOrbs />
        <div className="container mx-auto px-4 pt-20 pb-14 max-w-3xl text-center relative z-10">
          {/* Floating badge */}
          <div className="inline-flex items-center gap-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-full px-4 py-1.5 mb-6 animate-fade-in-up" style={{ animationDelay: '0ms' }}>
            <span className="w-2 h-2 rounded-full bg-[var(--accent-success)] animate-pulse" />
            <span className="text-xs text-[var(--text-secondary)] font-medium">Live Market Data</span>
          </div>

          <div className="flex items-center justify-center gap-2.5 mb-6">
            <BarChart3 className="h-8 w-8 text-[var(--accent-primary)]" />
            <h1 className="text-3xl md:text-5xl font-display font-extrabold tracking-tight animate-fade-in-up" style={{ animationDelay: '0ms', fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
              Market<span className="gradient-text">Pulse</span>
            </h1>
          </div>
          <p className="text-lg text-[var(--text-secondary)] mb-8 leading-relaxed max-w-xl mx-auto animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            Transparent, unbiased stock analysis. Every metric shows its methodology. Every source is linked. No recommendations — just facts.
          </p>
          <div className="max-w-lg mx-auto animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <SearchBar variant="hero" />
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-4 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            Search any NASDAQ or NYSE-listed stock by ticker or company name
          </p>
        </div>
        {/* Live ticker marquee */}
        <TickerMarquee variant="hero" />
      </section>

      {/* Section divider */}
      <div className="section-divider" />

      {/* Market Overview */}
      <section className="container mx-auto px-4 pt-8 pb-0 max-w-5xl scroll-animate">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-[var(--accent-primary)]" />
            <h2 className="text-sm font-semibold font-display text-[var(--text-primary)]">Market Overview</h2>
          </div>
          {marketOverview?.timestamp && (
            <span className="text-[10px] text-[var(--text-muted)]">
              Updated {new Date(marketOverview.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
        <MarketIndices indices={marketOverview?.indices} isLoading={marketLoading} />
      </section>

      {/* Market Sentiment */}
      <section className="container mx-auto px-4 pt-4 pb-0 max-w-5xl scroll-animate">
        <MarketSentiment />
      </section>

      {/* Sector Heatmap */}
      <section className="container mx-auto px-4 pt-6 pb-0 max-w-5xl scroll-animate">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-[var(--accent-primary)]" />
            <h2 className="text-sm font-semibold font-display text-[var(--text-primary)]">Sector Performance</h2>
          </div>
          <Link to="/earnings" className="text-xs text-[var(--accent-primary)] hover:underline flex items-center gap-1">
            <CalendarDays className="h-3 w-3" />
            Earnings Calendar
          </Link>
        </div>
        <SectorHeatmap sectors={marketOverview?.sectors} isLoading={marketLoading} />
      </section>

      {/* Recently Viewed */}
      {recentlyViewed.length > 0 && (
        <section className="container mx-auto px-4 pt-8 pb-0 max-w-5xl scroll-animate">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-4 w-4 text-[var(--text-muted)]" />
            <h2 className="text-sm font-semibold font-display text-[var(--text-primary)]">Recently Viewed</h2>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
            {recentlyViewed.map(item => (
              <Link
                key={item.ticker}
                to={`/stock/${item.ticker}`}
                className="shrink-0 card-elevated px-3 py-2 hover:border-[var(--border-active)] transition-colors flex items-center gap-2"
              >
                <span className="font-bold text-xs font-mono text-[var(--text-primary)]">{item.ticker}</span>
                <span className="text-xs text-[var(--text-secondary)] truncate max-w-[120px]">{item.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Market Themes */}
      <section className="container mx-auto px-4 pt-8 pb-0 max-w-5xl scroll-animate">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[var(--accent-primary)]" />
            <h2 className="text-sm font-semibold font-display text-[var(--text-primary)]">Market Themes</h2>
          </div>
          <Link to="/heatmap" className="text-xs text-[var(--accent-primary)] hover:underline flex items-center gap-1">
            <LayoutGrid className="h-3 w-3" />
            Full Heat Map
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {MARKET_THEMES.map(theme => (
            <Link
              key={theme.name}
              to="/heatmap"
              className="card-elevated p-3 hover:border-[var(--border-active)] transition-all group"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-md bg-[rgba(34,197,94,0.1)] flex items-center justify-center">
                  <theme.icon className="h-3.5 w-3.5 text-[var(--accent-primary)]" />
                </div>
                <span className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors">{theme.name}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {theme.tickers.map(t => (
                  <span key={t} className="text-[10px] font-mono text-[var(--text-muted)] bg-[var(--bg-elevated)] px-1.5 py-0.5 rounded">{t}</span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Trending */}
      <section className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex items-center justify-between mb-6 scroll-animate">
          <h2 className="text-lg font-semibold font-display text-[var(--text-primary)]">Explore Stocks</h2>
          <span className="text-[10px] sm:text-xs text-[var(--text-muted)]">All price data is delayed ~15 minutes</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoadingCards
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card-elevated p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-4 w-14" />
                  </div>
                  <Skeleton className="h-4 w-32" />
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              ))
            : trendingStocks.map((stock, i) => {
            const live = quoteMap.get(stock.ticker);
            const sparkData = sparkMap.get(stock.ticker);
            const price = live?.price ?? stock.price;
            const change = live?.change ?? stock.change;
            const changePercent = live?.changePercent ?? stock.changePercent;
            const marketCap = live?.marketCap ?? stock.marketCap;
            const isPositive = change >= 0;
            return (
              <TiltCard key={stock.ticker} className="scroll-animate" style={{ transitionDelay: `${i * 100}ms` }}>
                <Link
                  to={`/stock/${stock.ticker}`}
                  className="card-elevated p-4 block group relative"
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      isWatching(stock.ticker) ? removeTicker(stock.ticker) : addTicker(stock.ticker);
                    }}
                    className="absolute top-3 right-3 z-10 p-1 rounded-full hover:bg-[var(--bg-elevated)] transition-colors"
                    aria-label={isWatching(stock.ticker) ? 'Remove from watchlist' : 'Add to watchlist'}
                  >
                    <Star className={`h-4 w-4 transition-colors ${isWatching(stock.ticker) ? 'fill-[var(--accent-primary)] text-[var(--accent-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--accent-primary)]'}`} />
                  </button>
                  <div className="flex items-center justify-between mb-2 pr-6">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[var(--text-primary)] font-mono group-hover:text-[var(--accent-primary)] transition-colors">{stock.ticker}</span>
                      <Badge variant="outline" className="text-[10px] border-[var(--border-subtle)] text-[var(--text-muted)]">{stock.sector}</Badge>
                    </div>
                    <div className={`flex items-center gap-0.5 text-sm font-semibold ${isPositive ? 'text-[var(--accent-success)]' : 'text-[var(--accent-danger)]'}`}>
                      {isPositive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                      <span className="font-mono">{formatPercent(changePercent)}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="text-sm text-[var(--text-secondary)] truncate">{live?.name || stock.name}</div>
                    {sparkData && sparkData.length > 1 && (
                      <Sparkline data={sparkData} positive={isPositive} width={72} height={28} className="shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                    <span className="font-mono font-medium text-[var(--text-primary)]">{formatCurrency(price)}</span>
                    <span>{formatLargeNumber(marketCap)}</span>
                  </div>
                </Link>
              </TiltCard>
            );
          })}
        </div>
      </section>

      {/* Section divider */}
      <div className="section-divider" />

      {/* Features */}
      <section className="relative overflow-hidden">
        <AmbientOrbs />
        <div className="container mx-auto px-4 py-12 max-w-5xl relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={Shield}
              title="Transparent Methodology"
              description="Every metric shows its calculation method and data sources. No black boxes."
              delay={0}
            />
            <FeatureCard
              icon={FileText}
              title="Facts, Not Advice"
              description="We clearly separate raw data, derived metrics, and scenario analysis. Never a recommendation."
              delay={100}
            />
            <FeatureCard
              icon={Eye}
              title="Full Disclosure"
              description="Data recency, limitations, and known gaps are always visible. Trust through transparency."
              delay={200}
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

function FeatureCard({ icon: Icon, title, description, delay = 0 }: { icon: React.ElementType; title: string; description: string; delay?: number }) {
  return (
    <TiltCard className="scroll-animate text-center card-elevated p-6" style={{ transitionDelay: `${delay}ms` }}>
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[rgba(34,197,94,0.1)] text-[var(--accent-primary)] mb-4">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="font-display font-semibold text-[var(--text-primary)] mb-2">{title}</h3>
      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{description}</p>
    </TiltCard>
  );
}

export default Index;
