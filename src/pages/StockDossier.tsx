import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Footer } from '@/components/layout/Footer';
import { DossierHeader } from '@/components/dossier/DossierHeader';
import { CollapsibleSection } from '@/components/dossier/CollapsibleSection';
import { BusinessOverview } from '@/components/dossier/BusinessOverview';
import { PriceChart } from '@/components/dossier/PriceChart';
import { FinancialHealth } from '@/components/dossier/FinancialHealth';
import { ValuationAnalysis } from '@/components/dossier/ValuationAnalysis';
import { RiskFramework } from '@/components/dossier/RiskFramework';
import { NewsSentiment } from '@/components/dossier/NewsSentiment';
import { OwnershipInsiders } from '@/components/dossier/OwnershipInsiders';
import { LatestBuzz } from '@/components/dossier/LatestBuzz';
import { TrendingTweets } from '@/components/dossier/TrendingTweets';
import { FallbackBanner } from '@/components/FallbackBanner';
import { DataFreshness } from '@/components/DataFreshness';
import { ErrorState } from '@/components/ErrorState';
import { ArrowLeft, Wifi } from 'lucide-react';
import { SourceAttribution } from '@/components/SourceAttribution';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useStockDossier } from '@/hooks/useStockData';
import { getStock as getMockStock } from '@/data/mockStocks';
import { addRecentlyViewed } from '@/hooks/useRecentlyViewed';

export default function StockDossier() {
  const { ticker } = useParams<{ ticker: string }>();
  const { data: stock, isLoading, error, isError, dataUpdatedAt, refetch } = useStockDossier(ticker);

  // Check if we fell back to mock data (no live API response)
  const mockStock = ticker ? getMockStock(ticker) : undefined;
  const isLiveData = stock && stock !== mockStock;

  // Track recently viewed
  useEffect(() => {
    if (stock?.ticker && stock?.name) {
      addRecentlyViewed(stock.ticker, stock.name);
    }
  }, [stock?.ticker, stock?.name]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-16 sm:pb-0">
        <main className="container mx-auto px-4 py-6 max-w-5xl">
          <DossierSkeleton />
        </main>
        <Footer />
      </div>
    );
  }

  if (!stock) {
    return (
      <div className="min-h-screen bg-background pb-16 sm:pb-0">
        <main className="container mx-auto px-4 py-16 max-w-lg">
          <ErrorState
            title={isError ? 'Data temporarily unavailable' : `Stock "${ticker}" not found`}
            message={
              isError
                ? `We couldn't load data for "${ticker}" right now. This may be due to API rate limiting or a temporary outage. Please try again in a moment.`
                : `No data available for ticker "${ticker}". Make sure it's listed on NASDAQ or NYSE.`
            }
            onRetry={isError ? () => refetch() : undefined}
          />
          <div className="text-center mt-4">
            <Link to="/">
              <Button variant="outline"><ArrowLeft className="h-4 w-4 mr-2" /> Back to Search</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16 sm:pb-0">
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-5xl">
        {/* Live data indicator + freshness */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <Badge variant="outline" className={`text-[10px] ${isLiveData ? 'text-gain border-gain/30' : 'text-warning border-warning/30'}`}>
            <Wifi className="h-3 w-3 mr-1" />
            {isLiveData ? 'Live Data' : 'Sample Data'}
          </Badge>
          <DataFreshness updatedAt={dataUpdatedAt} />
          <SourceAttribution source="Polygon.io" />
        </div>

        {/* Fallback banner */}
        <FallbackBanner
          show={!isLiveData}
          message="Showing cached sample data — live data temporarily unavailable. Some information may be outdated."
        />

        <DossierHeader stock={stock} />
        <div className="space-y-4 mt-4">
          <CollapsibleSection title="Business Overview" defaultOpen quickBrief={`${stock.name} operates in ${stock.industry}. ${stock.employees > 0 ? stock.employees.toLocaleString() + ' employees' : ''}${stock.headquarters ? ', HQ in ' + stock.headquarters : ''}.`}>
            <BusinessOverview stock={stock} />
          </CollapsibleSection>
          <CollapsibleSection title="Price & Technical" defaultOpen quickBrief={`52-week range: $${stock.low52w.toFixed(2)} – $${stock.high52w.toFixed(2)}. Beta: ${stock.beta.toFixed(2)}.`}>
            <PriceChart stock={stock} />
          </CollapsibleSection>
          {stock.financials.annual.length > 0 && (
            <CollapsibleSection title="Financial Health" defaultOpen quickBrief={`Revenue: ${fmtB(stock.financials.annual[0]?.revenue)}. Net Margin: ${stock.financials.annual[0]?.netMargin.toFixed(1)}%.`}>
              <FinancialHealth stock={stock} />
            </CollapsibleSection>
          )}
          <CollapsibleSection title="Valuation Analysis" quickBrief={`P/E: ${stock.valuation.pe.toFixed(1)}x. EV/EBITDA: ${stock.valuation.evEbitda.toFixed(1)}x.`}>
            <ValuationAnalysis stock={stock} />
          </CollapsibleSection>
          {stock.risks.length > 0 && (
            <CollapsibleSection title="Risk Framework" quickBrief={`${stock.risks.filter(r => r.severity === 'high').length} high-severity risks identified.`}>
              <RiskFramework stock={stock} />
            </CollapsibleSection>
          )}
          {stock.news.length > 0 && (
            <CollapsibleSection title="News & Sentiment" quickBrief={`${stock.news.length} recent articles. Latest: ${stock.news[0]?.title.slice(0, 60)}...`}>
              <NewsSentiment stock={stock} />
            </CollapsibleSection>
          )}
          <CollapsibleSection title="Latest Buzz" quickBrief="AI-powered summary of recent tweets, news, and social media sentiment.">
            <LatestBuzz ticker={stock.ticker} companyName={stock.name} />
          </CollapsibleSection>
          <CollapsibleSection title="Trending on X" quickBrief="Real-time trending tweets about this stock from analysts, traders, and influencers.">
            <TrendingTweets ticker={stock.ticker} companyName={stock.name} />
          </CollapsibleSection>
          {(stock.institutionalHolders.length > 0 || stock.insiderTransactions.length > 0) && (
            <CollapsibleSection title="Ownership & Insider Activity" quickBrief={`Short interest: ${stock.shortInterest}%. ${stock.insiderTransactions.length} insider transactions.`}>
              <OwnershipInsiders stock={stock} />
            </CollapsibleSection>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function DossierSkeleton() {
  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header skeleton */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="flex gap-4 mt-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>
      {/* Section skeletons */}
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-card rounded-lg border border-border p-6">
          <Skeleton className="h-5 w-40 mb-4" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
            <Skeleton className="h-32 w-full mt-2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function fmtB(value?: number): string {
  if (!value) return 'N/A';
  if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(0)}B`;
  return `$${(value / 1e6).toFixed(0)}M`;
}
