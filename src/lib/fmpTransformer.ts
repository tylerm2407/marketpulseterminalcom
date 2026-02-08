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

interface FMPDossierResponse {
  profile: any;
  quote: any;
  incomeAnnual: any[];
  incomeQuarterly: any[];
  balanceAnnual: any[];
  balanceQuarterly: any[];
  cashflowAnnual: any[];
  cashflowQuarterly: any[];
  priceHistory: any[];
  news: any[];
  holders: any[];
  insiders: any[];
  keyMetrics: any[];
  ratios: any[];
  revenueSegments: any[];
  geoSegments: any[];
}

export function transformFMPToStockData(raw: FMPDossierResponse): StockData {
  const { profile, quote, keyMetrics, ratios } = raw;

  if (!profile || !quote) {
    throw new Error('Missing essential profile or quote data from API');
  }

  const km = keyMetrics?.[0] || {};
  const r = ratios?.[0] || {};

  const pe = quote.pe || km.peRatio || 0;
  const ps = km.priceToSalesRatio || km.priceSalesRatio || 0;
  const pb = km.pbRatio || km.priceToBookRatio || 0;
  const evEbitda = km.enterpriseValueOverEBITDA || 0;

  // Calculate historical averages from key metrics
  const historicalKm = keyMetrics || [];
  const avgPe = historicalKm.length > 0
    ? historicalKm.reduce((s: number, k: any) => s + (k.peRatio || 0), 0) / historicalKm.length
    : pe;
  const avgPs = historicalKm.length > 0
    ? historicalKm.reduce((s: number, k: any) => s + (k.priceToSalesRatio || k.priceSalesRatio || 0), 0) / historicalKm.length
    : ps;
  const avgPb = historicalKm.length > 0
    ? historicalKm.reduce((s: number, k: any) => s + (k.pbRatio || k.priceToBookRatio || 0), 0) / historicalKm.length
    : pb;

  const valuation: ValuationData = {
    pe,
    forwardPe: km.forwardPE || pe * 0.85,
    ps,
    pb,
    evEbitda,
    pegRatio: km.pegRatio || 0,
    sectorMedian: { pe: 20, ps: 3, pb: 3, evEbitda: 12 },
    historical5y: { avgPe, avgPs, avgPb },
  };

  const annualFinancials = mapFinancialPeriods(
    raw.incomeAnnual,
    raw.balanceAnnual,
    raw.cashflowAnnual,
    'annual'
  );
  const quarterlyFinancials = mapFinancialPeriods(
    raw.incomeQuarterly,
    raw.balanceQuarterly,
    raw.cashflowQuarterly,
    'quarterly'
  );

  const revenueSegments = parseSegments(raw.revenueSegments);
  const geoSegments = parseSegments(raw.geoSegments);

  const risks = generateRisks(profile, quote, km, annualFinancials);

  const dividendYield = profile.lastDiv
    ? (profile.lastDiv / quote.price) * 100
    : 0;

  // Calculate data completeness
  let completeness = 40; // base for having profile + quote
  if (raw.incomeAnnual?.length) completeness += 15;
  if (raw.balanceAnnual?.length) completeness += 10;
  if (raw.cashflowAnnual?.length) completeness += 10;
  if (raw.priceHistory?.length) completeness += 10;
  if (raw.news?.length) completeness += 5;
  if (raw.holders?.length) completeness += 5;
  if (raw.insiders?.length) completeness += 3;
  if (keyMetrics?.length) completeness += 2;

  const now = new Date();
  const lastUpdated = `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })}`;

  return {
    ticker: profile.symbol || quote.symbol,
    name: profile.companyName || quote.name,
    exchange: profile.exchangeShortName || quote.exchange || '',
    sector: profile.sector || '',
    industry: profile.industry || '',
    price: quote.price,
    previousClose: quote.previousClose || quote.price - quote.change,
    change: quote.change || 0,
    changePercent: quote.changesPercentage || 0,
    marketCap: quote.marketCap || profile.mktCap || 0,
    volume: quote.volume || 0,
    avgVolume: quote.avgVolume || profile.volAvg || 0,
    high52w: quote.yearHigh || 0,
    low52w: quote.yearLow || 0,
    beta: profile.beta || 0,
    description: profile.description || '',
    headquarters: [profile.city, profile.state, profile.country].filter(Boolean).join(', '),
    founded: profile.ipoDate ? parseInt(profile.ipoDate.split('-')[0]) : 0,
    employees: profile.fullTimeEmployees || 0,
    ceo: profile.ceo || '',
    website: profile.website || '',
    revenueSegments,
    geographicRevenue: geoSegments,
    financials: {
      annual: annualFinancials,
      quarterly: quarterlyFinancials,
    },
    valuation,
    risks,
    news: mapNews(raw.news),
    institutionalHolders: mapHolders(raw.holders, quote.price),
    insiderTransactions: mapInsiders(raw.insiders),
    shortInterest: 0, // Not available in FMP free tier
    priceHistory: mapPriceHistory(raw.priceHistory),
    earningsDate: profile.earningsAnnouncement || quote.earningsAnnouncement || '',
    exDividendDate: profile.exDividendDate || null,
    dividendYield,
    lastUpdated,
    dataCompleteness: Math.min(completeness, 100),
  };
}

function mapFinancialPeriods(
  income: any[],
  balance: any[],
  cashflow: any[],
  type: 'annual' | 'quarterly'
): FinancialPeriod[] {
  if (!income?.length) return [];

  return income.map((inc, i) => {
    const bal = balance?.[i] || {};
    const cf = cashflow?.[i] || {};

    const revenue = inc.revenue || 0;
    const label = type === 'annual'
      ? `FY${inc.calendarYear || inc.date?.split('-')[0]}`
      : `Q${getQuarter(inc.date)} ${inc.calendarYear || inc.date?.split('-')[0]}`;

    return {
      period: label,
      revenue,
      netIncome: inc.netIncome || 0,
      operatingIncome: inc.operatingIncome || 0,
      grossProfit: inc.grossProfit || 0,
      eps: inc.eps || 0,
      totalAssets: bal.totalAssets || 0,
      totalDebt: bal.totalDebt || (bal.longTermDebt || 0) + (bal.shortTermDebt || 0),
      cashAndEquivalents: bal.cashAndCashEquivalents || bal.cashAndShortTermInvestments || 0,
      currentRatio: bal.totalCurrentLiabilities
        ? (bal.totalCurrentAssets || 0) / bal.totalCurrentLiabilities
        : 0,
      operatingCashFlow: cf.operatingCashFlow || 0,
      freeCashFlow: cf.freeCashFlow || 0,
      operatingMargin: revenue ? ((inc.operatingIncome || 0) / revenue) * 100 : 0,
      netMargin: revenue ? ((inc.netIncome || 0) / revenue) * 100 : 0,
    };
  });
}

function getQuarter(dateStr?: string): number {
  if (!dateStr) return 0;
  const month = parseInt(dateStr.split('-')[1]);
  return Math.ceil(month / 3);
}

function parseSegments(segmentData: any[]): SegmentData[] {
  if (!segmentData?.length) return [];

  // FMP returns segment data as array of objects with date keys
  // Take the most recent entry
  const latest = segmentData[0];
  if (!latest || typeof latest !== 'object') return [];

  // The structure varies — try to extract key-value pairs
  const entries = Object.entries(latest).filter(
    ([key]) => !['date', 'symbol', 'cik', 'filing_date', 'period'].includes(key.toLowerCase())
  );

  return entries
    .map(([name, value]) => ({
      name: name.replace(/Segment|Revenue/gi, '').trim(),
      value: typeof value === 'number' ? value / 1e9 : 0, // Convert to billions
    }))
    .filter((s) => s.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 7);
}

function mapNews(newsArr: any[]): NewsItem[] {
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

    let sentiment: NewsItem['sentiment'] = 'neutral';
    if (item.sentiment) {
      sentiment = item.sentiment > 0.1 ? 'positive' : item.sentiment < -0.1 ? 'negative' : 'neutral';
    }

    return {
      date: item.publishedDate?.split(' ')[0] || item.publishedDate?.split('T')[0] || '',
      title,
      source: item.site || item.source || 'Unknown',
      category,
      sentiment,
      url: item.url || '#',
      summary: item.text?.substring(0, 250) || '',
    };
  });
}

function mapHolders(holders: any[], price: number): InstitutionalHolder[] {
  if (!holders?.length) return [];

  return holders.slice(0, 10).map((h) => ({
    name: h.holder || h.investorName || '',
    shares: h.shares || 0,
    percentOwnership: h.weightedAvgPrice ? 0 : (h.ownership || 0) * 100,
    change: h.change || 0,
    value: (h.shares || 0) * price,
  }));
}

function mapInsiders(insiders: any[]): InsiderTransaction[] {
  if (!insiders?.length) return [];

  return insiders
    .filter((t) => t.securitiesTransacted > 0)
    .slice(0, 10)
    .map((t) => {
      let type: InsiderTransaction['type'] = 'sell';
      if (t.acquistionOrDisposition === 'A' || t.transactionType?.includes('Purchase') || t.transactionType?.includes('Buy')) {
        type = 'buy';
      } else if (t.transactionType?.includes('Exercise')) {
        type = 'exercise';
      }

      return {
        name: t.reportingName || t.reportingCik || '',
        title: t.typeOfOwner || '',
        type,
        shares: t.securitiesTransacted || 0,
        price: t.price || 0,
        date: t.transactionDate || t.filingDate || '',
        value: (t.securitiesTransacted || 0) * (t.price || 0),
      };
    });
}

function mapPriceHistory(history: any[]): PricePoint[] {
  if (!history?.length) return [];

  return history
    .slice()
    .reverse()
    .map((p) => ({
      date: p.date,
      open: p.open,
      high: p.high,
      low: p.low,
      close: p.close,
      volume: p.volume,
    }));
}

function generateRisks(profile: any, quote: any, km: any, financials: FinancialPeriod[]): RiskItem[] {
  const risks: RiskItem[] = [];
  const latestFinancial = financials?.[0];

  // Market risk from beta
  if (profile.beta > 1.5) {
    risks.push({
      category: 'market',
      title: 'High volatility',
      description: `Beta of ${profile.beta.toFixed(2)} indicates significantly higher volatility than the market.`,
      severity: 'high',
    });
  } else if (profile.beta > 1.2) {
    risks.push({
      category: 'market',
      title: 'Above-average volatility',
      description: `Beta of ${profile.beta.toFixed(2)} implies moderately higher market sensitivity.`,
      severity: 'medium',
    });
  }

  // Valuation risk
  const pe = quote.pe || km.peRatio || 0;
  if (pe > 50) {
    risks.push({
      category: 'financial',
      title: 'Elevated valuation',
      description: `P/E ratio of ${pe.toFixed(1)}x significantly exceeds typical market multiples. Premium pricing reflects high growth expectations.`,
      severity: 'high',
    });
  } else if (pe > 30) {
    risks.push({
      category: 'financial',
      title: 'Premium valuation',
      description: `P/E ratio of ${pe.toFixed(1)}x is above market averages. Moderate risk of multiple compression.`,
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
        description: `Debt represents ${(debtToAssets * 100).toFixed(0)}% of total assets. Interest rate sensitivity and refinancing risk.`,
        severity: debtToAssets > 0.7 ? 'high' : 'medium',
      });
    }

    // Margin risk
    if (latestFinancial.netMargin < 5 && latestFinancial.revenue > 0) {
      risks.push({
        category: 'business',
        title: 'Thin profit margins',
        description: `Net margin of ${latestFinancial.netMargin.toFixed(1)}% leaves limited buffer for revenue declines.`,
        severity: latestFinancial.netMargin < 0 ? 'high' : 'medium',
      });
    }
  }

  // 52-week range risk
  if (quote.yearHigh && quote.yearLow) {
    const range = quote.yearHigh - quote.yearLow;
    const position = (quote.price - quote.yearLow) / range;
    if (position > 0.9) {
      risks.push({
        category: 'market',
        title: 'Near 52-week high',
        description: `Trading within ${((1 - position) * 100).toFixed(0)}% of 52-week high. Potential for mean reversion.`,
        severity: 'low',
      });
    }
  }

  // Data risk - always add
  risks.push({
    category: 'data',
    title: 'Data limitations',
    description: 'Some data points may be delayed up to 15 minutes. Insider trading and institutional data updated quarterly.',
    severity: 'low',
  });

  return risks;
}

// Transform FMP search results to a simpler format
export interface SearchResult {
  ticker: string;
  name: string;
  exchange: string;
  type: string;
}

export function transformFMPSearch(raw: any[]): SearchResult[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .filter((r) => r.exchangeShortName && ['NASDAQ', 'NYSE', 'AMEX'].includes(r.exchangeShortName))
    .slice(0, 10)
    .map((r) => ({
      ticker: r.symbol,
      name: r.name,
      exchange: r.exchangeShortName,
      type: r.type || 'stock',
    }));
}

// Transform FMP quote array for watchlist
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

  return raw.map((q) => ({
    ticker: q.symbol,
    name: q.name,
    price: q.price,
    change: q.change || 0,
    changePercent: q.changesPercentage || q.changePercentage || 0,
    marketCap: q.marketCap || 0,
    pe: q.pe || q.peRatio || 0,
  }));
}
