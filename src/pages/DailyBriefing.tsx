import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Footer } from '@/components/layout/Footer';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Zap, ExternalLink, Radio } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// ─── Types ────────────────────────────────────────────────────────────────────

interface NewsItem {
  title: string;
  url: string;
  publishedDate: string;
  text: string;
  site: string;
  category: string;
  imageUrl?: string;
}

interface AggregatorResponse {
  items: NewsItem[];
  sources: string[];
  fetchedAt: string;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

function useNewsAggregator() {
  return useQuery({
    queryKey: ['news-aggregator'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('news-aggregator', {});
      if (error) throw error;
      return data as AggregatorResponse;
    },
    staleTime: 10 * 60 * 1000,
    retry: 2,
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 2) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function splitText(text: string): { happening: string; matters: string } {
  if (!text) return { happening: '', matters: '' };
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  if (sentences.length <= 2) {
    return { happening: text.trim(), matters: '' };
  }
  const mattersStart = Math.max(sentences.length - 2, 1);
  const happening = sentences.slice(0, mattersStart).join(' ').trim();
  const matters = sentences.slice(mattersStart).join(' ').trim();
  return { happening, matters };
}

const CATEGORY_COLORS: Record<string, string> = {
  Markets: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Finance: 'bg-green-500/10 text-green-400 border-green-500/20',
  Community: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
};

const SOURCE_URLS: Record<string, string> = {
  CNBC: 'https://cnbc.com',
  MarketWatch: 'https://marketwatch.com',
  Nasdaq: 'https://nasdaq.com/news',
  'r/investing': 'https://reddit.com/r/investing',
  'r/stocks': 'https://reddit.com/r/stocks',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StoryCard({ item }: { item: NewsItem }) {
  const { happening, matters } = splitText(item.text);
  const categoryColor =
    CATEGORY_COLORS[item.category] ?? 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';

  return (
    <div
      className="card-elevated rounded-xl border overflow-hidden"
      style={{ borderColor: 'var(--border-subtle)' }}
    >
      {item.imageUrl && (
        <div className="w-full h-40 overflow-hidden">
          <img
            src={item.imageUrl}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).parentElement!.style.display = 'none';
            }}
          />
        </div>
      )}
      <div className="p-5">
        {/* Meta row */}
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <span
            className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${categoryColor}`}
          >
            {item.category}
          </span>
          <span
            className="text-[11px] font-semibold"
            style={{ color: 'var(--accent-primary)' }}
          >
            {item.site}
          </span>
          <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
            · {formatTimeAgo(item.publishedDate)}
          </span>
        </div>

        {/* Headline */}
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-block mb-4"
        >
          <h3
            className="font-semibold text-base leading-snug group-hover:text-[var(--accent-primary)] transition-colors"
            style={{ color: 'var(--text-primary)' }}
          >
            {item.title}
            <ExternalLink
              className="inline-block ml-1.5 h-3 w-3 opacity-0 group-hover:opacity-60 transition-opacity"
              style={{ verticalAlign: 'middle' }}
            />
          </h3>
        </a>

        {/* What's happening */}
        {happening && (
          <div className="mb-3">
            <span
              className="text-[10px] font-bold uppercase tracking-widest"
              style={{ color: 'var(--text-muted)' }}
            >
              What&apos;s happening
            </span>
            <p
              className="mt-1 text-sm leading-relaxed"
              style={{ color: 'var(--text-secondary)' }}
            >
              {happening}
            </p>
          </div>
        )}

        {/* Why it matters */}
        {matters && (
          <div
            className="mt-3 pt-3 border-t"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            <span
              className="text-[10px] font-bold uppercase tracking-widest"
              style={{ color: 'var(--accent-primary)' }}
            >
              Why it matters
            </span>
            <p
              className="mt-1 text-sm leading-relaxed italic"
              style={{ color: 'var(--text-secondary)' }}
            >
              {matters}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function StoryCardSkeleton() {
  return (
    <div
      className="card-elevated rounded-xl border p-5"
      style={{ borderColor: 'var(--border-subtle)' }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Skeleton className="h-4 w-16 rounded-full" />
        <Skeleton className="h-4 w-20" />
      </div>
      <Skeleton className="h-5 w-full mb-1" />
      <Skeleton className="h-5 w-4/5 mb-4" />
      <Skeleton className="h-3 w-24 mb-2" />
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
}

function SourceItem({ item }: { item: NewsItem }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-start gap-3 py-3 border-b last:border-b-0"
      style={{ borderColor: 'var(--border-subtle)' }}
    >
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-medium leading-snug line-clamp-2 group-hover:text-[var(--accent-primary)] transition-colors"
          style={{ color: 'var(--text-primary)' }}
        >
          {item.title}
        </p>
        <span
          className="text-[11px] mt-0.5 block"
          style={{ color: 'var(--text-muted)' }}
        >
          {formatTimeAgo(item.publishedDate)}
        </span>
      </div>
      <ExternalLink
        className="shrink-0 h-3.5 w-3.5 mt-0.5 opacity-0 group-hover:opacity-60 transition-opacity"
        style={{ color: 'var(--text-muted)' }}
      />
    </a>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const ALL_SOURCES = ['CNBC', 'MarketWatch', 'r/investing', 'r/stocks', 'Nasdaq'];

export default function DailyBriefing() {
  const { data, isLoading, isError, error } = useNewsAggregator();
  const [activeSource, setActiveSource] = useState<string>(ALL_SOURCES[0]);

  const topStories = data?.items.slice(0, 6) ?? [];

  const itemsBySource = (source: string) =>
    (data?.items ?? []).filter((item) => item.site === source).slice(0, 8);

  return (
    <div className="min-h-screen bg-background pb-16 sm:pb-0">
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--bg-elevated)' }}>
              <Zap className="h-5 w-5" style={{ color: 'var(--accent-primary)' }} />
            </div>
            <h1
              className="text-3xl font-display font-bold"
              style={{ color: 'var(--text-primary)' }}
            >
              Daily Briefing
            </h1>
          </div>
          <div className="ml-[52px] flex items-center gap-3">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {formatDate(new Date())}
            </p>
            {data?.fetchedAt && (
              <Badge
                variant="outline"
                className="text-[10px] border-[var(--border-subtle)] text-[var(--text-muted)] font-mono"
              >
                Updated {formatTimeAgo(data.fetchedAt)}
              </Badge>
            )}
          </div>
        </div>

        {/* Live indicator */}
        <div className="flex items-center gap-2 mb-6">
          <Radio
            className="h-3.5 w-3.5 animate-pulse"
            style={{ color: 'var(--accent-success)' }}
          />
          <span
            className="text-xs font-medium"
            style={{ color: 'var(--accent-success)' }}
          >
            Live from {ALL_SOURCES.length} sources
          </span>
          {data?.sources && (
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              · {data.items.length} stories
            </span>
          )}
        </div>

        {/* Error state */}
        {isError && (
          <div
            className="card-elevated rounded-xl border p-6 text-center mb-8"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            <Zap
              className="h-10 w-10 mx-auto mb-3 opacity-30"
              style={{ color: 'var(--text-muted)' }}
            />
            <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
              Unable to load briefing
            </p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              {error instanceof Error ? error.message : 'Please try again in a moment.'}
            </p>
          </div>
        )}

        {/* Top stories section */}
        <div className="mb-10">
          <h2
            className="text-lg font-display font-bold mb-4"
            style={{ color: 'var(--text-primary)' }}
          >
            Top Stories
          </h2>

          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <StoryCardSkeleton key={i} />
              ))}
            </div>
          ) : topStories.length > 0 ? (
            <div className="space-y-4">
              {topStories.map((item, i) => (
                <StoryCard key={`${item.url}-${i}`} item={item} />
              ))}
            </div>
          ) : !isError ? (
            <div
              className="card-elevated rounded-xl border p-8 text-center"
              style={{ borderColor: 'var(--border-subtle)' }}
            >
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                No stories available right now. Check back soon.
              </p>
            </div>
          ) : null}
        </div>

        {/* More Sources section */}
        {(isLoading || (data && data.items.length > 0)) && (
          <div>
            <h2
              className="text-lg font-display font-bold mb-4"
              style={{ color: 'var(--text-primary)' }}
            >
              More Sources
            </h2>

            <Tabs value={activeSource} onValueChange={setActiveSource}>
              <TabsList
                className="mb-4 flex-wrap h-auto gap-1 bg-transparent p-0"
                style={{ borderBottom: '1px solid var(--border-subtle)' }}
              >
                {ALL_SOURCES.map((src) => (
                  <TabsTrigger
                    key={src}
                    value={src}
                    className="text-xs data-[state=active]:text-[var(--accent-primary)] data-[state=active]:border-b-2 data-[state=active]:border-[var(--accent-primary)] rounded-none pb-2"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {src}
                  </TabsTrigger>
                ))}
              </TabsList>

              {ALL_SOURCES.map((src) => (
                <TabsContent key={src} value={src}>
                  {isLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div
                          key={i}
                          className="py-3 border-b"
                          style={{ borderColor: 'var(--border-subtle)' }}
                        >
                          <Skeleton className="h-4 w-full mb-1" />
                          <Skeleton className="h-4 w-2/3 mb-2" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      ))}
                    </div>
                  ) : itemsBySource(src).length > 0 ? (
                    <div
                      className="card-elevated rounded-xl border px-4"
                      style={{ borderColor: 'var(--border-subtle)' }}
                    >
                      {itemsBySource(src).map((item, i) => (
                        <SourceItem key={`${item.url}-${i}`} item={item} />
                      ))}
                    </div>
                  ) : (
                    <p
                      className="text-sm py-4"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      No stories available from {src} right now.
                    </p>
                  )}

                  {/* Source attribution */}
                  {SOURCE_URLS[src] && (
                    <a
                      href={SOURCE_URLS[src]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-3 text-[11px] transition-colors hover:text-[var(--accent-primary)]"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      Visit {src} <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </div>
        )}

        {/* Attribution footer */}
        <p className="text-center text-[11px] mt-10" style={{ color: 'var(--text-muted)' }}>
          Stories aggregated from{' '}
          {ALL_SOURCES.map((src, i) => (
            <span key={src}>
              <a
                href={SOURCE_URLS[src]}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[var(--text-secondary)] transition-colors"
              >
                {src}
              </a>
              {i < ALL_SOURCES.length - 1 ? ', ' : ''}
            </span>
          ))}
          . Cached for 15 minutes.
        </p>
      </main>
      <Footer />
    </div>
  );
}
