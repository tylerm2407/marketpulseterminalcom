import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { transformFMPSearch, type SearchResult } from '@/lib/fmpTransformer';
import { searchStockDirectory } from '@/data/stockDirectory';

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
      // Search the local directory for instant results (works offline / when API is rate-limited)
      const localResults = searchStockDirectory(query, 8).map((s) => ({
        ticker: s.t,
        name: s.n,
        exchange: s.e,
        type: 'stock' as const,
      }));

      try {
        const liveResults = await fetchSearchResults(query);
        if (liveResults.length === 0) return localResults;

        // Merge: local results first, then live results (deduplicated)
        const seen = new Set(localResults.map((r) => r.ticker));
        const merged = [
          ...localResults,
          ...liveResults.filter((r) => !seen.has(r.ticker)),
        ].slice(0, 10);
        return merged;
      } catch {
        // Return local results if API fails
        return localResults;
      }
    },
    enabled: query.length >= 1,
    staleTime: 30 * 1000,
    retry: 0,
  });
}
