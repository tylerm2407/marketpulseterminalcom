import { useParams, Link } from 'react-router-dom';
import { getStock } from '@/data/mockStocks';
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
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function StockDossier() {
  const { ticker } = useParams<{ ticker: string }>();
  const stock = ticker ? getStock(ticker) : undefined;

  if (!stock) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Stock Not Found</h1>
          <p className="text-muted-foreground mb-6">No data available for ticker "{ticker}"</p>
          <Link to="/">
            <Button variant="outline"><ArrowLeft className="h-4 w-4 mr-2" /> Back to Search</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6 max-w-5xl">
        <DossierHeader stock={stock} />
        <div className="space-y-4 mt-4">
          <CollapsibleSection title="Business Overview" defaultOpen quickBrief={`${stock.name} operates in ${stock.industry}. ${stock.employees.toLocaleString()} employees, HQ in ${stock.headquarters}.`}>
            <BusinessOverview stock={stock} />
          </CollapsibleSection>
          <CollapsibleSection title="Price & Technical" defaultOpen quickBrief={`52-week range: $${stock.low52w} – $${stock.high52w}. Beta: ${stock.beta}.`}>
            <PriceChart stock={stock} />
          </CollapsibleSection>
          <CollapsibleSection title="Financial Health" defaultOpen quickBrief={`Revenue: ${fmtB(stock.financials.annual[0]?.revenue)}. Net Margin: ${stock.financials.annual[0]?.netMargin.toFixed(1)}%.`}>
            <FinancialHealth stock={stock} />
          </CollapsibleSection>
          <CollapsibleSection title="Valuation Analysis" quickBrief={`P/E: ${stock.valuation.pe.toFixed(1)}x vs sector ${stock.valuation.sectorMedian.pe.toFixed(1)}x.`}>
            <ValuationAnalysis stock={stock} />
          </CollapsibleSection>
          <CollapsibleSection title="Risk Framework" quickBrief={`${stock.risks.filter(r => r.severity === 'high').length} high-severity risks identified.`}>
            <RiskFramework stock={stock} />
          </CollapsibleSection>
          <CollapsibleSection title="News & Sentiment" quickBrief={`${stock.news.length} recent articles. Latest: ${stock.news[0]?.title.slice(0, 60)}...`}>
            <NewsSentiment stock={stock} />
          </CollapsibleSection>
          <CollapsibleSection title="Ownership & Insider Activity" quickBrief={`Short interest: ${stock.shortInterest}%. ${stock.insiderTransactions.length} insider transactions.`}>
            <OwnershipInsiders stock={stock} />
          </CollapsibleSection>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function fmtB(value?: number): string {
  if (!value) return 'N/A';
  if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(0)}B`;
  return `$${(value / 1e6).toFixed(0)}M`;
}
