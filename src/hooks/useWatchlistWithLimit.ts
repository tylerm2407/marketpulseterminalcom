import { useWatchlistStore } from '@/stores/watchlistStore';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

/**
 * Wraps watchlist store with subscription-aware add limit.
 * Guests cannot use the watchlist at all.
 * Use this instead of useWatchlistStore directly when adding tickers.
 */
export function useWatchlistWithLimit() {
  const store = useWatchlistStore();
  const { watchlistLimit } = useSubscription();
  const { isGuest } = useAuth();

  const addTicker = (ticker: string) => {
    if (isGuest) {
      toast.error('Sign up for a free account to save stocks to your watchlist.');
      return;
    }
    if (watchlistLimit !== null && store.tickers.length >= watchlistLimit && !store.isWatching(ticker)) {
      toast.error(`Watchlist limited to ${watchlistLimit} stocks on Free plan. Upgrade to Pro for unlimited.`);
      return;
    }
    store.addTicker(ticker);
  };

  return { ...store, addTicker };
}
