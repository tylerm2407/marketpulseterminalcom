import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { TickerMarquee } from '@/components/TickerMarquee';
import { Newspaper, ExternalLink, Loader2, Sparkles } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { LatestBuzz } from '@/components/dossier/LatestBuzz';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

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
      // Fetch news for top tickers
      const { data, error } = await supabase.functions.invoke('stock-data', {
        body: { type: 'dossier', ticker: 'AAPL' },
      });
      if (error) throw error;

      // Also try a couple more tickers for variety
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

      // Deduplicate by title and sort by date
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

export default function News() {
  const { data: news, isLoading } = useMarketNews();

  const [selectedBuzzTicker, setSelectedBuzzTicker] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background pb-16 sm:pb-0">
      <Header />
      <TickerMarquee />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Latest Buzz Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-accent" />
            <h2 className="text-lg font-bold text-foreground">Latest Buzz</h2>
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
            <div className="bg-card rounded-lg border border-border card-elevated p-4">
              <LatestBuzz ticker={selectedBuzzTicker} companyName={selectedBuzzTicker} />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 mb-6">
          <Newspaper className="h-5 w-5 text-accent" />
          <h1 className="text-2xl font-bold text-foreground">Trending News</h1>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground text-sm">
              Loading latest news…
            </span>
          </div>
        ) : !news?.length ? (
          <div className="text-center py-20 bg-card rounded-lg border border-border card-elevated">
            <Newspaper className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-foreground mb-2">
              No news available
            </h2>
            <p className="text-sm text-muted-foreground">
              Check back soon for the latest market news.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {news.map((item, i) => (
              <a
                key={i}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-card rounded-lg border border-border card-elevated p-4 hover:border-accent/40 transition-all duration-200 group"
              >
                <div className="flex items-start gap-4">
                  {item.image && (
                    <img
                      src={item.image}
                      alt=""
                      className="w-20 h-14 rounded object-cover shrink-0 hidden sm:block"
                      loading="lazy"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground text-sm leading-snug group-hover:text-accent transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                      {item.text}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {item.symbol}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {item.site}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        · {formatRelativeDate(item.publishedDate)}
                      </span>
                      <ExternalLink className="h-3 w-3 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
