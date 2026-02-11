import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const FMP_BASE = 'https://financialmodelingprep.com/stable';

// ---------- Cache TTL Strategy (in seconds) ----------
const CACHE_TTL: Record<string, number> = {
  'dossier':    4 * 60 * 60,   // 4 hours — financials rarely change intra-day
  'quote':      3 * 60,        // 3 minutes — near-real-time but reduces calls heavily
  'search':     24 * 60 * 60,  // 24 hours — company names don't change
  'sparklines': 30 * 60,       // 30 minutes — intraday sparklines
  'news':       15 * 60,       // 15 minutes — news refreshes often
};

// ---------- Supabase client (service role for cache writes) ----------
function getSupabaseAdmin() {
  const url = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey);
}

// ---------- Cache helpers ----------
async function getFromCache(key: string): Promise<any | null> {
  try {
    const sb = getSupabaseAdmin();
    if (!sb) return null;

    const { data, error } = await sb
      .from('api_cache')
      .select('data, expires_at')
      .eq('cache_key', key)
      .single();

    if (error || !data) return null;

    // Check expiry
    if (new Date(data.expires_at) < new Date()) {
      // Expired — delete in background, don't await
      sb.from('api_cache').delete().eq('cache_key', key).then(() => {});
      return null;
    }

    console.log(`Cache HIT: ${key}`);
    return data.data;
  } catch {
    return null;
  }
}

async function setCache(key: string, data: any, ttlSeconds: number): Promise<void> {
  try {
    const sb = getSupabaseAdmin();
    if (!sb) return;

    const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString();

    await sb.from('api_cache').upsert(
      {
        cache_key: key,
        data,
        cached_at: new Date().toISOString(),
        expires_at: expiresAt,
      },
      { onConflict: 'cache_key' }
    );
    console.log(`Cache SET: ${key} (TTL ${ttlSeconds}s)`);
  } catch (err) {
    console.warn('Cache write failed:', err);
  }
}

// ---------- FMP fetch with retry & backoff ----------
async function fetchFMP(
  path: string,
  params: Record<string, string>,
  apiKey: string,
  retries = 2
): Promise<any> {
  const url = new URL(`${FMP_BASE}/${path}`);
  url.searchParams.set('apikey', apiKey);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      console.log(`FMP fetch (attempt ${attempt + 1}): ${url.toString().replace(/apikey=[^&]+/, 'apikey=***')}`);
      const res = await fetch(url.toString());

      // Rate limited — wait and retry
      if (res.status === 429 && attempt < retries) {
        const waitMs = Math.min(1000 * Math.pow(2, attempt + 1), 8000); // 2s, 4s, 8s
        console.warn(`FMP rate limited (429), retrying in ${waitMs}ms...`);
        await new Promise((r) => setTimeout(r, waitMs));
        continue;
      }

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`FMP error ${res.status} for ${path}:`, errorText.substring(0, 200));
        return null;
      }
      return await res.json();
    } catch (err) {
      if (attempt < retries) {
        const waitMs = 1000 * Math.pow(2, attempt);
        console.warn(`FMP network error, retrying in ${waitMs}ms:`, err);
        await new Promise((r) => setTimeout(r, waitMs));
        continue;
      }
      console.error(`FMP fetch error for ${path}:`, err);
      return null;
    }
  }
  return null;
}

// ---------- Data fetchers ----------
async function fetchDossier(ticker: string, apiKey: string) {
  const cacheKey = `dossier:${ticker}`;
  const cached = await getFromCache(cacheKey);
  if (cached) return cached;

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
    fetchFMP('historical-price-eod/full', { ...sym, from: getDateNDaysAgo(1825), to: getToday() }, apiKey),
    fetchFMP('stock-news', { tickers: ticker, limit: '10' }, apiKey),
    fetchFMP('institutional-holder', sym, apiKey),
    fetchFMP('insider-trading', sym, apiKey),
    fetchFMP('key-metrics', { ...sym, period: 'annual', limit: '5' }, apiKey),
    fetchFMP('ratios', { ...sym, period: 'annual', limit: '3' }, apiKey),
  ]);

  const result = {
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

  // Only cache if we got meaningful data
  if (result.profile && result.quote) {
    await setCache(cacheKey, result, CACHE_TTL.dossier);
  }

  return result;
}

async function fetchQuotes(tickers: string[], apiKey: string) {
  // Check cache for each ticker individually
  const results: any[] = [];
  const uncachedTickers: string[] = [];

  for (const ticker of tickers) {
    const cached = await getFromCache(`quote:${ticker}`);
    if (cached) {
      results.push(cached);
    } else {
      uncachedTickers.push(ticker);
    }
  }

  if (uncachedTickers.length > 0) {
    const freshResults = await Promise.all(
      uncachedTickers.map(async (ticker) => {
        const data = await fetchFMP('quote', { symbol: ticker }, apiKey);
        const quote = Array.isArray(data) && data.length > 0 ? data[0] : data;
        if (quote) {
          // Cache each quote individually
          await setCache(`quote:${ticker}`, quote, CACHE_TTL.quote);
        }
        return quote;
      })
    );
    results.push(...freshResults.filter(Boolean));
  }

  return results;
}

async function fetchSearch(query: string, apiKey: string) {
  const cacheKey = `search:${query.toLowerCase().trim()}`;
  const cached = await getFromCache(cacheKey);
  if (cached) return cached;

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
  const result = merged.slice(0, 10);

  if (result.length > 0) {
    await setCache(cacheKey, result, CACHE_TTL.search);
  }

  return result;
}

async function fetchSparklines(tickers: string[], apiKey: string) {
  const results: any[] = [];
  const uncachedTickers: string[] = [];

  for (const ticker of tickers) {
    const cached = await getFromCache(`sparkline:${ticker}`);
    if (cached) {
      results.push(cached);
    } else {
      uncachedTickers.push(ticker);
    }
  }

  if (uncachedTickers.length > 0) {
    const from = getDateNDaysAgo(30);
    const to = getToday();
    const freshResults = await Promise.all(
      uncachedTickers.map(async (ticker) => {
        const history = await fetchFMP('historical-price-eod/light', { symbol: ticker, from, to }, apiKey);
        let points: any[] = [];
        if (Array.isArray(history)) {
          points = history;
        } else if (history?.historical) {
          points = history.historical;
        }
        const sparkData = {
          symbol: ticker,
          prices: points
            .map((p: any) => p.close ?? p.price)
            .filter((v: any) => typeof v === 'number')
            .reverse(),
        };
        if (sparkData.prices.length > 0) {
          await setCache(`sparkline:${ticker}`, sparkData, CACHE_TTL.sparklines);
        }
        return sparkData;
      })
    );
    results.push(...freshResults);
  }

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

// ---------- Periodic cache cleanup (runs every ~100 requests) ----------
let requestCount = 0;
async function maybeCleanupCache() {
  requestCount++;
  if (requestCount % 100 === 0) {
    try {
      const sb = getSupabaseAdmin();
      if (sb) {
        const { data } = await sb.rpc('cleanup_expired_cache');
        console.log(`Cache cleanup: removed ${data} expired entries`);
      }
    } catch {}
  }
}

// ---------- Main handler ----------
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
        data = await fetchQuotes(
          (tickers || [ticker]).map((t: string) => t.toUpperCase()),
          apiKey
        );
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

    // Run cache cleanup periodically
    maybeCleanupCache().catch(() => {});

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
