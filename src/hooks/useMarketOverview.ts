import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface IndexData {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

export interface SectorData {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

export interface MarketOverviewData {
  indices: IndexData[];
  sectors: SectorData[];
  vix?: IndexData;
  timestamp: string;
}

// Mock fallback data
const MOCK_OVERVIEW: MarketOverviewData = {
  indices: [
    { ticker: 'SPY', name: 'S&P 500', price: 6045.32, change: 18.42, changePercent: 0.31 },
    { ticker: 'QQQ', name: 'NASDAQ 100', price: 527.84, change: 4.12, changePercent: 0.79 },
    { ticker: 'DIA', name: 'Dow Jones', price: 443.21, change: -1.85, changePercent: -0.42 },
    { ticker: 'IWM', name: 'Russell 2000', price: 228.95, change: 2.34, changePercent: 1.03 },
  ],
  sectors: [
    { ticker: 'XLK', name: 'Technology', price: 232.50, change: 3.12, changePercent: 1.36 },
    { ticker: 'XLC', name: 'Communication Services', price: 98.42, change: 1.05, changePercent: 1.08 },
    { ticker: 'XLY', name: 'Consumer Cyclical', price: 212.30, change: 1.84, changePercent: 0.87 },
    { ticker: 'XLF', name: 'Financial Services', price: 48.92, change: 0.22, changePercent: 0.45 },
    { ticker: 'XLV', name: 'Healthcare', price: 148.75, change: 0.38, changePercent: 0.26 },
    { ticker: 'XLI', name: 'Industrials', price: 132.18, change: -0.12, changePercent: -0.09 },
    { ticker: 'XLP', name: 'Consumer Defensive', price: 81.45, change: -0.28, changePercent: -0.34 },
    { ticker: 'XLE', name: 'Energy', price: 88.32, change: -0.72, changePercent: -0.81 },
    { ticker: 'XLB', name: 'Materials', price: 87.20, change: -0.95, changePercent: -1.08 },
    { ticker: 'XLRE', name: 'Real Estate', price: 42.18, change: -0.58, changePercent: -1.36 },
    { ticker: 'XLU', name: 'Utilities', price: 75.62, change: -1.12, changePercent: -1.46 },
  ],
  timestamp: new Date().toISOString(),
};

async function fetchMarketOverview(): Promise<MarketOverviewData> {
  const { data, error } = await supabase.functions.invoke('stock-data', {
    body: { type: 'market-overview' },
  });

  if (error) throw new Error(error.message || 'Failed to fetch market overview');
  if (data?.error) throw new Error(data.error);

  return data as MarketOverviewData;
}

export function useMarketOverview() {
  return useQuery({
    queryKey: ['market-overview'],
    queryFn: async () => {
      try {
        return await fetchMarketOverview();
      } catch (err) {
        console.warn('Market overview fetch failed, using mock data:', err);
        return MOCK_OVERVIEW;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000,
    retry: 1,
  });
}
