import { Footer } from '@/components/layout/Footer';
import { TickerMarquee } from '@/components/TickerMarquee';
import { Newspaper, ExternalLink, Loader2, Sparkles, Bot, X, Radio } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { LatestBuzz } from '@/components/dossier/LatestBuzz';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

interface NewsItem {
  title: string;
  text: string;
  url: string;
  site: string;
  publishedDate: string;
  symbol: string;
  image?: string;
}

const trendingTickers = ['AAPL', 'MSFT', 'NVDA', 'GOOGL', 'AMZN', 'TSLA'];

function useMarketNews() {
  return useQuery({
    queryKey: ['market-news'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('stock-data', {
        body: { type: 'dossier', ticker: 'AAPL' },
      });
      if (error) throw error;

      const results = await Promise.allSettled(
        trendingTickers.slice(1, 4).map((t) =>
          supabase.functions.invoke('stock-data', {
            body: { type: 'dossier', ticker: t },
          })
        )
      );

      const allNews: NewsItem[] = [...(data?.news || [])];
      for (const result of results) {
        if (result.status === 'fulfilled' && result.value.data?.news) {
          allNews.push(...result.value.data.news);
        }
      }

      const seen = new Set<string>();
      return allNews
        .filter((n) => {
          if (seen.has(n.title)) return false;
          seen.add(n.title);
          return true;
        })
        .sort(
          (a, b) =>
            new Date(b.publishedDate).getTime() -
            new Date(a.publishedDate).getTime()
        )
        .slice(0, 20);
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

function formatRelativeDate(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
}

function AiSummaryButton({ item }: { item: NewsItem }) {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSummarize = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (summary) {
      setOpen(!open);
      return;
    }

    setLoading(true);
    setOpen(true);
    try {
      const { data, error } = await supabase.functions.invoke('news-summarize', {
        body: { title: item.title, text: item.text, site: item.site },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setSummary(data.summary);
    } catch (err: any) {
      toast({ title: 'Summary failed', description: err.message || 'Could not summarize article', variant: 'destructive' });
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <button
        onClick={handleSummarize}
        className="inline-flex items-center gap-1 text-[10px] font-medium text-[var(--accent-primary)] hover:text-[var(--accent-glow)] transition-colors"
      >
        <Bot className="h-3 w-3" />
        {loading ? 'Summarizing…' : open ? 'Hide Summary' : 'AI Summary'}
      </button>
      {open && (
        <div
          className="mt-2 p-3 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] leading-relaxed relative"
          onClick={(e) => e.preventDefault()}
        >
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(false); }}
            className="absolute top-2 right-2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            <X className="h-3 w-3" />
          </button>
          {loading ? (
            <div className="flex items-center gap-2 py-2">
              <Loader2 className="h-3 w-3 animate-spin text-[var(--accent-primary)]" />
              <span>Generating summary…</span>
            </div>
          ) : (
            <div className="prose-sm whitespace-pre-wrap pr-4">{summary}</div>
          )}
        </div>
      )}
    </div>
  );
}

const MORE_SOURCES_TABS = ['All', 'CNBC', 'MarketWatch', 'Nasdaq', 'r/investing', 'r/stocks'] as const;
type MoreSourceTab = typeof MORE_SOURCES_TABS[number];

function useAggregatedNews(source: string) {
  return useQuery({
    queryKey: ['aggregated-news', source],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('news-aggregator', {});
      if (error) throw error;
      const items = (data?.items ?? []) as Array<{
        title: string; url: string; publishedDate: string;
        text: string; site: string; category: string;
      }>;
      if (source === 'All') return items;
      return items.filter((item) => item.site === source);
    },
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });
}

function MoreSourcesPanel() {
  const [activeTab, setActiveTab] = useState<MoreSourceTab>('All');
  const { data: items, isLoading } = useAggregatedNews(activeTab);

  return (
    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as MoreSourceTab)}>
      <TabsList className="mb-4 flex flex-wrap gap-1 h-auto bg-transparent p-0">
        {MORE_SOURCES_TABS.map((tab) => (
          <TabsTrigger
            key={tab}
            value={tab}
            className="text-xs px-3 py-1.5 rounded-md border border-[var(--border-subtle)] data-[state=active]:bg-[var(--accent-primary)] data-[state=active]:text-white data-[state=active]:border-[var(--accent-primary)]"
          >
            {tab}
          </TabsTrigger>
        ))}
      </TabsList>

      {MORE_SOURCES_TABS.map((tab) => (
        <TabsContent key={tab} value={tab} className="mt-0">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="card-elevated p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-full" />
                </div>
              ))}
            </div>
          ) : !items?.length ? (
            <div className="text-center py-10 card-elevated">
              <p className="text-sm text-[var(--text-muted)]">No recent articles from this source.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item, i) => (
                <a
                  key={i}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card-elevated p-4 block group hover:border-[var(--border-active)] transition-colors"
                >
                  <h3 className="font-semibold text-[var(--text-primary)] text-sm leading-snug group-hover:text-[var(--accent-primary)] transition-colors line-clamp-2 mb-1.5">
                    {item.title}
                  </h3>
                  {item.text && (
                    <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed mb-2">
                      {item.text}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-[10px] text-[var(--text-muted)]">
                    <Badge variant="outline" className="text-[10px] font-mono border-[var(--border-subtle)] text-[var(--text-muted)]">
                      {item.site}
                    </Badge>
                    <span>· {formatRelativeDate(item.publishedDate)}</span>
                    <span className="ml-auto flex items-center gap-1 text-[var(--accent-primary)]">
                      Read <ExternalLink className="h-3 w-3" />
                    </span>
                  </div>
                </a>
              ))}
            </div>
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
}

export default function News() {
  const { data: news, isLoading } = useMarketNews();
  const [selectedBuzzTicker, setSelectedBuzzTicker] = useState<string | null>(null);

  return (
    <div className="min-h-screen pb-16 sm:pb-0" style={{ backgroundColor: 'var(--bg-base)' }}>
      <TickerMarquee />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Latest Buzz Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-[var(--accent-primary)]" />
            <h2 className="text-lg font-bold text-[var(--text-primary)]">Latest Buzz</h2>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {trendingTickers.map((t) => (
              <Button
                key={t}
                variant={selectedBuzzTicker === t ? 'default' : 'outline'}
                size="sm"
                className="text-xs font-mono"
                onClick={() => setSelectedBuzzTicker(selectedBuzzTicker === t ? null : t)}
              >
                {t}
              </Button>
            ))}
          </div>
          {selectedBuzzTicker && (
            <div className="card-elevated p-4">
              <LatestBuzz ticker={selectedBuzzTicker} companyName={selectedBuzzTicker} />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 mb-6">
          <Newspaper className="h-5 w-5 text-[var(--accent-primary)]" />
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Trending News</h1>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-[var(--text-muted)]" />
            <span className="ml-2 text-[var(--text-muted)] text-sm">Loading latest news…</span>
          </div>
        ) : !news?.length ? (
          <div className="text-center py-20 card-elevated">
            <Newspaper className="h-12 w-12 text-[var(--text-muted)] mx-auto mb-4 opacity-30" />
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No news available</h2>
            <p className="text-sm text-[var(--text-secondary)]">Check back soon for the latest market news.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {news.map((item, i) => (
              <div
                key={i}
                className="card-elevated p-4 group"
              >
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4"
                >
                  {item.image && (
                    <img
                      src={item.image}
                      alt=""
                      className="w-20 h-14 rounded object-cover shrink-0 hidden sm:block"
                      loading="lazy"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[var(--text-primary)] text-sm leading-snug group-hover:text-[var(--accent-primary)] transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] mt-1.5 line-clamp-2 leading-relaxed">
                      {item.text}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-[10px] font-mono border-[var(--border-subtle)] text-[var(--text-muted)]">
                        {item.symbol}
                      </Badge>
                      <span className="text-[10px] text-[var(--text-muted)]">{item.site}</span>
                      <span className="text-[10px] text-[var(--text-muted)]">· {formatRelativeDate(item.publishedDate)}</span>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-auto text-[10px] text-[var(--accent-primary)] hover:text-[var(--accent-glow)] flex items-center gap-1 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Read article <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </a>
                {/* AI Summary */}
                <div className="mt-2 pt-2 border-t border-[var(--border-subtle)]">
                  <AiSummaryButton item={item} />
                </div>
              </div>
            ))}
          </div>
        )}
        {/* More News Sources Section */}
        <div className="mt-10">
          <div className="flex items-center gap-2 mb-4">
            <Radio className="h-5 w-5 text-[var(--accent-primary)]" />
            <h2 className="text-xl font-bold text-[var(--text-primary)]">More Sources</h2>
            <span className="text-xs text-[var(--text-muted)]">CNBC · MarketWatch · Reddit · Nasdaq</span>
          </div>
          <MoreSourcesPanel />
        </div>
      </main>
      <Footer />
    </div>
  );
}
