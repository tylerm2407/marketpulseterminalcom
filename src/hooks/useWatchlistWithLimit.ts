import { useWatchlistStore } from '@/stores/watchlistStore';
import { useSubscription } from '@/hooks/useSubscription';
import { toast } from 'sonner';

/**
 * Wraps watchlist store with subscription-aware add limit.
 * Use this instead of useWatchlistStore directly when adding tickers.
 */
export function useWatchlistWithLimit() {
  const store = useWatchlistStore();
  const { watchlistLimit } = useSubscription();

  const addTicker = (ticker: string) => {
    if (watchlistLimit !== null && store.tickers.length >= watchlistLimit && !store.isWatching(ticker)) {
      toast.error(`Watchlist limited to ${watchlistLimit} stocks on Free plan. Upgrade to Pro for unlimited.`);
      return;
    }
    store.addTicker(ticker);
  };

  return { ...store, addTicker };
}
