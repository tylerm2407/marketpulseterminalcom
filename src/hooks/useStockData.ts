import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { transformFMPToStockData, transformFMPQuotes, type QuoteData } from '@/lib/fmpTransformer';
import { getStock as getMockStock } from '@/data/mockStocks';
import type { StockData } from '@/types/stock';

async function fetchStockDossier(ticker: string): Promise<StockData> {
  const { data, error } = await supabase.functions.invoke('stock-data', {
    body: { type: 'dossier', ticker },
  });

  if (error) throw new Error(error.message || 'Failed to fetch stock data');
  if (data?.error) throw new Error(data.error);

  return transformFMPToStockData(data);
}

async function fetchQuotes(tickers: string[]): Promise<QuoteData[]> {
  if (!tickers.length) return [];

  const { data, error } = await supabase.functions.invoke('stock-data', {
    body: { type: 'quote', tickers },
  });

  if (error) throw new Error(error.message || 'Failed to fetch quotes');
  if (data?.error) throw new Error(data.error);

  return transformFMPQuotes(data);
}

export function useStockDossier(ticker: string | undefined) {
  return useQuery({
    queryKey: ['stock-dossier', ticker],
    queryFn: async () => {
      if (!ticker) throw new Error('No ticker provided');
      try {
        return await fetchStockDossier(ticker);
      } catch (err) {
        // Fall back to mock data if API fails
        console.warn(`Live data fetch failed for ${ticker}, using mock data:`, err);
        const mock = getMockStock(ticker);
        if (mock) return mock;
        throw err;
      }
    },
    enabled: !!ticker,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes cache
    retry: 1,
  });
}

export function useWatchlistQuotes(tickers: string[]) {
  return useQuery({
    queryKey: ['watchlist-quotes', tickers],
    queryFn: async () => {
      try {
        return await fetchQuotes(tickers);
      } catch {
        // Return empty — watchlist will fall back to mock data
        return [];
      }
    },
    enabled: tickers.length > 0,
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 60 * 1000, // Auto-refresh every minute
    retry: 1,
  });
}
