import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { checkRateLimit, rateLimitResponse } from "../_shared/rateLimiter.ts";
import {
  safeParseBody,
  isValidTicker,
  validateTickerArray,
  isValidSearchQuery,
  sanitize,
  checkUnexpectedFields,
  validationError,
} from "../_shared/inputValidator.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const POLYGON_BASE = 'https://api.polygon.io';

// ---------- Cache TTL Strategy (in seconds) ----------
const CACHE_TTL: Record<string, number> = {
  'dossier':    4 * 60 * 60,
  'quote':      3 * 60,
  'search':     24 * 60 * 60,
  'sparklines': 30 * 60,
  'news':       15 * 60,
  'market-overview': 5 * 60,
};

// ---------- Rate limit config ----------
const RATE_LIMIT = { functionName: "stock-data", maxRequests: 30, windowSeconds: 60 };

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
      .maybeSingle();
    if (error || !data) return null;
    if (new Date(data.expires_at) < new Date()) {
      sb.from('api_cache').delete().eq('cache_key', key).then(() => {});
      return null;
    }
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
      { cache_key: key, data, cached_at: new Date().toISOString(), expires_at: expiresAt },
      { onConflict: 'cache_key' }
    );
  } catch (err) {
    console.warn('Cache write failed:', err);
  }
}

// ---------- Polygon fetch with retry & backoff ----------
async function fetchPolygon(
  path: string,
  params: Record<string, string>,
  apiKey: string,
  retries = 2
): Promise<any> {
  const url = new URL(`${POLYGON_BASE}${path}`);
  url.searchParams.set('apiKey', apiKey);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url.toString());

      if (res.status === 429 && attempt < retries) {
        const waitMs = Math.min(1000 * Math.pow(2, attempt + 1), 8000);
        await new Promise((r) => setTimeout(r, waitMs));
        continue;
      }

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`Polygon error ${res.status} for ${path}:`, errorText.substring(0, 200));
        return null;
      }
      return await res.json();
    } catch (err) {
      if (attempt < retries) {
        const waitMs = 1000 * Math.pow(2, attempt);
        await new Promise((r) => setTimeout(r, waitMs));
        continue;
      }
      console.error(`Polygon fetch error for ${path}:`, err);
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

  const fromDate5y = getDateNDaysAgo(1825);
  const toDate = getToday();

  const [tickerDetails, snapshot, financials, news, priceHistory] = await Promise.all([
    fetchPolygon(`/v3/reference/tickers/${ticker}`, {}, apiKey),
    fetchPolygon(`/v2/snapshot/locale/us/markets/stocks/tickers/${ticker}`, {}, apiKey),
    fetchPolygon(`/vX/reference/financials`, { ticker, limit: '20', order: 'desc', sort: 'period_of_report_date' }, apiKey),
    fetchPolygon(`/v2/reference/news`, { ticker, limit: '10', order: 'desc' }, apiKey),
    fetchPolygon(`/v2/aggs/ticker/${ticker}/range/1/day/${fromDate5y}/${toDate}`, { adjusted: 'true', sort: 'asc', limit: '5000' }, apiKey),
  ]);

  const profile = tickerDetails?.results || null;
  const snap = snapshot?.ticker || null;
  const financialResults = financials?.results || [];
  const newsResults = news?.results || [];
  const priceResults = priceHistory?.results || [];

  const annualFinancials = financialResults.filter((f: any) => f.timeframe === 'annual').slice(0, 3);
  const quarterlyFinancials = financialResults.filter((f: any) => f.timeframe === 'quarterly').slice(0, 4);

  const result = {
    profile, snapshot: snap, annualFinancials, quarterlyFinancials,
    priceHistory: priceResults, news: newsResults, holders: [], insiders: [],
  };

  if (result.profile && result.snapshot) {
    await setCache(cacheKey, result, CACHE_TTL.dossier);
  }

  return result;
}

async function fetchQuotes(tickers: string[], apiKey: string) {
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
        const data = await fetchPolygon(`/v2/snapshot/locale/us/markets/stocks/tickers/${ticker}`, {}, apiKey);
        const snap = data?.ticker || null;
        if (snap) await setCache(`quote:${ticker}`, snap, CACHE_TTL.quote);
        return snap;
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

  const data = await fetchPolygon('/v3/reference/tickers', {
    search: query, active: 'true', market: 'stocks', limit: '10', order: 'asc', sort: 'ticker',
  }, apiKey);

  const results = data?.results || [];
  if (results.length > 0) await setCache(cacheKey, results, CACHE_TTL.search);
  return results;
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
        const data = await fetchPolygon(`/v2/aggs/ticker/${ticker}/range/1/day/${from}/${to}`, { adjusted: 'true', sort: 'asc', limit: '50' }, apiKey);
        const bars = data?.results || [];
        const sparkData = {
          symbol: ticker,
          prices: bars.map((b: any) => b.c).filter((v: any) => typeof v === 'number'),
        };
        if (sparkData.prices.length > 0) await setCache(`sparkline:${ticker}`, sparkData, CACHE_TTL.sparklines);
        return sparkData;
      })
    );
    results.push(...freshResults);
  }

  return results;
}

// ---------- Market Overview ----------
const INDEX_TICKERS = ['SPY', 'QQQ', 'DIA', 'IWM'];
const SECTOR_ETFS: Record<string, string> = {
  XLK: 'Technology', XLF: 'Financial Services', XLV: 'Healthcare',
  XLC: 'Communication Services', XLY: 'Consumer Cyclical', XLP: 'Consumer Defensive',
  XLE: 'Energy', XLI: 'Industrials', XLB: 'Materials', XLRE: 'Real Estate', XLU: 'Utilities',
};

async function fetchMarketOverview(apiKey: string) {
  const cacheKey = 'market-overview';
  const cached = await getFromCache(cacheKey);
  if (cached) return cached;

  const allTickers = [...INDEX_TICKERS, ...Object.keys(SECTOR_ETFS)];
  const snapshots = await Promise.all(
    allTickers.map(async (ticker) => {
      const data = await fetchPolygon(`/v2/snapshot/locale/us/markets/stocks/tickers/${ticker}`, {}, apiKey);
      return { ticker, snapshot: data?.ticker || null };
    })
  );

  const indices = snapshots
    .filter(s => INDEX_TICKERS.includes(s.ticker) && s.snapshot)
    .map(s => {
      const snap = s.snapshot;
      const lastTrade = snap.lastTrade || snap.last_trade || {};
      const prevDay = snap.prevDay || snap.prev_day || {};
      const price = lastTrade.p || snap.day?.c || 0;
      const prevClose = prevDay.c || price;
      const indexNames: Record<string, string> = { SPY: 'S&P 500', QQQ: 'NASDAQ 100', DIA: 'Dow Jones', IWM: 'Russell 2000' };
      return {
        ticker: s.ticker, name: indexNames[s.ticker] || s.ticker, price,
        change: snap.todaysChange ?? (price - prevClose),
        changePercent: snap.todaysChangePerc ?? (prevClose ? ((price - prevClose) / prevClose) * 100 : 0),
      };
    });

  const sectors = snapshots
    .filter(s => SECTOR_ETFS[s.ticker] && s.snapshot)
    .map(s => {
      const snap = s.snapshot;
      const lastTrade = snap.lastTrade || snap.last_trade || {};
      const prevDay = snap.prevDay || snap.prev_day || {};
      const price = lastTrade.p || snap.day?.c || 0;
      const prevClose = prevDay.c || price;
      return {
        ticker: s.ticker, name: SECTOR_ETFS[s.ticker], price,
        change: snap.todaysChange ?? (price - prevClose),
        changePercent: snap.todaysChangePerc ?? (prevClose ? ((price - prevClose) / prevClose) * 100 : 0),
      };
    })
    .sort((a, b) => b.changePercent - a.changePercent);

  const result = { indices, sectors, timestamp: new Date().toISOString() };
  if (indices.length > 0) await setCache(cacheKey, result, CACHE_TTL['market-overview']);
  return result;
}

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function getDateNDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

// ---------- Periodic cache cleanup ----------
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

// ---------- Allowed types ----------
const VALID_TYPES = new Set(["dossier", "quote", "search", "sparklines", "market-overview"]);

// ---------- Main handler ----------
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only accept POST
  if (req.method !== 'POST') {
    return validationError(corsHeaders, "Method not allowed");
  }

  try {
    // Rate limit
    const rl = await checkRateLimit(req, RATE_LIMIT);
    if (!rl.allowed) return rateLimitResponse(corsHeaders, rl.retryAfterSeconds!);

    const apiKey = Deno.env.get('POLYGON_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Safe parse body
    const parsed = await safeParseBody(req);
    if (!parsed.ok) return validationError(corsHeaders, parsed.error);
    const body = parsed.body;

    const type = body.type;
    if (typeof type !== "string" || !VALID_TYPES.has(type)) {
      return validationError(corsHeaders, `Invalid type. Must be one of: ${[...VALID_TYPES].join(", ")}`);
    }

    // Reject unexpected fields
    const allowedFields = ["type", "ticker", "tickers", "query"];
    const unexpected = checkUnexpectedFields(body, allowedFields);
    if (unexpected.length > 0) {
      return validationError(corsHeaders, `Unexpected fields: ${unexpected.join(", ")}`);
    }

    let data: any;

    switch (type) {
      case 'dossier': {
        if (!isValidTicker(body.ticker)) return validationError(corsHeaders, "Invalid ticker format");
        data = await fetchDossier((body.ticker as string).toUpperCase(), apiKey);
        break;
      }
      case 'quote': {
        if (body.tickers) {
          const v = validateTickerArray(body.tickers, 50);
          if (!v.valid) return validationError(corsHeaders, v.error);
          data = await fetchQuotes(v.tickers, apiKey);
        } else if (isValidTicker(body.ticker)) {
          data = await fetchQuotes([(body.ticker as string).toUpperCase()], apiKey);
        } else {
          return validationError(corsHeaders, "ticker or tickers required for quote type");
        }
        break;
      }
      case 'search': {
        if (!isValidSearchQuery(body.query, 100)) return validationError(corsHeaders, "Invalid query (1-100 chars)");
        data = await fetchSearch(sanitize(body.query as string), apiKey);
        break;
      }
      case 'sparklines': {
        const v = validateTickerArray(body.tickers, 50);
        if (!v.valid) return validationError(corsHeaders, v.error);
        data = await fetchSparklines(v.tickers, apiKey);
        break;
      }
      case 'market-overview':
        data = await fetchMarketOverview(apiKey);
        break;
    }

    maybeCleanupCache().catch(() => {});

    return new Response(
      JSON.stringify(data),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('stock-data error:', message);
    return new Response(
      JSON.stringify({ error: 'An error occurred processing your request' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
