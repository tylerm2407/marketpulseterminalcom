import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Newspaper, GitCompareArrows, Bell, Sparkles } from 'lucide-react';
import News from './News';
import StockComparison from './StockComparison';
import PriceAlerts from './PriceAlerts';
import StockScreener from './StockScreener';

export default function Analytics() {
  return (
    <div className="min-h-screen pb-16 sm:pb-0" style={{ backgroundColor: 'var(--bg-base)' }}>
      <Tabs defaultValue="news" className="w-full">
        <div className="sticky top-14 z-30 border-b border-[var(--border-subtle)]" style={{ backgroundColor: 'var(--bg-base)' }}>
          <TabsList className="w-full h-12 rounded-none bg-transparent justify-around p-0 gap-0">
            <TabsTrigger
              value="news"
              className="flex-1 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-[var(--accent-primary)] data-[state=active]:bg-transparent data-[state=active]:text-[var(--accent-primary)] text-[var(--text-muted)] text-xs gap-1.5"
            >
              <Newspaper className="h-4 w-4" />
              News
            </TabsTrigger>
            <TabsTrigger
              value="compare"
              className="flex-1 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-[var(--accent-primary)] data-[state=active]:bg-transparent data-[state=active]:text-[var(--accent-primary)] text-[var(--text-muted)] text-xs gap-1.5"
            >
              <GitCompareArrows className="h-4 w-4" />
              Compare
            </TabsTrigger>
            <TabsTrigger
              value="alerts"
              className="flex-1 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-[var(--accent-primary)] data-[state=active]:bg-transparent data-[state=active]:text-[var(--accent-primary)] text-[var(--text-muted)] text-xs gap-1.5"
            >
              <Bell className="h-4 w-4" />
              Alerts
            </TabsTrigger>
            <TabsTrigger
              value="screener"
              className="flex-1 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-[var(--accent-primary)] data-[state=active]:bg-transparent data-[state=active]:text-[var(--accent-primary)] text-[var(--text-muted)] text-xs gap-1.5"
            >
              <Sparkles className="h-4 w-4" />
              Screener
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="news" className="mt-0">
          <News />
        </TabsContent>
        <TabsContent value="compare" className="mt-0">
          <StockComparison />
        </TabsContent>
        <TabsContent value="alerts" className="mt-0">
          <PriceAlerts />
        </TabsContent>
        <TabsContent value="screener" className="mt-0">
          <StockScreener />
        </TabsContent>
      </Tabs>
    </div>
  );
}
