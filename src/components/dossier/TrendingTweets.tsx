import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, Twitter, AlertCircle, ThumbsUp, Repeat2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Tweet {
  username: string;
  displayName: string;
  content: string;
  likes: number;
  retweets: number;
  timestamp: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
}

interface TrendingTweetsProps {
  ticker: string;
  companyName: string;
}

async function fetchTweets(ticker: string, companyName: string) {
  const { data, error } = await supabase.functions.invoke('stock-tweets', {
    body: { ticker, companyName },
  });

  if (error) throw new Error(error.message || 'Failed to fetch tweets');
  if (data?.error) throw new Error(data.error);
  return data as { tweets: Tweet[]; generatedAt: string };
}

export function TrendingTweets({ ticker, companyName }: TrendingTweetsProps) {
  const [enabled, setEnabled] = useState(false);

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['stock-tweets', ticker],
    queryFn: () => fetchTweets(ticker, companyName),
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });

  if (!enabled) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-3">
        <Twitter className="h-8 w-8 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground text-center max-w-xs">
          See what people on X are saying about ${ticker} — trending tweets from analysts, traders, and influencers.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setEnabled(true)}
          className="gap-2"
        >
          <Twitter className="h-4 w-4" />
          Load Trending Tweets
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4 py-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border border-border/50 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-6 gap-3">
        <AlertCircle className="h-6 w-6 text-destructive/60" />
        <p className="text-sm text-muted-foreground text-center">
          {(error as Error)?.message || 'Could not load tweets.'}
        </p>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
          <RefreshCw className="h-3.5 w-3.5" />
          Retry
        </Button>
      </div>
    );
  }

  const tweets = data?.tweets || [];

  if (tweets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 gap-2">
        <Twitter className="h-6 w-6 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">No trending tweets found for {ticker}.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="space-y-3">
        {tweets.map((tweet, i) => (
          <TweetCard key={i} tweet={tweet} />
        ))}
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-border/50">
        <span className="text-[10px] text-muted-foreground">
          Powered by Grok AI · {data?.generatedAt ? new Date(data.generatedAt).toLocaleTimeString() : ''}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            refetch();
            toast.info('Refreshing tweets…');
          }}
          disabled={isFetching}
          className="h-7 text-xs gap-1.5"
        >
          <RefreshCw className={`h-3 w-3 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      <p className="text-[10px] text-muted-foreground italic">
        AI-curated tweets — may not reflect every perspective. Not investment advice.
      </p>
    </div>
  );
}

function TweetCard({ tweet }: { tweet: Tweet }) {
  const sentimentConfig = {
    bullish: { icon: TrendingUp, label: 'Bullish', className: 'text-gain border-gain/30 bg-gain/10' },
    bearish: { icon: TrendingDown, label: 'Bearish', className: 'text-loss border-loss/30 bg-loss/10' },
    neutral: { icon: Minus, label: 'Neutral', className: 'text-muted-foreground border-border bg-muted/50' },
  };

  const sentiment = sentimentConfig[tweet.sentiment] || sentimentConfig.neutral;
  const SentimentIcon = sentiment.icon;

  return (
    <div className="border border-border/50 rounded-lg p-3 sm:p-4 hover:border-border transition-colors">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-medium text-sm text-foreground truncate">{tweet.displayName}</span>
          <span className="text-xs text-muted-foreground truncate">{tweet.username}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${sentiment.className}`}>
            <SentimentIcon className="h-3 w-3 mr-0.5" />
            {sentiment.label}
          </Badge>
          <span className="text-[10px] text-muted-foreground">{tweet.timestamp}</span>
        </div>
      </div>
      <p className="text-sm text-foreground/85 leading-relaxed mb-2">{tweet.content}</p>
      <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <ThumbsUp className="h-3 w-3" />
          {formatCount(tweet.likes)}
        </span>
        <span className="flex items-center gap-1">
          <Repeat2 className="h-3 w-3" />
          {formatCount(tweet.retweets)}
        </span>
      </div>
    </div>
  );
}

function formatCount(n: number): string {
  if (!n || n < 0) return '0';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}
