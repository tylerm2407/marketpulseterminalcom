import { Link } from 'react-router-dom';
import { CalendarDays, ArrowUp, ArrowDown, Star } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { stocksList } from '@/data/mockStocks';
import { useWatchlistStore } from '@/stores/watchlistStore';
import { useWatchlistQuotes } from '@/hooks/useStockData';
import { formatCurrency, formatPercent, formatLargeNumber } from '@/lib/formatters';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface EarningsEntry {
  ticker: string;
  name: string;
  earningsDate: string;
  sector: string;
  price: number;
  changePercent: number;
  marketCap: number;
}

// Generate comprehensive earnings entries from mock data for the current and upcoming weeks
function generateMockEarnings(): EarningsEntry[] {
  const now = new Date();
  const entries: EarningsEntry[] = [];

  // Assign earnings dates to all stocks across the next 2 weeks for a full calendar
  const allStocks = stocksList.slice(0, 50); // Use top 50 stocks
  allStocks.forEach((s, i) => {
    const daysOffset = Math.floor(i / 5); // ~5 per day across 10 days
    const date = new Date(now);
    date.setDate(date.getDate() + daysOffset);
    // Skip weekends
    if (date.getDay() === 0) date.setDate(date.getDate() + 1);
    if (date.getDay() === 6) date.setDate(date.getDate() + 2);

    entries.push({
      ticker: s.ticker,
      name: s.name,
      earningsDate: date.toISOString().split('T')[0],
      sector: s.sector,
      price: s.price,
      changePercent: s.changePercent,
      marketCap: s.marketCap,
    });
  });

  return entries.sort((a, b) => a.earningsDate.localeCompare(b.earningsDate));
}

function groupByWeek(entries: EarningsEntry[]): Record<string, EarningsEntry[]> {
  const groups: Record<string, EarningsEntry[]> = {};
  const now = new Date();

  for (const entry of entries) {
    const date = new Date(entry.earningsDate);
    const diffDays = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    let label: string;
    if (diffDays < 0) label = 'Past';
    else if (diffDays < 7) label = 'This Week';
    else if (diffDays < 14) label = 'Next Week';
    else if (diffDays < 30) label = 'This Month';
    else label = 'Later';

    if (!groups[label]) groups[label] = [];
    groups[label].push(entry);
  }

  return groups;
}

const EarningsCalendar = () => {
  const entries = generateMockEarnings();
  const grouped = groupByWeek(entries);
  const tickers = entries.map(e => e.ticker);
  const { data: liveQuotes, isLoading } = useWatchlistQuotes(tickers.slice(0, 30)); // Limit API calls
  const quoteMap = new Map((liveQuotes || []).map(q => [q.ticker, q]));
  const { addTicker, removeTicker, isWatching } = useWatchlistStore();

  const displayOrder = ['This Week', 'Next Week', 'This Month', 'Later', 'Past'];

  return (
    <div className="min-h-screen bg-background pb-16 sm:pb-0">
      <section className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-accent/10 text-accent">
            <CalendarDays className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Earnings Calendar</h1>
            <p className="text-sm text-muted-foreground">All upcoming earnings reports this week and beyond</p>
          </div>
        </div>

        <div className="space-y-8">
          {displayOrder.map(label => {
            const items = grouped[label];
            if (!items?.length) return null;

            // Group by day within each week group
            const byDay: Record<string, EarningsEntry[]> = {};
            for (const item of items) {
              const dayLabel = new Date(item.earningsDate + 'T00:00:00').toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
              });
              if (!byDay[dayLabel]) byDay[dayLabel] = [];
              byDay[dayLabel].push(item);
            }

            return (
              <div key={label}>
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-base font-semibold text-foreground">{label}</h2>
                  <Badge variant="outline" className="text-[10px]">{items.length} reports</Badge>
                </div>

                <div className="space-y-5">
                  {Object.entries(byDay).map(([dayLabel, dayItems]) => (
                    <div key={dayLabel}>
                      <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-2">
                        <CalendarDays className="h-3 w-3" />
                        {dayLabel}
                        <span className="text-[10px] text-muted-foreground/60">({dayItems.length})</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {dayItems.map(entry => {
                          const live = quoteMap.get(entry.ticker);
                          const price = live?.price ?? entry.price;
                          const changePercent = live?.changePercent ?? entry.changePercent;
                          const isPositive = changePercent >= 0;

                          return (
                            <Link
                              key={entry.ticker}
                              to={`/stock/${entry.ticker}`}
                              className="bg-card rounded-lg border border-border p-3 hover:border-accent/40 transition-all group relative"
                            >
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  isWatching(entry.ticker) ? removeTicker(entry.ticker) : addTicker(entry.ticker);
                                }}
                                className="absolute top-2.5 right-2.5 z-10 p-1 rounded-full hover:bg-muted transition-colors"
                              >
                                <Star className={`h-3.5 w-3.5 ${isWatching(entry.ticker) ? 'fill-accent text-accent' : 'text-muted-foreground hover:text-accent'}`} />
                              </button>
                              <div className="flex items-start justify-between pr-7 mb-1.5">
                                <div>
                                  <span className="font-bold text-sm font-mono text-foreground group-hover:text-accent transition-colors">{entry.ticker}</span>
                                  <div className="text-xs text-muted-foreground truncate max-w-[180px]">{entry.name}</div>
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-mono text-foreground">{formatCurrency(price)}</span>
                                  <span className={`text-xs font-mono font-semibold flex items-center gap-0.5 ${isPositive ? 'text-gain' : 'text-loss'}`}>
                                    {isPositive ? <ArrowUp className="h-2.5 w-2.5" /> : <ArrowDown className="h-2.5 w-2.5" />}
                                    {formatPercent(changePercent)}
                                  </span>
                                </div>
                              </div>
                              <div className="mt-1.5 flex items-center justify-between text-[10px] text-muted-foreground">
                                <span>{entry.sector}</span>
                                <span>{formatLargeNumber(entry.marketCap)}</span>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {entries.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <CalendarDays className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No upcoming earnings dates available.</p>
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
};

export default EarningsCalendar;
