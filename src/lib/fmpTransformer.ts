import type {
  StockData,
  FinancialPeriod,
  NewsItem,
  InstitutionalHolder,
  InsiderTransaction,
  PricePoint,
  SegmentData,
  ValuationData,
  RiskItem,
} from '@/types/stock';

/**
 * Polygon.io dossier response shape (from our edge function)
 */
interface PolygonDossierResponse {
  profile: any;       // /v3/reference/tickers/{ticker} → results
  snapshot: any;       // /v2/snapshot → ticker object
  annualFinancials: any[];
  quarterlyFinancials: any[];
  priceHistory: any[]; // /v2/aggs bars array
  news: any[];
  holders: any[];
  insiders: any[];
}

export function transformFMPToStockData(raw: PolygonDossierResponse): StockData {
  const { profile, snapshot } = raw;

  if (!profile && !snapshot) {
    throw new Error('Missing essential profile or snapshot data from API');
  }

  // Extract price data from snapshot
  const lastTrade = snapshot?.lastTrade || snapshot?.last_trade || {};
  const prevDay = snapshot?.prevDay || snapshot?.prev_day || {};
  const todaysDay = snapshot?.day || {};
  const min = snapshot?.min || {};

  const price = lastTrade.p || todaysDay.c || 0;
  const prevClose = prevDay.c || price;
  const change = snapshot?.todaysChange ?? (price - prevClose);
  const changePercent = snapshot?.todaysChangePerc ?? (prevClose ? ((price - prevClose) / prevClose) * 100 : 0);

  // Extract financial data
  const annualFinancials = mapPolygonFinancials(raw.annualFinancials, 'annual');
  const quarterlyFinancials = mapPolygonFinancials(raw.quarterlyFinancials, 'quarterly');

  // Build valuation from financials
  const valuation = buildValuation(profile, price, annualFinancials);

  const risks = generateRisks(profile, { price, change, changePercent, prevClose }, annualFinancials);

  // Calculate data completeness
  let completeness = 30;
  if (profile) completeness += 20;
  if (snapshot) completeness += 15;
  if (raw.annualFinancials?.length) completeness += 15;
  if (raw.priceHistory?.length) completeness += 10;
  if (raw.news?.length) completeness += 5;
  if (raw.quarterlyFinancials?.length) completeness += 5;

  const now = new Date();
  const lastUpdated = `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })}`;

  // Map exchange codes
  const exchangeMap: Record<string, string> = {
    XNAS: 'NASDAQ', XNYS: 'NYSE', XASE: 'AMEX', ARCX: 'NYSE',
  };

  return {
    ticker: profile?.ticker || snapshot?.ticker || '',
    name: profile?.name || '',
    exchange: exchangeMap[profile?.primary_exchange] || profile?.primary_exchange || '',
    sector: profile?.sic_description || '',
    industry: profile?.sic_description || '',
    price,
    previousClose: prevClose,
    change,
    changePercent,
    marketCap: profile?.market_cap || 0,
    volume: todaysDay.v || 0,
    avgVolume: 0, // Not directly available from Polygon snapshot
    high52w: 0, // Would need separate aggregates call
    low52w: 0,
    beta: 0, // Not in Polygon basic data
    description: profile?.description || '',
    headquarters: [profile?.address?.city, profile?.address?.state].filter(Boolean).join(', '),
    founded: profile?.list_date ? parseInt(profile.list_date.split('-')[0]) : 0,
    employees: profile?.total_employees || 0,
    ceo: '',
    website: profile?.homepage_url || '',
    revenueSegments: [],
    geographicRevenue: [],
    financials: {
      annual: annualFinancials,
      quarterly: quarterlyFinancials,
    },
    valuation,
    risks,
    news: mapPolygonNews(raw.news),
    institutionalHolders: [],
    insiderTransactions: [],
    shortInterest: 0,
    priceHistory: mapPolygonPriceHistory(raw.priceHistory),
    earningsDate: '',
    exDividendDate: null,
    dividendYield: 0,
    lastUpdated,
    dataCompleteness: Math.min(completeness, 100),
  };
}

function mapPolygonFinancials(
  financials: any[],
  type: 'annual' | 'quarterly'
): FinancialPeriod[] {
  if (!financials?.length) return [];

  return financials.map((f) => {
    const income = f.financials?.income_statement || {};
    const balance = f.financials?.balance_sheet || {};
    const cashflow = f.financials?.cash_flow_statement || {};

    const revenue = income.revenues?.value || 0;
    const netIncome = income.net_income_loss?.value || 0;
    const operatingIncome = income.operating_income_loss?.value || 0;
    const grossProfit = income.gross_profit?.value || 0;
    const eps = income.basic_earnings_per_share?.value || 0;

    const totalAssets = balance.assets?.value || 0;
    const totalDebt = (balance.long_term_debt?.value || 0) + (balance.current_debt?.value || 0);
    const cash = balance.cash?.value || balance.cash_and_cash_equivalents?.value || 0;
    const currentAssets = balance.current_assets?.value || 0;
    const currentLiabilities = balance.current_liabilities?.value || 0;

    const operatingCashFlow = cashflow.net_cash_flow_from_operating_activities?.value || 0;
    const capex = Math.abs(cashflow.net_cash_flow_from_investing_activities?.value || 0);
    const freeCashFlow = cashflow.free_cash_flow?.value || (operatingCashFlow - capex);

    const label = type === 'annual'
      ? `FY${f.fiscal_year || f.end_date?.split('-')[0]}`
      : `Q${f.fiscal_period?.replace('Q', '') || ''} ${f.fiscal_year || f.end_date?.split('-')[0]}`;

    return {
      period: label,
      revenue,
      netIncome,
      operatingIncome,
      grossProfit,
      eps,
      totalAssets,
      totalDebt,
      cashAndEquivalents: cash,
      currentRatio: currentLiabilities ? currentAssets / currentLiabilities : 0,
      operatingCashFlow,
      freeCashFlow,
      operatingMargin: revenue ? (operatingIncome / revenue) * 100 : 0,
      netMargin: revenue ? (netIncome / revenue) * 100 : 0,
    };
  });
}

function buildValuation(profile: any, price: number, financials: FinancialPeriod[]): ValuationData {
  const marketCap = profile?.market_cap || 0;
  const latestRevenue = financials?.[0]?.revenue || 0;
  const latestEps = financials?.[0]?.eps || 0;
  const latestBookValue = financials?.[0]
    ? (financials[0].totalAssets - financials[0].totalDebt)
    : 0;

  const pe = latestEps > 0 ? price / latestEps : 0;
  const ps = latestRevenue > 0 ? marketCap / latestRevenue : 0;
  const sharesOutstanding = profile?.share_class_shares_outstanding || profile?.weighted_shares_outstanding || 0;
  const bookPerShare = sharesOutstanding > 0 ? latestBookValue / sharesOutstanding : 0;
  const pb = bookPerShare > 0 ? price / bookPerShare : 0;

  return {
    pe,
    forwardPe: pe * 0.85,
    ps,
    pb,
    evEbitda: 0,
    pegRatio: 0,
    sectorMedian: { pe: 20, ps: 3, pb: 3, evEbitda: 12 },
    historical5y: { avgPe: pe, avgPs: ps, avgPb: pb },
  };
}

function mapPolygonNews(newsArr: any[]): NewsItem[] {
  if (!newsArr?.length) return [];

  return newsArr.slice(0, 10).map((item) => {
    const title = item.title || '';
    const titleLower = title.toLowerCase();

    let category: NewsItem['category'] = 'general';
    if (titleLower.includes('earning') || titleLower.includes('revenue') || titleLower.includes('profit'))
      category = 'earnings';
    else if (titleLower.includes('launch') || titleLower.includes('product') || titleLower.includes('release'))
      category = 'products';
    else if (titleLower.includes('lawsuit') || titleLower.includes('legal') || titleLower.includes('sec') || titleLower.includes('antitrust'))
      category = 'legal';
    else if (titleLower.includes('merger') || titleLower.includes('acquisition') || titleLower.includes('buyout'))
      category = 'mna';
    else if (titleLower.includes('fed') || titleLower.includes('inflation') || titleLower.includes('economy'))
      category = 'macro';

    // Polygon doesn't provide sentiment, so we'll derive a basic one from keywords
    let sentiment: NewsItem['sentiment'] = 'neutral';
    if (titleLower.includes('surge') || titleLower.includes('jump') || titleLower.includes('beat') || titleLower.includes('record'))
      sentiment = 'positive';
    else if (titleLower.includes('drop') || titleLower.includes('fall') || titleLower.includes('miss') || titleLower.includes('decline'))
      sentiment = 'negative';

    return {
      date: item.published_utc?.split('T')[0] || '',
      title,
      source: item.publisher?.name || 'Unknown',
      category,
      sentiment,
      url: item.article_url || '#',
      summary: item.description?.substring(0, 250) || '',
    };
  });
}

function mapPolygonPriceHistory(bars: any[]): PricePoint[] {
  if (!bars?.length) return [];

  return bars.map((b) => ({
    date: new Date(b.t).toISOString().split('T')[0],
    open: b.o,
    high: b.h,
    low: b.l,
    close: b.c,
    volume: b.v,
  }));
}

function generateRisks(profile: any, quote: any, financials: FinancialPeriod[]): RiskItem[] {
  const risks: RiskItem[] = [];
  const latestFinancial = financials?.[0];

  // Valuation risk
  const pe = quote.price && latestFinancial?.eps
    ? quote.price / latestFinancial.eps
    : 0;
  if (pe > 50) {
    risks.push({
      category: 'financial',
      title: 'Elevated valuation',
      description: `P/E ratio of ${pe.toFixed(1)}x significantly exceeds typical market multiples.`,
      severity: 'high',
    });
  } else if (pe > 30) {
    risks.push({
      category: 'financial',
      title: 'Premium valuation',
      description: `P/E ratio of ${pe.toFixed(1)}x is above market averages.`,
      severity: 'medium',
    });
  }

  // Debt risk
  if (latestFinancial) {
    const debtToAssets = latestFinancial.totalAssets > 0
      ? latestFinancial.totalDebt / latestFinancial.totalAssets
      : 0;
    if (debtToAssets > 0.5) {
      risks.push({
        category: 'financial',
        title: 'High leverage',
        description: `Debt represents ${(debtToAssets * 100).toFixed(0)}% of total assets.`,
        severity: debtToAssets > 0.7 ? 'high' : 'medium',
      });
    }

    if (latestFinancial.netMargin < 5 && latestFinancial.revenue > 0) {
      risks.push({
        category: 'business',
        title: 'Thin profit margins',
        description: `Net margin of ${latestFinancial.netMargin.toFixed(1)}% leaves limited buffer.`,
        severity: latestFinancial.netMargin < 0 ? 'high' : 'medium',
      });
    }
  }

  risks.push({
    category: 'data',
    title: 'Data limitations',
    description: 'Some data points may be delayed. Insider trading and institutional data may not be available.',
    severity: 'low',
  });

  return risks;
}

// Transform Polygon search results
export interface SearchResult {
  ticker: string;
  name: string;
  exchange: string;
  type: string;
}

export function transformFMPSearch(raw: any[]): SearchResult[] {
  if (!Array.isArray(raw)) return [];

  const exchangeMap: Record<string, string> = {
    XNAS: 'NASDAQ', XNYS: 'NYSE', XASE: 'AMEX', ARCX: 'NYSE',
  };

  return raw
    .filter((r) => r.primary_exchange && ['XNAS', 'XNYS', 'XASE', 'ARCX'].includes(r.primary_exchange))
    .slice(0, 10)
    .map((r) => ({
      ticker: r.ticker,
      name: r.name,
      exchange: exchangeMap[r.primary_exchange] || r.primary_exchange,
      type: r.type || 'CS',
    }));
}

// Transform Polygon snapshot for watchlist quotes
export interface QuoteData {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap: number;
  pe: number;
}

export function transformFMPQuotes(raw: any[]): QuoteData[] {
  if (!Array.isArray(raw)) return [];

  return raw.map((snap) => {
    const lastTrade = snap.lastTrade || snap.last_trade || {};
    const prevDay = snap.prevDay || snap.prev_day || {};
    const day = snap.day || {};
    const price = lastTrade.p || day.c || 0;
    const prevClose = prevDay.c || price;

    return {
      ticker: snap.ticker || '',
      name: '', // Snapshot doesn't include name — filled from local directory
      price,
      change: snap.todaysChange ?? (price - prevClose),
      changePercent: snap.todaysChangePerc ?? (prevClose ? ((price - prevClose) / prevClose) * 100 : 0),
      marketCap: 0, // Not in snapshot
      pe: 0, // Not in snapshot
    };
  });
}
