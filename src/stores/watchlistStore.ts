import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WatchlistState {
  tickers: string[];
  dailySummaryEnabled: boolean;
  weeklySummaryEnabled: boolean;
  addTicker: (ticker: string) => void;
  removeTicker: (ticker: string) => void;
  isWatching: (ticker: string) => boolean;
  setDailySummary: (enabled: boolean) => void;
  setWeeklySummary: (enabled: boolean) => void;
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      tickers: [],
      dailySummaryEnabled: false,
      weeklySummaryEnabled: false,
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
      setDailySummary: (enabled) => set({ dailySummaryEnabled: enabled }),
      setWeeklySummary: (enabled) => set({ weeklySummaryEnabled: enabled }),
    }),
    { name: 'stockdossier-watchlist' }
  )
);
