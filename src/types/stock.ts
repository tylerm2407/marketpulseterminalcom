export interface StockData {
  ticker: string;
  name: string;
  exchange: string;
  sector: string;
  industry: string;
  price: number;
  previousClose: number;
  change: number;
  changePercent: number;
  marketCap: number;
  volume: number;
  avgVolume: number;
  high52w: number;
  low52w: number;
  beta: number;
  description: string;
  headquarters: string;
  founded: number;
  employees: number;
  ceo: string;
  website: string;
  revenueSegments: SegmentData[];
  geographicRevenue: SegmentData[];
  financials: {
    annual: FinancialPeriod[];
    quarterly: FinancialPeriod[];
  };
  valuation: ValuationData;
  risks: RiskItem[];
  news: NewsItem[];
  institutionalHolders: InstitutionalHolder[];
  insiderTransactions: InsiderTransaction[];
  shortInterest: number;
  priceHistory: PricePoint[];
  earningsDate: string;
  exDividendDate: string | null;
  dividendYield: number;
  lastUpdated: string;
  dataCompleteness: number;
}

export interface SegmentData {
  name: string;
  value: number;
}

export interface FinancialPeriod {
  period: string;
  revenue: number;
  netIncome: number;
  operatingIncome: number;
  grossProfit: number;
  eps: number;
  totalAssets: number;
  totalDebt: number;
  cashAndEquivalents: number;
  currentRatio: number;
  operatingCashFlow: number;
  freeCashFlow: number;
  operatingMargin: number;
  netMargin: number;
}

export interface ValuationData {
  pe: number;
  forwardPe: number;
  ps: number;
  pb: number;
  evEbitda: number;
  pegRatio: number;
  sectorMedian: {
    pe: number;
    ps: number;
    pb: number;
    evEbitda: number;
  };
  historical5y: {
    avgPe: number;
    avgPs: number;
    avgPb: number;
  };
}

export interface RiskItem {
  category: 'business' | 'financial' | 'market' | 'event' | 'data';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

export interface NewsItem {
  date: string;
  title: string;
  source: string;
  category: 'earnings' | 'products' | 'legal' | 'mna' | 'macro' | 'general';
  sentiment: 'positive' | 'neutral' | 'negative';
  url: string;
  summary: string;
}

export interface InstitutionalHolder {
  name: string;
  shares: number;
  percentOwnership: number;
  change: number;
  value: number;
}

export interface InsiderTransaction {
  name: string;
  title: string;
  type: 'buy' | 'sell' | 'exercise';
  shares: number;
  price: number;
  date: string;
  value: number;
}

export interface PricePoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}
