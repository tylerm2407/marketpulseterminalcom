import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, Sparkles, AlertCircle, Calendar, CalendarDays } from 'lucide-react';
import { toast } from 'sonner';
import { handleAiUsageNotification } from '@/lib/aiUsageNotifications';

interface WatchlistSummaryProps {
  tickers: string[];
  period: 'daily' | 'weekly';
}

async function fetchWatchlistSummary(tickers: string[], period: string) {
  const { data, error } = await supabase.functions.invoke('watchlist-summary', {
    body: { tickers, period },
  });
  if (error) throw new Error(error.message || 'Failed to fetch summary');
  if (data?.error) throw new Error(data.error);
  handleAiUsageNotification(data);
  return data as { content: string; generatedAt: string; period: string };
}

export function WatchlistSummary({ tickers, period }: WatchlistSummaryProps) {
  const [enabled, setEnabled] = useState(false);

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['watchlist-summary', period, tickers],
    queryFn: () => fetchWatchlistSummary(tickers, period),
    enabled,
    staleTime: period === 'weekly' ? 30 * 60 * 1000 : 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
  });

  const PeriodIcon = period === 'weekly' ? CalendarDays : Calendar;
  const label = period === 'weekly' ? 'Weekly Summary' : 'Daily Summary';

  if (!enabled) {
    return (
      <div className="flex flex-col items-center justify-center py-6 gap-3">
        <PeriodIcon className="h-7 w-7 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground text-center max-w-xs">
          Get an AI-powered {period} summary of news and sentiment across all {tickers.length} stocks in your watchlist.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setEnabled(true)}
          className="gap-2"
        >
          <Sparkles className="h-4 w-4" />
          Generate {label}
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-3 py-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/6" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-6 gap-3">
        <AlertCircle className="h-6 w-6 text-destructive/60" />
        <p className="text-sm text-muted-foreground text-center">
          {(error as Error)?.message || 'Could not generate summary.'}
        </p>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
          <RefreshCw className="h-3.5 w-3.5" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed text-foreground/90 [&_ul]:space-y-1 [&_li]:text-foreground/80 [&_strong]:text-foreground [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm">
        <SummaryContent content={data?.content || ''} />
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-border/50">
        <span className="text-[10px] text-muted-foreground">
          AI-generated · {data?.generatedAt ? new Date(data.generatedAt).toLocaleTimeString() : ''}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            refetch();
            toast.info(`Refreshing ${period} summary…`);
          }}
          disabled={isFetching}
          className="h-7 text-xs gap-1.5"
        >
          <RefreshCw className={`h-3 w-3 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      <p className="text-[10px] text-muted-foreground italic">
        AI-generated summary — may not reflect real-time data. Not investment advice.
      </p>
    </div>
  );
}

function SummaryContent({ content }: { content: string }) {
  const lines = content.split('\n');
  return (
    <div>
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <br key={i} />;
        if (trimmed.startsWith('#### ')) return <h4 key={i} className="font-semibold mt-3 mb-1 text-sm">{renderInline(trimmed.slice(5))}</h4>;
        if (trimmed.startsWith('### ')) return <h3 key={i} className="font-semibold mt-3 mb-1">{renderInline(trimmed.slice(4))}</h3>;
        if (trimmed.startsWith('## ')) return <h2 key={i} className="font-semibold mt-3 mb-1">{renderInline(trimmed.slice(3))}</h2>;
        if (trimmed.startsWith('# ')) return <h1 key={i} className="font-bold mt-3 mb-1">{renderInline(trimmed.slice(2))}</h1>;
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <div key={i} className="flex gap-2 ml-1">
              <span className="text-muted-foreground shrink-0">•</span>
              <span>{renderInline(trimmed.slice(2))}</span>
            </div>
          );
        }
        return <p key={i} className="my-1">{renderInline(trimmed)}</p>;
      })}
    </div>
  );
}

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}
