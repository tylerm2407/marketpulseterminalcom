import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { transformFMPSearch, type SearchResult } from '@/lib/fmpTransformer';
import { stocksList } from '@/data/mockStocks';

async function fetchSearchResults(query: string): Promise<SearchResult[]> {
  const { data, error } = await supabase.functions.invoke('stock-data', {
    body: { type: 'search', query },
  });

  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(data.error);

  return transformFMPSearch(data);
}

export function useStockSearch(query: string) {
  return useQuery({
    queryKey: ['stock-search', query],
    queryFn: async () => {
      // First check mock data for instant results
      const mockResults = stocksList
        .filter(
          (s) =>
            s.ticker.toLowerCase().includes(query.toLowerCase()) ||
            s.name.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 3)
        .map((s) => ({
          ticker: s.ticker,
          name: s.name,
          exchange: s.exchange,
          type: 'stock' as const,
        }));

      try {
        const liveResults = await fetchSearchResults(query);
        // Merge: mock results first (already available), then live results (deduplicated)
        const mockTickers = new Set(mockResults.map((r) => r.ticker));
        const merged = [
          ...mockResults,
          ...liveResults.filter((r) => !mockTickers.has(r.ticker)),
        ].slice(0, 8);
        return merged;
      } catch {
        // Return mock results only if API fails
        return mockResults;
      }
    },
    enabled: query.length >= 1,
    staleTime: 30 * 1000, // 30 seconds
    retry: 0,
  });
}
