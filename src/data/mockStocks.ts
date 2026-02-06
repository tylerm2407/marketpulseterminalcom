import type { StockData, PricePoint } from '@/types/stock';

function generatePriceHistory(start: number, end: number, days: number = 252): PricePoint[] {
  const points: PricePoint[] = [];
  const now = new Date('2026-02-06');
  let price = start;
  const dailyDrift = Math.pow(end / start, 1 / days) - 1;

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    const noise = (Math.sin(i * 0.15) * 0.012 + Math.cos(i * 0.08) * 0.008);
    price *= 1 + dailyDrift + noise;
    const range = price * 0.012;

    points.push({
      date: date.toISOString().split('T')[0],
      open: +(price + Math.sin(i) * range * 0.3).toFixed(2),
      high: +(price + Math.abs(Math.cos(i * 0.7)) * range).toFixed(2),
      low: +(price - Math.abs(Math.sin(i * 0.4)) * range).toFixed(2),
      close: +price.toFixed(2),
      volume: Math.floor(35e6 + Math.sin(i * 0.3) * 15e6 + Math.abs(Math.cos(i)) * 20e6),
    });
  }
  return points;
}

const AAPL: StockData = {
  ticker: 'AAPL',
  name: 'Apple Inc.',
  exchange: 'NASDAQ',
  sector: 'Technology',
  industry: 'Consumer Electronics',
  price: 237.42,
  previousClose: 234.18,
  change: 3.24,
  changePercent: 1.38,
  marketCap: 3.61e12,
  volume: 54230000,
  avgVolume: 48500000,
  high52w: 260.10,
  low52w: 169.21,
  beta: 1.24,
  description: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide. The company offers iPhone, Mac, iPad, and wearables, home and accessories including AirPods, Apple TV, Apple Watch, Beats products, and HomePod.',
  headquarters: 'Cupertino, California',
  founded: 1976,
  employees: 164000,
  ceo: 'Tim Cook',
  website: 'apple.com',
  revenueSegments: [
    { name: 'iPhone', value: 205.5 },
    { name: 'Services', value: 96.2 },
    { name: 'Mac', value: 40.2 },
    { name: 'iPad', value: 30.8 },
    { name: 'Wearables & Accessories', value: 37.3 },
  ],
  geographicRevenue: [
    { name: 'Americas', value: 170.2 },
    { name: 'Europe', value: 101.3 },
    { name: 'Greater China', value: 72.6 },
    { name: 'Japan', value: 25.8 },
    { name: 'Rest of Asia Pacific', value: 40.1 },
  ],
  financials: {
    annual: [
      { period: 'FY2025', revenue: 410e9, netIncome: 105e9, operatingIncome: 130e9, grossProfit: 183e9, eps: 6.94, totalAssets: 353e9, totalDebt: 104e9, cashAndEquivalents: 30.7e9, currentRatio: 1.04, operatingCashFlow: 118e9, freeCashFlow: 108e9, operatingMargin: 31.7, netMargin: 25.6 },
      { period: 'FY2024', revenue: 391e9, netIncome: 97e9, operatingIncome: 122e9, grossProfit: 172e9, eps: 6.42, totalAssets: 344e9, totalDebt: 108e9, cashAndEquivalents: 28.4e9, currentRatio: 0.99, operatingCashFlow: 112e9, freeCashFlow: 101e9, operatingMargin: 31.2, netMargin: 24.8 },
      { period: 'FY2023', revenue: 383e9, netIncome: 94e9, operatingIncome: 119e9, grossProfit: 167e9, eps: 6.13, totalAssets: 352e9, totalDebt: 112e9, cashAndEquivalents: 29.9e9, currentRatio: 0.99, operatingCashFlow: 110e9, freeCashFlow: 99e9, operatingMargin: 31.1, netMargin: 24.5 },
    ],
    quarterly: [
      { period: 'Q1 2026', revenue: 124e9, netIncome: 35e9, operatingIncome: 42e9, grossProfit: 57e9, eps: 2.35, totalAssets: 358e9, totalDebt: 100e9, cashAndEquivalents: 33.2e9, currentRatio: 1.06, operatingCashFlow: 38e9, freeCashFlow: 35e9, operatingMargin: 33.9, netMargin: 28.2 },
      { period: 'Q4 2025', revenue: 95e9, netIncome: 24e9, operatingIncome: 30e9, grossProfit: 43e9, eps: 1.58, totalAssets: 353e9, totalDebt: 104e9, cashAndEquivalents: 30.7e9, currentRatio: 1.04, operatingCashFlow: 27e9, freeCashFlow: 24e9, operatingMargin: 31.6, netMargin: 25.3 },
    ],
  },
  valuation: {
    pe: 34.2, forwardPe: 30.8, ps: 8.8, pb: 52.1, evEbitda: 26.5, pegRatio: 2.8,
    sectorMedian: { pe: 28.5, ps: 6.2, pb: 8.4, evEbitda: 20.1 },
    historical5y: { avgPe: 29.3, avgPs: 7.5, avgPb: 40.2 },
  },
  risks: [
    { category: 'business', title: 'iPhone revenue concentration', description: 'iPhone accounts for ~50% of total revenue, creating dependency on a single product line.', severity: 'medium' },
    { category: 'market', title: 'China regulatory exposure', description: 'Greater China represents ~18% of revenue with increasing geopolitical tensions and local competition.', severity: 'high' },
    { category: 'business', title: 'Services antitrust scrutiny', description: 'App Store fees and search engine deals face regulatory challenges in US and EU.', severity: 'medium' },
    { category: 'financial', title: 'Premium valuation risk', description: 'Trading above historical averages on P/E and P/S. Multiple compression possible in downturn.', severity: 'low' },
    { category: 'event', title: 'Upcoming earnings Feb 2026', description: 'Q1 FY2026 earnings expected Feb 27, 2026. Market expects strong holiday quarter.', severity: 'low' },
  ],
  news: [
    { date: '2026-02-04', title: 'Apple Vision Pro 2 rumored for WWDC 2026 announcement', source: 'Bloomberg', category: 'products', sentiment: 'positive', url: '#', summary: 'Reports suggest Apple is preparing a lighter, more affordable Vision Pro successor.' },
    { date: '2026-02-01', title: 'Apple Services revenue hits record $96B in 2025', source: 'CNBC', category: 'earnings', sentiment: 'positive', url: '#', summary: 'Services segment grew 14% YoY, driven by App Store, Apple TV+, and Apple Pay.' },
    { date: '2026-01-28', title: 'EU Digital Markets Act compliance deadline approaches', source: 'Reuters', category: 'legal', sentiment: 'neutral', url: '#', summary: 'Apple faces March 2026 deadline for full DMA compliance including sideloading requirements.' },
    { date: '2026-01-22', title: 'Apple AI features drive iPhone 17 anticipation', source: 'WSJ', category: 'products', sentiment: 'positive', url: '#', summary: 'Analysts expect Apple Intelligence upgrades to drive significant iPhone upgrade cycle.' },
  ],
  institutionalHolders: [
    { name: 'Vanguard Group', shares: 1.31e9, percentOwnership: 8.6, change: 0.2, value: 311e9 },
    { name: 'BlackRock', shares: 1.04e9, percentOwnership: 6.8, change: -0.1, value: 247e9 },
    { name: 'Berkshire Hathaway', shares: 905e6, percentOwnership: 5.9, change: -0.8, value: 215e9 },
    { name: 'State Street', shares: 625e6, percentOwnership: 4.1, change: 0.1, value: 148e9 },
    { name: 'FMR (Fidelity)', shares: 370e6, percentOwnership: 2.4, change: 0.3, value: 88e9 },
  ],
  insiderTransactions: [
    { name: 'Tim Cook', title: 'CEO', type: 'sell', shares: 200000, price: 232.50, date: '2026-01-15', value: 46500000 },
    { name: 'Luca Maestri', title: 'Former CFO', type: 'sell', shares: 80000, price: 228.10, date: '2025-12-10', value: 18248000 },
    { name: 'Jeff Williams', title: 'COO', type: 'exercise', shares: 150000, price: 195.00, date: '2025-11-20', value: 29250000 },
  ],
  shortInterest: 0.7,
  priceHistory: generatePriceHistory(178, 237.42),
  earningsDate: '2026-02-27',
  exDividendDate: '2026-02-14',
  dividendYield: 0.42,
  lastUpdated: '2026-02-06 09:45 EST',
  dataCompleteness: 95,
};

const MSFT: StockData = {
  ticker: 'MSFT',
  name: 'Microsoft Corporation',
  exchange: 'NASDAQ',
  sector: 'Technology',
  industry: 'Software—Infrastructure',
  price: 432.18,
  previousClose: 428.90,
  change: 3.28,
  changePercent: 0.76,
  marketCap: 3.21e12,
  volume: 22400000,
  avgVolume: 20100000,
  high52w: 468.35,
  low52w: 362.90,
  beta: 0.92,
  description: 'Microsoft Corporation develops and supports software, services, devices, and solutions worldwide. The company operates through Intelligent Cloud, Productivity and Business Processes, and More Personal Computing segments.',
  headquarters: 'Redmond, Washington',
  founded: 1975,
  employees: 228000,
  ceo: 'Satya Nadella',
  website: 'microsoft.com',
  revenueSegments: [
    { name: 'Intelligent Cloud', value: 105.8 },
    { name: 'Productivity & Business', value: 85.4 },
    { name: 'Personal Computing', value: 68.8 },
  ],
  geographicRevenue: [
    { name: 'United States', value: 143.5 },
    { name: 'Europe', value: 65.2 },
    { name: 'Asia Pacific', value: 38.1 },
    { name: 'Rest of World', value: 13.2 },
  ],
  financials: {
    annual: [
      { period: 'FY2025', revenue: 260e9, netIncome: 90e9, operatingIncome: 115e9, grossProfit: 180e9, eps: 12.10, totalAssets: 512e9, totalDebt: 52e9, cashAndEquivalents: 75e9, currentRatio: 1.77, operatingCashFlow: 105e9, freeCashFlow: 70e9, operatingMargin: 44.2, netMargin: 34.6 },
      { period: 'FY2024', revenue: 236e9, netIncome: 82e9, operatingIncome: 104e9, grossProfit: 163e9, eps: 11.04, totalAssets: 484e9, totalDebt: 47e9, cashAndEquivalents: 71e9, currentRatio: 1.72, operatingCashFlow: 96e9, freeCashFlow: 60e9, operatingMargin: 44.1, netMargin: 34.7 },
      { period: 'FY2023', revenue: 212e9, netIncome: 72e9, operatingIncome: 89e9, grossProfit: 146e9, eps: 9.72, totalAssets: 411e9, totalDebt: 42e9, cashAndEquivalents: 34e9, currentRatio: 1.77, operatingCashFlow: 87e9, freeCashFlow: 59e9, operatingMargin: 42.0, netMargin: 34.0 },
    ],
    quarterly: [
      { period: 'Q2 2026', revenue: 70e9, netIncome: 25e9, operatingIncome: 32e9, grossProfit: 49e9, eps: 3.36, totalAssets: 520e9, totalDebt: 50e9, cashAndEquivalents: 78e9, currentRatio: 1.80, operatingCashFlow: 30e9, freeCashFlow: 20e9, operatingMargin: 45.7, netMargin: 35.7 },
      { period: 'Q1 2026', revenue: 66e9, netIncome: 23e9, operatingIncome: 30e9, grossProfit: 46e9, eps: 3.08, totalAssets: 512e9, totalDebt: 52e9, cashAndEquivalents: 75e9, currentRatio: 1.77, operatingCashFlow: 28e9, freeCashFlow: 18e9, operatingMargin: 45.5, netMargin: 34.8 },
    ],
  },
  valuation: {
    pe: 35.7, forwardPe: 31.2, ps: 12.3, pb: 12.8, evEbitda: 27.8, pegRatio: 2.3,
    sectorMedian: { pe: 28.5, ps: 6.2, pb: 8.4, evEbitda: 20.1 },
    historical5y: { avgPe: 32.1, avgPs: 11.0, avgPb: 11.5 },
  },
  risks: [
    { category: 'business', title: 'Cloud competition intensifying', description: 'AWS and Google Cloud continue aggressive pricing. Azure growth rate decelerating.', severity: 'medium' },
    { category: 'business', title: 'AI monetization uncertainty', description: 'Heavy Copilot investments require proving enterprise ROI to sustain pricing.', severity: 'medium' },
    { category: 'financial', title: 'Activision integration risk', description: '$69B acquisition still integrating. Gaming segment margins under pressure.', severity: 'low' },
    { category: 'event', title: 'FTC ongoing scrutiny', description: 'Regulatory oversight continues on cloud bundling and gaming market power.', severity: 'low' },
  ],
  news: [
    { date: '2026-02-03', title: 'Azure revenue growth accelerates to 34% in Q2', source: 'CNBC', category: 'earnings', sentiment: 'positive', url: '#', summary: 'Cloud segment beat expectations with AI services driving incremental growth.' },
    { date: '2026-01-29', title: 'Microsoft Copilot reaches 50M enterprise subscribers', source: 'Bloomberg', category: 'products', sentiment: 'positive', url: '#', summary: 'AI assistant adoption accelerating across Office 365 enterprise customers.' },
    { date: '2026-01-20', title: 'Microsoft announces $10B data center expansion', source: 'Reuters', category: 'general', sentiment: 'neutral', url: '#', summary: 'New facilities in US, Europe, and Asia to meet growing AI compute demand.' },
  ],
  institutionalHolders: [
    { name: 'Vanguard Group', shares: 620e6, percentOwnership: 8.3, change: 0.1, value: 268e9 },
    { name: 'BlackRock', shares: 510e6, percentOwnership: 6.9, change: 0.0, value: 220e9 },
    { name: 'State Street', shares: 310e6, percentOwnership: 4.2, change: 0.1, value: 134e9 },
    { name: 'FMR (Fidelity)', shares: 220e6, percentOwnership: 3.0, change: 0.2, value: 95e9 },
    { name: 'Capital Group', shares: 180e6, percentOwnership: 2.4, change: -0.1, value: 78e9 },
  ],
  insiderTransactions: [
    { name: 'Satya Nadella', title: 'CEO', type: 'sell', shares: 50000, price: 425.30, date: '2026-01-10', value: 21265000 },
    { name: 'Amy Hood', title: 'CFO', type: 'sell', shares: 25000, price: 430.00, date: '2025-12-15', value: 10750000 },
  ],
  shortInterest: 0.5,
  priceHistory: generatePriceHistory(370, 432.18),
  earningsDate: '2026-04-22',
  exDividendDate: '2026-02-20',
  dividendYield: 0.72,
  lastUpdated: '2026-02-06 09:45 EST',
  dataCompleteness: 97,
};

const NVDA: StockData = {
  ticker: 'NVDA',
  name: 'NVIDIA Corporation',
  exchange: 'NASDAQ',
  sector: 'Technology',
  industry: 'Semiconductors',
  price: 142.87,
  previousClose: 138.45,
  change: 4.42,
  changePercent: 3.19,
  marketCap: 3.48e12,
  volume: 312000000,
  avgVolume: 280000000,
  high52w: 153.13,
  low52w: 75.61,
  beta: 1.68,
  description: 'NVIDIA Corporation provides graphics and compute solutions worldwide. The company designs GPUs for gaming, data center, professional visualization, and automotive markets, and is a leader in AI computing infrastructure.',
  headquarters: 'Santa Clara, California',
  founded: 1993,
  employees: 32000,
  ceo: 'Jensen Huang',
  website: 'nvidia.com',
  revenueSegments: [
    { name: 'Data Center', value: 105.4 },
    { name: 'Gaming', value: 12.8 },
    { name: 'Professional Visualization', value: 5.2 },
    { name: 'Automotive', value: 4.1 },
    { name: 'OEM & Other', value: 2.5 },
  ],
  geographicRevenue: [
    { name: 'United States', value: 52.0 },
    { name: 'Taiwan', value: 28.5 },
    { name: 'China', value: 20.8 },
    { name: 'Other', value: 28.7 },
  ],
  financials: {
    annual: [
      { period: 'FY2025', revenue: 130e9, netIncome: 65e9, operatingIncome: 80e9, grossProfit: 97e9, eps: 2.65, totalAssets: 96e9, totalDebt: 8.5e9, cashAndEquivalents: 26e9, currentRatio: 4.2, operatingCashFlow: 72e9, freeCashFlow: 60e9, operatingMargin: 61.5, netMargin: 50.0 },
      { period: 'FY2024', revenue: 61e9, netIncome: 30e9, operatingIncome: 37e9, grossProfit: 44e9, eps: 1.21, totalAssets: 65e9, totalDebt: 9.7e9, cashAndEquivalents: 18e9, currentRatio: 4.0, operatingCashFlow: 35e9, freeCashFlow: 27e9, operatingMargin: 60.7, netMargin: 49.2 },
      { period: 'FY2023', revenue: 27e9, netIncome: 4.4e9, operatingIncome: 5.6e9, grossProfit: 15.4e9, eps: 0.18, totalAssets: 41e9, totalDebt: 11e9, cashAndEquivalents: 13e9, currentRatio: 3.5, operatingCashFlow: 5.6e9, freeCashFlow: 3.8e9, operatingMargin: 20.7, netMargin: 16.3 },
    ],
    quarterly: [
      { period: 'Q4 2025', revenue: 39e9, netIncome: 20e9, operatingIncome: 25e9, grossProfit: 29e9, eps: 0.81, totalAssets: 100e9, totalDebt: 8e9, cashAndEquivalents: 28e9, currentRatio: 4.3, operatingCashFlow: 22e9, freeCashFlow: 18e9, operatingMargin: 64.1, netMargin: 51.3 },
      { period: 'Q3 2025', revenue: 35e9, netIncome: 18e9, operatingIncome: 22e9, grossProfit: 26e9, eps: 0.73, totalAssets: 96e9, totalDebt: 8.5e9, cashAndEquivalents: 26e9, currentRatio: 4.2, operatingCashFlow: 20e9, freeCashFlow: 16e9, operatingMargin: 62.9, netMargin: 51.4 },
    ],
  },
  valuation: {
    pe: 53.9, forwardPe: 38.5, ps: 26.8, pb: 52.3, evEbitda: 45.2, pegRatio: 1.1,
    sectorMedian: { pe: 28.5, ps: 6.2, pb: 8.4, evEbitda: 20.1 },
    historical5y: { avgPe: 60.2, avgPs: 22.5, avgPb: 28.1 },
  },
  risks: [
    { category: 'business', title: 'Customer concentration', description: 'Top 5 hyperscaler customers represent >50% of data center revenue. Demand dependent on AI capex budgets.', severity: 'high' },
    { category: 'market', title: 'China export restrictions', description: 'US export controls limit high-end GPU sales to China, affecting ~15% of potential market.', severity: 'high' },
    { category: 'business', title: 'Competition from custom silicon', description: 'Google TPUs, Amazon Trainium, and AMD MI300X represent growing competitive threats.', severity: 'medium' },
    { category: 'market', title: 'Elevated volatility', description: 'Beta of 1.68 with 52-week range of $75-$153. Significant drawdowns possible.', severity: 'medium' },
    { category: 'event', title: 'Blackwell ramp execution risk', description: 'Next-gen Blackwell GPU production ramp critical for maintaining growth trajectory.', severity: 'medium' },
  ],
  news: [
    { date: '2026-02-05', title: 'NVIDIA Blackwell GPUs shipping to all major cloud providers', source: 'Bloomberg', category: 'products', sentiment: 'positive', url: '#', summary: 'Production ramp exceeding expectations with strong demand from hyperscalers.' },
    { date: '2026-01-30', title: 'NVIDIA data center revenue expected to exceed $40B in Q4', source: 'CNBC', category: 'earnings', sentiment: 'positive', url: '#', summary: 'Analysts raise estimates ahead of February earnings report.' },
    { date: '2026-01-25', title: 'DeepSeek raises questions about AI compute demand', source: 'WSJ', category: 'macro', sentiment: 'negative', url: '#', summary: 'Chinese AI lab claims efficient training methods could reduce GPU demand, sparking sell-off.' },
  ],
  institutionalHolders: [
    { name: 'Vanguard Group', shares: 1.95e9, percentOwnership: 8.0, change: 0.3, value: 279e9 },
    { name: 'BlackRock', shares: 1.58e9, percentOwnership: 6.5, change: 0.2, value: 226e9 },
    { name: 'FMR (Fidelity)', shares: 730e6, percentOwnership: 3.0, change: 0.4, value: 104e9 },
    { name: 'State Street', shares: 660e6, percentOwnership: 2.7, change: 0.1, value: 94e9 },
    { name: 'T. Rowe Price', shares: 480e6, percentOwnership: 2.0, change: -0.2, value: 69e9 },
  ],
  insiderTransactions: [
    { name: 'Jensen Huang', title: 'CEO', type: 'sell', shares: 600000, price: 140.50, date: '2026-01-20', value: 84300000 },
    { name: 'Colette Kress', title: 'CFO', type: 'sell', shares: 100000, price: 138.20, date: '2026-01-08', value: 13820000 },
    { name: 'Debora Shoquist', title: 'EVP Operations', type: 'exercise', shares: 200000, price: 88.00, date: '2025-12-05', value: 17600000 },
  ],
  shortInterest: 1.1,
  priceHistory: generatePriceHistory(82, 142.87),
  earningsDate: '2026-02-26',
  exDividendDate: '2026-03-05',
  dividendYield: 0.03,
  lastUpdated: '2026-02-06 09:45 EST',
  dataCompleteness: 93,
};

const GOOGL: StockData = {
  ticker: 'GOOGL',
  name: 'Alphabet Inc.',
  exchange: 'NASDAQ',
  sector: 'Technology',
  industry: 'Internet Content & Information',
  price: 192.35,
  previousClose: 193.80,
  change: -1.45,
  changePercent: -0.75,
  marketCap: 2.38e12,
  volume: 25600000,
  avgVolume: 23100000,
  high52w: 207.70,
  low52w: 148.52,
  beta: 1.06,
  description: 'Alphabet Inc. offers various products and platforms in the United States, Europe, the Middle East, Africa, the Asia-Pacific, Canada, and Latin America. It operates through Google Services, Google Cloud, and Other Bets segments.',
  headquarters: 'Mountain View, California',
  founded: 1998,
  employees: 182502,
  ceo: 'Sundar Pichai',
  website: 'abc.xyz',
  revenueSegments: [
    { name: 'Google Advertising', value: 260.5 },
    { name: 'Google Cloud', value: 48.2 },
    { name: 'Google Subscriptions', value: 36.8 },
    { name: 'Other Bets', value: 4.5 },
  ],
  geographicRevenue: [
    { name: 'United States', value: 175.0 },
    { name: 'EMEA', value: 105.0 },
    { name: 'APAC', value: 55.0 },
    { name: 'Other Americas', value: 15.0 },
  ],
  financials: {
    annual: [
      { period: 'FY2025', revenue: 350e9, netIncome: 100e9, operatingIncome: 120e9, grossProfit: 200e9, eps: 8.12, totalAssets: 432e9, totalDebt: 14e9, cashAndEquivalents: 95e9, currentRatio: 2.1, operatingCashFlow: 115e9, freeCashFlow: 72e9, operatingMargin: 34.3, netMargin: 28.6 },
      { period: 'FY2024', revenue: 328e9, netIncome: 88e9, operatingIncome: 107e9, grossProfit: 186e9, eps: 7.12, totalAssets: 402e9, totalDebt: 13e9, cashAndEquivalents: 86e9, currentRatio: 2.0, operatingCashFlow: 101e9, freeCashFlow: 60e9, operatingMargin: 32.6, netMargin: 26.8 },
      { period: 'FY2023', revenue: 307e9, netIncome: 73e9, operatingIncome: 84e9, grossProfit: 174e9, eps: 5.80, totalAssets: 366e9, totalDebt: 13e9, cashAndEquivalents: 80e9, currentRatio: 2.1, operatingCashFlow: 92e9, freeCashFlow: 51e9, operatingMargin: 27.4, netMargin: 23.8 },
    ],
    quarterly: [
      { period: 'Q4 2025', revenue: 95e9, netIncome: 28e9, operatingIncome: 34e9, grossProfit: 55e9, eps: 2.28, totalAssets: 440e9, totalDebt: 14e9, cashAndEquivalents: 98e9, currentRatio: 2.2, operatingCashFlow: 32e9, freeCashFlow: 20e9, operatingMargin: 35.8, netMargin: 29.5 },
      { period: 'Q3 2025', revenue: 88e9, netIncome: 26e9, operatingIncome: 30e9, grossProfit: 50e9, eps: 2.10, totalAssets: 432e9, totalDebt: 14e9, cashAndEquivalents: 95e9, currentRatio: 2.1, operatingCashFlow: 29e9, freeCashFlow: 18e9, operatingMargin: 34.1, netMargin: 29.5 },
    ],
  },
  valuation: {
    pe: 23.7, forwardPe: 20.5, ps: 6.8, pb: 7.2, evEbitda: 17.9, pegRatio: 1.5,
    sectorMedian: { pe: 28.5, ps: 6.2, pb: 8.4, evEbitda: 20.1 },
    historical5y: { avgPe: 25.8, avgPs: 6.5, avgPb: 6.0 },
  },
  risks: [
    { category: 'business', title: 'Search market disruption from AI', description: 'ChatGPT, Perplexity, and other AI tools threaten Google\'s dominant search position.', severity: 'high' },
    { category: 'business', title: 'Advertising dependency', description: '~74% of revenue from advertising. Macro slowdown directly impacts core business.', severity: 'medium' },
    { category: 'financial', title: 'Heavy AI capex investment', description: 'Massive data center spending may pressure FCF margins if AI monetization lags.', severity: 'medium' },
    { category: 'event', title: 'DOJ antitrust trial outcome', description: 'Potential remedies from search antitrust case could reshape business model.', severity: 'high' },
  ],
  news: [
    { date: '2026-02-02', title: 'Alphabet cloud revenue crosses $48B annual run rate', source: 'CNBC', category: 'earnings', sentiment: 'positive', url: '#', summary: 'Google Cloud growth accelerated to 32% YoY, driven by Gemini AI services.' },
    { date: '2026-01-26', title: 'DOJ proposes Chrome divestiture in antitrust remedy', source: 'WSJ', category: 'legal', sentiment: 'negative', url: '#', summary: 'Government seeks structural remedies; Alphabet pledges to appeal. Market impact limited.' },
    { date: '2026-01-18', title: 'Waymo expands autonomous service to 5 new cities', source: 'TechCrunch', category: 'products', sentiment: 'positive', url: '#', summary: 'Alphabet\'s robotaxi subsidiary accelerating geographic expansion.' },
  ],
  institutionalHolders: [
    { name: 'Vanguard Group', shares: 780e6, percentOwnership: 6.3, change: 0.1, value: 150e9 },
    { name: 'BlackRock', shares: 650e6, percentOwnership: 5.3, change: 0.0, value: 125e9 },
    { name: 'State Street', shares: 390e6, percentOwnership: 3.2, change: 0.1, value: 75e9 },
    { name: 'FMR (Fidelity)', shares: 280e6, percentOwnership: 2.3, change: 0.2, value: 54e9 },
    { name: 'T. Rowe Price', shares: 210e6, percentOwnership: 1.7, change: -0.3, value: 40e9 },
  ],
  insiderTransactions: [
    { name: 'Sundar Pichai', title: 'CEO', type: 'sell', shares: 22000, price: 190.50, date: '2026-01-12', value: 4191000 },
    { name: 'Ruth Porat', title: 'President & CIO', type: 'sell', shares: 12000, price: 188.00, date: '2025-12-20', value: 2256000 },
  ],
  shortInterest: 0.8,
  priceHistory: generatePriceHistory(155, 192.35),
  earningsDate: '2026-04-24',
  exDividendDate: '2026-03-10',
  dividendYield: 0.42,
  lastUpdated: '2026-02-06 09:45 EST',
  dataCompleteness: 96,
};

const AMZN: StockData = {
  ticker: 'AMZN',
  name: 'Amazon.com, Inc.',
  exchange: 'NASDAQ',
  sector: 'Consumer Cyclical',
  industry: 'Internet Retail',
  price: 228.64,
  previousClose: 225.90,
  change: 2.74,
  changePercent: 1.21,
  marketCap: 2.42e12,
  volume: 42300000,
  avgVolume: 38500000,
  high52w: 242.52,
  low52w: 166.21,
  beta: 1.15,
  description: 'Amazon.com, Inc. engages in the retail sale of consumer products, advertising, and subscription services through online and physical stores worldwide. It also provides AWS cloud computing and AI services.',
  headquarters: 'Seattle, Washington',
  founded: 1994,
  employees: 1540000,
  ceo: 'Andy Jassy',
  website: 'amazon.com',
  revenueSegments: [
    { name: 'Online Stores', value: 245.2 },
    { name: 'AWS', value: 110.5 },
    { name: 'Third-Party Seller', value: 155.8 },
    { name: 'Advertising', value: 62.3 },
    { name: 'Subscription Services', value: 45.2 },
    { name: 'Physical Stores', value: 21.0 },
  ],
  geographicRevenue: [
    { name: 'United States', value: 405.0 },
    { name: 'Germany', value: 42.0 },
    { name: 'United Kingdom', value: 38.0 },
    { name: 'Japan', value: 28.0 },
    { name: 'Rest of World', value: 127.0 },
  ],
  financials: {
    annual: [
      { period: 'FY2025', revenue: 640e9, netIncome: 50e9, operatingIncome: 68e9, grossProfit: 290e9, eps: 4.78, totalAssets: 530e9, totalDebt: 58e9, cashAndEquivalents: 73e9, currentRatio: 1.05, operatingCashFlow: 90e9, freeCashFlow: 36e9, operatingMargin: 10.6, netMargin: 7.8 },
      { period: 'FY2024', revenue: 590e9, netIncome: 44e9, operatingIncome: 58e9, grossProfit: 260e9, eps: 4.18, totalAssets: 510e9, totalDebt: 55e9, cashAndEquivalents: 68e9, currentRatio: 1.03, operatingCashFlow: 80e9, freeCashFlow: 28e9, operatingMargin: 9.8, netMargin: 7.5 },
      { period: 'FY2023', revenue: 575e9, netIncome: 30e9, operatingIncome: 37e9, grossProfit: 248e9, eps: 2.90, totalAssets: 463e9, totalDebt: 52e9, cashAndEquivalents: 54e9, currentRatio: 1.05, operatingCashFlow: 72e9, freeCashFlow: 22e9, operatingMargin: 6.4, netMargin: 5.2 },
    ],
    quarterly: [
      { period: 'Q4 2025', revenue: 182e9, netIncome: 16e9, operatingIncome: 21e9, grossProfit: 82e9, eps: 1.52, totalAssets: 535e9, totalDebt: 56e9, cashAndEquivalents: 76e9, currentRatio: 1.07, operatingCashFlow: 28e9, freeCashFlow: 12e9, operatingMargin: 11.5, netMargin: 8.8 },
      { period: 'Q3 2025', revenue: 155e9, netIncome: 12e9, operatingIncome: 16e9, grossProfit: 70e9, eps: 1.14, totalAssets: 530e9, totalDebt: 58e9, cashAndEquivalents: 73e9, currentRatio: 1.05, operatingCashFlow: 24e9, freeCashFlow: 9e9, operatingMargin: 10.3, netMargin: 7.7 },
    ],
  },
  valuation: {
    pe: 47.8, forwardPe: 35.2, ps: 3.8, pb: 8.2, evEbitda: 22.5, pegRatio: 1.9,
    sectorMedian: { pe: 22.0, ps: 1.5, pb: 4.2, evEbitda: 14.5 },
    historical5y: { avgPe: 65.0, avgPs: 3.2, avgPb: 9.5 },
  },
  risks: [
    { category: 'business', title: 'Retail margin pressure', description: 'E-commerce operates on thin margins. Logistics costs and competition from Temu/Shein.', severity: 'medium' },
    { category: 'business', title: 'AWS growth moderation', description: 'Cloud growth rate showing signs of maturation as market share stabilizes.', severity: 'medium' },
    { category: 'financial', title: 'Heavy capex cycle', description: 'AI infrastructure investment exceeding $80B annually, pressuring free cash flow.', severity: 'medium' },
    { category: 'event', title: 'Labor relations', description: 'Warehouse worker unionization efforts ongoing. Potential for increased labor costs.', severity: 'low' },
  ],
  news: [
    { date: '2026-02-03', title: 'Amazon AWS launches custom AI chips for enterprise', source: 'Bloomberg', category: 'products', sentiment: 'positive', url: '#', summary: 'New Trainium3 chips offer 40% cost reduction for AI workloads vs NVIDIA alternatives.' },
    { date: '2026-01-28', title: 'Amazon Q4 revenue beats estimates at $182B', source: 'CNBC', category: 'earnings', sentiment: 'positive', url: '#', summary: 'Holiday quarter strong. AWS growth at 20% YoY with improving margins.' },
    { date: '2026-01-20', title: 'Amazon expands same-day delivery to 30 new cities', source: 'Reuters', category: 'products', sentiment: 'neutral', url: '#', summary: 'Logistics investment continues as competitive advantage against rivals.' },
  ],
  institutionalHolders: [
    { name: 'Vanguard Group', shares: 700e6, percentOwnership: 6.6, change: 0.1, value: 160e9 },
    { name: 'BlackRock', shares: 580e6, percentOwnership: 5.5, change: 0.0, value: 133e9 },
    { name: 'State Street', shares: 340e6, percentOwnership: 3.2, change: 0.1, value: 78e9 },
    { name: 'FMR (Fidelity)', shares: 250e6, percentOwnership: 2.4, change: 0.3, value: 57e9 },
    { name: 'Capital Group', shares: 200e6, percentOwnership: 1.9, change: 0.0, value: 46e9 },
  ],
  insiderTransactions: [
    { name: 'Andy Jassy', title: 'CEO', type: 'sell', shares: 30000, price: 222.50, date: '2026-01-15', value: 6675000 },
    { name: 'Brian Olsavsky', title: 'CFO', type: 'sell', shares: 10000, price: 220.00, date: '2025-12-20', value: 2200000 },
  ],
  shortInterest: 0.6,
  priceHistory: generatePriceHistory(175, 228.64),
  earningsDate: '2026-04-30',
  exDividendDate: null,
  dividendYield: 0,
  lastUpdated: '2026-02-06 09:45 EST',
  dataCompleteness: 94,
};

const TSLA: StockData = {
  ticker: 'TSLA',
  name: 'Tesla, Inc.',
  exchange: 'NASDAQ',
  sector: 'Consumer Cyclical',
  industry: 'Auto Manufacturers',
  price: 395.20,
  previousClose: 402.10,
  change: -6.90,
  changePercent: -1.72,
  marketCap: 1.27e12,
  volume: 98700000,
  avgVolume: 85200000,
  high52w: 488.54,
  low52w: 142.05,
  beta: 2.31,
  description: 'Tesla, Inc. designs, develops, manufactures, sells, and leases electric vehicles and energy generation/storage systems. The company also provides vehicle service, charging, and AI-powered autonomous driving technology.',
  headquarters: 'Austin, Texas',
  founded: 2003,
  employees: 140473,
  ceo: 'Elon Musk',
  website: 'tesla.com',
  revenueSegments: [
    { name: 'Automotive', value: 82.4 },
    { name: 'Energy & Storage', value: 14.2 },
    { name: 'Services & Other', value: 13.4 },
  ],
  geographicRevenue: [
    { name: 'United States', value: 48.5 },
    { name: 'China', value: 24.8 },
    { name: 'Europe', value: 22.1 },
    { name: 'Other', value: 14.6 },
  ],
  financials: {
    annual: [
      { period: 'FY2025', revenue: 110e9, netIncome: 12e9, operatingIncome: 14e9, grossProfit: 22e9, eps: 3.74, totalAssets: 112e9, totalDebt: 5.5e9, cashAndEquivalents: 22e9, currentRatio: 1.72, operatingCashFlow: 18e9, freeCashFlow: 6e9, operatingMargin: 12.7, netMargin: 10.9 },
      { period: 'FY2024', revenue: 97e9, netIncome: 7.1e9, operatingIncome: 8.8e9, grossProfit: 17.7e9, eps: 2.24, totalAssets: 106e9, totalDebt: 5.2e9, cashAndEquivalents: 18e9, currentRatio: 1.68, operatingCashFlow: 14e9, freeCashFlow: 3.5e9, operatingMargin: 9.1, netMargin: 7.3 },
      { period: 'FY2023', revenue: 96.8e9, netIncome: 15e9, operatingIncome: 8.9e9, grossProfit: 17.6e9, eps: 4.73, totalAssets: 98e9, totalDebt: 5.7e9, cashAndEquivalents: 16e9, currentRatio: 1.73, operatingCashFlow: 13e9, freeCashFlow: 2.8e9, operatingMargin: 9.2, netMargin: 15.5 },
    ],
    quarterly: [
      { period: 'Q4 2025', revenue: 30e9, netIncome: 3.8e9, operatingIncome: 4.5e9, grossProfit: 6.5e9, eps: 1.19, totalAssets: 115e9, totalDebt: 5.3e9, cashAndEquivalents: 24e9, currentRatio: 1.75, operatingCashFlow: 5.5e9, freeCashFlow: 2e9, operatingMargin: 15.0, netMargin: 12.7 },
      { period: 'Q3 2025', revenue: 28e9, netIncome: 3.2e9, operatingIncome: 3.8e9, grossProfit: 5.8e9, eps: 1.00, totalAssets: 112e9, totalDebt: 5.5e9, cashAndEquivalents: 22e9, currentRatio: 1.72, operatingCashFlow: 4.8e9, freeCashFlow: 1.5e9, operatingMargin: 13.6, netMargin: 11.4 },
    ],
  },
  valuation: {
    pe: 105.7, forwardPe: 72.0, ps: 11.5, pb: 18.8, evEbitda: 68.5, pegRatio: 3.5,
    sectorMedian: { pe: 12.0, ps: 0.8, pb: 1.5, evEbitda: 8.5 },
    historical5y: { avgPe: 95.0, avgPs: 12.0, avgPb: 22.0 },
  },
  risks: [
    { category: 'business', title: 'CEO distraction risk', description: 'Elon Musk involvement in DOGE and multiple ventures raises governance concerns.', severity: 'high' },
    { category: 'business', title: 'Intensifying EV competition', description: 'BYD, legacy automakers, and startups eroding Tesla market share globally.', severity: 'high' },
    { category: 'market', title: 'Extreme valuation premium', description: 'P/E of 105x vs auto sector median of 12x. Priced for autonomous driving success.', severity: 'high' },
    { category: 'financial', title: 'Margin pressure from price cuts', description: 'Multiple rounds of vehicle price reductions to maintain volume growth.', severity: 'medium' },
    { category: 'event', title: 'Robotaxi regulatory uncertainty', description: 'FSD/robotaxi timeline uncertain. Regulatory approval process unclear.', severity: 'medium' },
  ],
  news: [
    { date: '2026-02-04', title: 'Tesla FSD v13 achieves 10x safety improvement claim', source: 'Bloomberg', category: 'products', sentiment: 'positive', url: '#', summary: 'Latest autonomous driving software shows significant improvements in NHTSA testing scenarios.' },
    { date: '2026-01-29', title: 'Tesla Q4 deliveries exceed 500K vehicles for first time', source: 'CNBC', category: 'earnings', sentiment: 'positive', url: '#', summary: 'Strong quarter driven by Model Y refresh and new affordable Model Q rumors.' },
    { date: '2026-01-22', title: 'Tesla brand perception declines in key European markets', source: 'Reuters', category: 'general', sentiment: 'negative', url: '#', summary: 'Survey shows CEO political involvement negatively impacting sales in Germany and France.' },
  ],
  institutionalHolders: [
    { name: 'Vanguard Group', shares: 250e6, percentOwnership: 7.8, change: 0.1, value: 99e9 },
    { name: 'BlackRock', shares: 200e6, percentOwnership: 6.2, change: -0.1, value: 79e9 },
    { name: 'State Street', shares: 120e6, percentOwnership: 3.7, change: 0.0, value: 47e9 },
    { name: 'Geode Capital', shares: 55e6, percentOwnership: 1.7, change: 0.1, value: 22e9 },
    { name: 'Capital Group', shares: 45e6, percentOwnership: 1.4, change: -0.3, value: 18e9 },
  ],
  insiderTransactions: [
    { name: 'Vaibhav Taneja', title: 'CFO', type: 'sell' as const, shares: 7500, price: 380.00, date: '2026-01-10', value: 2850000 },
  ],
  shortInterest: 2.8,
  priceHistory: generatePriceHistory(180, 395.20),
  earningsDate: '2026-04-23',
  exDividendDate: null,
  dividendYield: 0,
  lastUpdated: '2026-02-06 09:45 EST',
  dataCompleteness: 88,
};

export const stocksMap: Record<string, StockData> = {
  AAPL,
  MSFT,
  NVDA,
  GOOGL,
  AMZN,
  TSLA,
};

export const stocksList = Object.values(stocksMap);

export function getStock(ticker: string): StockData | undefined {
  return stocksMap[ticker.toUpperCase()];
}
