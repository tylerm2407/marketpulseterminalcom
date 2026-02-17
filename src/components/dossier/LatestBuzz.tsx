import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, Sparkles, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { handleAiUsageNotification } from '@/lib/aiUsageNotifications';

interface LatestBuzzProps {
  ticker: string;
  companyName: string;
}

async function fetchBuzz(ticker: string, companyName: string) {
  const { data, error } = await supabase.functions.invoke('stock-buzz', {
    body: { ticker, companyName },
  });

  if (error) throw new Error(error.message || 'Failed to fetch buzz');
  if (data?.error) throw new Error(data.error);
  handleAiUsageNotification(data);
  return data as { content: string; generatedAt: string };
}

export function LatestBuzz({ ticker, companyName }: LatestBuzzProps) {
  const [enabled, setEnabled] = useState(false);

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['stock-buzz', ticker],
    queryFn: () => fetchBuzz(ticker, companyName),
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });

  if (!enabled) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-3">
        <Sparkles className="h-8 w-8 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground text-center max-w-xs">
          Get AI-powered insights on the latest news, tweets, and social media buzz for {ticker}.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setEnabled(true)}
          className="gap-2"
        >
          <Sparkles className="h-4 w-4" />
          Load Latest Buzz
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
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-6 gap-3">
        <AlertCircle className="h-6 w-6 text-destructive/60" />
        <p className="text-sm text-muted-foreground text-center">
          {(error as Error)?.message || 'Could not load buzz.'}
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
        <BuzzContent content={data?.content || ''} />
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
            toast.info('Refreshing buzz…');
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

function BuzzContent({ content }: { content: string }) {
  // Simple markdown-like rendering: bold, bullets, headings
  const lines = content.split('\n');

  return (
    <div>
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <br key={i} />;

        // Headings
        if (trimmed.startsWith('### ')) {
          return <h3 key={i} className="font-semibold mt-3 mb-1">{renderInline(trimmed.slice(4))}</h3>;
        }
        if (trimmed.startsWith('## ')) {
          return <h2 key={i} className="font-semibold mt-3 mb-1">{renderInline(trimmed.slice(3))}</h2>;
        }
        if (trimmed.startsWith('# ')) {
          return <h1 key={i} className="font-bold mt-3 mb-1">{renderInline(trimmed.slice(2))}</h1>;
        }

        // Bullet points
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
  // Handle **bold**
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}
