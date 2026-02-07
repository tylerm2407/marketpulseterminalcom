import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const FMP_BASE = 'https://financialmodelingprep.com/stable';

async function fetchFMP(path: string, params: Record<string, string>, apiKey: string): Promise<any> {
  const url = new URL(`${FMP_BASE}/${path}`);
  url.searchParams.set('apikey', apiKey);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  try {
    console.log('FMP fetch:', url.toString().replace(/apikey=[^&]+/, 'apikey=***'));
    const res = await fetch(url.toString());
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`FMP error ${res.status} for ${path}:`, errorText.substring(0, 200));
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error(`FMP fetch error for ${path}:`, err);
    return null;
  }
}

async function fetchDossier(ticker: string, apiKey: string) {
  const sym = { symbol: ticker };
  const [
    profile, quote,
    incomeAnnual, incomeQuarterly,
    balanceAnnual, balanceQuarterly,
    cashflowAnnual, cashflowQuarterly,
    priceHistory, news,
    holders, insiders,
    keyMetrics, ratios,
  ] = await Promise.all([
    fetchFMP('profile', sym, apiKey),
    fetchFMP('quote', sym, apiKey),
    fetchFMP('income-statement', { ...sym, period: 'annual', limit: '3' }, apiKey),
    fetchFMP('income-statement', { ...sym, period: 'quarter', limit: '4' }, apiKey),
    fetchFMP('balance-sheet-statement', { ...sym, period: 'annual', limit: '3' }, apiKey),
    fetchFMP('balance-sheet-statement', { ...sym, period: 'quarter', limit: '4' }, apiKey),
    fetchFMP('cash-flow-statement', { ...sym, period: 'annual', limit: '3' }, apiKey),
    fetchFMP('cash-flow-statement', { ...sym, period: 'quarter', limit: '4' }, apiKey),
    fetchFMP('historical-price-eod/full', { ...sym, from: getDateNDaysAgo(365), to: getToday() }, apiKey),
    fetchFMP('stock-news', { tickers: ticker, limit: '10' }, apiKey),
    fetchFMP('institutional-holder', sym, apiKey),
    fetchFMP('insider-trading', sym, apiKey),
    fetchFMP('key-metrics', { ...sym, period: 'annual', limit: '5' }, apiKey),
    fetchFMP('ratios', { ...sym, period: 'annual', limit: '3' }, apiKey),
  ]);

  return {
    profile: Array.isArray(profile) ? profile[0] : profile,
    quote: Array.isArray(quote) ? quote[0] : quote,
    incomeAnnual: incomeAnnual || [],
    incomeQuarterly: incomeQuarterly || [],
    balanceAnnual: balanceAnnual || [],
    balanceQuarterly: balanceQuarterly || [],
    cashflowAnnual: cashflowAnnual || [],
    cashflowQuarterly: cashflowQuarterly || [],
    priceHistory: Array.isArray(priceHistory) ? priceHistory : (priceHistory?.historical || []),
    news: news || [],
    holders: Array.isArray(holders) ? holders.slice(0, 10) : [],
    insiders: Array.isArray(insiders) ? insiders.slice(0, 10) : [],
    keyMetrics: Array.isArray(keyMetrics) ? keyMetrics : [],
    ratios: ratios || [],
    revenueSegments: [],
    geoSegments: [],
  };
}

async function fetchQuotes(tickers: string[], apiKey: string) {
  // Fetch individual quotes in parallel (batch-quote requires a higher FMP plan)
  const results = await Promise.all(
    tickers.map(async (ticker) => {
      const data = await fetchFMP('quote', { symbol: ticker }, apiKey);
      // FMP returns an array for single quote; grab first element
      if (Array.isArray(data) && data.length > 0) return data[0];
      return data;
    })
  );
  return results.filter(Boolean);
}

async function fetchSearch(query: string, apiKey: string) {
  // Try symbol search first, then name search
  const [symbolResults, nameResults] = await Promise.all([
    fetchFMP('search-symbol', { query, limit: '5' }, apiKey),
    fetchFMP('search-name', { query, limit: '5' }, apiKey),
  ]);

  const seen = new Set<string>();
  const merged: any[] = [];
  for (const item of [...(symbolResults || []), ...(nameResults || [])]) {
    if (item?.symbol && !seen.has(item.symbol)) {
      seen.add(item.symbol);
      merged.push(item);
    }
  }
  return merged.slice(0, 10);
}

async function fetchSparklines(tickers: string[], apiKey: string) {
  const from = getDateNDaysAgo(30);
  const to = getToday();
  const results = await Promise.all(
    tickers.map(async (ticker) => {
      const history = await fetchFMP('historical-price-eod/light', { symbol: ticker, from, to }, apiKey);
      let points: any[] = [];
      if (Array.isArray(history)) {
        points = history;
      } else if (history?.historical) {
        points = history.historical;
      }
      // Return just close prices in chronological order (API returns newest first)
      return {
        symbol: ticker,
        prices: points
          .map((p: any) => p.close ?? p.price)
          .filter((v: any) => typeof v === 'number')
          .reverse(),
      };
    })
  );
  return results;
}

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function getDateNDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('FMP_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'FMP_API_KEY is not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { type, ticker, tickers, query } = await req.json();
    let data: any;

    switch (type) {
      case 'dossier':
        if (!ticker) throw new Error('ticker is required for dossier type');
        data = await fetchDossier(ticker.toUpperCase(), apiKey);
        break;
      case 'quote':
        if (!tickers?.length && !ticker) throw new Error('ticker(s) required for quote type');
        data = await fetchQuotes(tickers || [ticker], apiKey);
        break;
      case 'search':
        if (!query) throw new Error('query is required for search type');
        data = await fetchSearch(query, apiKey);
        break;
      case 'sparklines':
        if (!tickers?.length) throw new Error('tickers required for sparklines type');
        data = await fetchSparklines(tickers.map((t: string) => t.toUpperCase()), apiKey);
        break;
      default:
        throw new Error(`Unknown type: ${type}`);
    }

    return new Response(
      JSON.stringify(data),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('stock-data error:', message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
