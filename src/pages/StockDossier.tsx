import { useParams, Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
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
import { ArrowLeft, Loader2, AlertCircle, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useStockDossier } from '@/hooks/useStockData';
import { getStock as getMockStock } from '@/data/mockStocks';

export default function StockDossier() {
  const { ticker } = useParams<{ ticker: string }>();
  const { data: stock, isLoading, error, isError } = useStockDossier(ticker);

  // Check if we fell back to mock data (no live API response)
  const mockStock = ticker ? getMockStock(ticker) : undefined;
  const isLiveData = stock && stock !== mockStock;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-16 sm:pb-0">
        <Header />
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
        <Header />
        <main className="container mx-auto px-4 py-16 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Stock Not Found</h1>
          <p className="text-muted-foreground mb-6">
            No data available for ticker "{ticker}".
            {isError && <span className="block mt-1 text-sm">Error: {(error as Error)?.message}</span>}
          </p>
          <Link to="/">
            <Button variant="outline"><ArrowLeft className="h-4 w-4 mr-2" /> Back to Search</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16 sm:pb-0">
      <Header />
      <main className="container mx-auto px-4 py-6 max-w-5xl">
        {/* Live data indicator */}
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="outline" className={`text-[10px] ${isLiveData ? 'text-gain border-gain/30' : 'text-warning border-warning/30'}`}>
            <Wifi className="h-3 w-3 mr-1" />
            {isLiveData ? 'Live Data' : 'Sample Data'}
          </Badge>
          {!isLiveData && (
            <span className="text-[10px] text-muted-foreground">Using cached sample data — live API may be rate-limited</span>
          )}
        </div>

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
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-card rounded-lg border border-border p-6">
          <Skeleton className="h-5 w-40 mb-4" />
          <Skeleton className="h-48 w-full" />
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
