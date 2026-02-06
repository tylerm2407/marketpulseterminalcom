import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WatchlistState {
  tickers: string[];
  addTicker: (ticker: string) => void;
  removeTicker: (ticker: string) => void;
  isWatching: (ticker: string) => boolean;
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      tickers: [],
      addTicker: (ticker) =>
        set((state) => ({
          tickers: state.tickers.includes(ticker)
            ? state.tickers
            : [...state.tickers, ticker],
        })),
      removeTicker: (ticker) =>
        set((state) => ({
          tickers: state.tickers.filter((t) => t !== ticker),
        })),
      isWatching: (ticker) => get().tickers.includes(ticker),
    }),
    { name: 'stockdossier-watchlist' }
  )
);
