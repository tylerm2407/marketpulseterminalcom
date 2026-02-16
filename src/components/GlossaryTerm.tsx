import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';

const GLOSSARY: Record<string, { term: string; definition: string }> = {
  'pe': {
    term: 'P/E Ratio',
    definition: 'Price-to-Earnings ratio measures how much investors pay per dollar of earnings. A higher P/E may indicate expected growth; a lower P/E may suggest undervaluation or slower growth.',
  },
  'ps': {
    term: 'P/S Ratio',
    definition: 'Price-to-Sales ratio compares stock price to revenue per share. Useful for companies with no earnings yet.',
  },
  'pb': {
    term: 'P/B Ratio',
    definition: 'Price-to-Book ratio compares market value to book value (assets minus liabilities). Below 1.0 may indicate undervaluation.',
  },
  'evEbitda': {
    term: 'EV/EBITDA',
    definition: 'Enterprise Value to EBITDA measures total company value relative to operating cash earnings. Lower values may indicate better value.',
  },
  'peg': {
    term: 'PEG Ratio',
    definition: 'Price/Earnings-to-Growth ratio factors in expected earnings growth. A PEG of 1.0 suggests fair value relative to growth.',
  },
  'beta': {
    term: 'Beta',
    definition: 'Measures stock volatility relative to the market. Beta > 1 means more volatile; Beta < 1 means less volatile than the market.',
  },
  'marketCap': {
    term: 'Market Cap',
    definition: 'Total market value of outstanding shares. Calculated as share price × total shares outstanding.',
  },
  'eps': {
    term: 'EPS',
    definition: 'Earnings Per Share is net income divided by outstanding shares. Higher EPS generally indicates greater profitability.',
  },
  'freeCashFlow': {
    term: 'Free Cash Flow',
    definition: 'Cash generated after capital expenditures. Indicates how much cash a company has for dividends, buybacks, or reinvestment.',
  },
  'operatingMargin': {
    term: 'Operating Margin',
    definition: 'Percentage of revenue remaining after operating expenses. Shows operational efficiency.',
  },
  'netMargin': {
    term: 'Net Margin',
    definition: 'Percentage of revenue remaining as profit after all expenses, taxes, and interest.',
  },
  'currentRatio': {
    term: 'Current Ratio',
    definition: 'Current assets divided by current liabilities. Above 1.0 means the company can cover short-term obligations.',
  },
  'shortInterest': {
    term: 'Short Interest',
    definition: 'Percentage of shares sold short. High short interest may indicate bearish sentiment or potential for a short squeeze.',
  },
  'dividendYield': {
    term: 'Dividend Yield',
    definition: 'Annual dividend per share divided by stock price. Shows the return from dividends alone.',
  },
  'rsi': {
    term: 'RSI',
    definition: 'Relative Strength Index measures momentum on a 0–100 scale. Above 70 is overbought; below 30 is oversold.',
  },
  'sma': {
    term: 'SMA',
    definition: 'Simple Moving Average smooths price data over a period. Used to identify trend direction.',
  },
  'ema': {
    term: 'EMA',
    definition: 'Exponential Moving Average gives more weight to recent prices, reacting faster to changes than SMA.',
  },
  'forwardPe': {
    term: 'Forward P/E',
    definition: 'P/E ratio using estimated future earnings. Shows what investors expect to pay based on projected profitability.',
  },
  'debtToEquity': {
    term: 'Debt-to-Equity',
    definition: 'Total debt divided by shareholder equity. Higher ratios indicate more leverage and potentially higher risk.',
  },
  'revenueGrowth': {
    term: 'Revenue Growth',
    definition: 'Year-over-year percentage change in total revenue. Indicates how fast a company is expanding.',
  },
  'grossProfit': {
    term: 'Gross Profit',
    definition: 'Revenue minus cost of goods sold. Shows profitability before operating expenses.',
  },
  '52w': {
    term: '52-Week Range',
    definition: 'The highest and lowest stock prices over the past year. Provides context for current price relative to recent history.',
  },
  'volume': {
    term: 'Volume',
    definition: 'Number of shares traded in a period. Higher volume often indicates stronger interest or conviction.',
  },
};

interface GlossaryTermProps {
  termKey: string;
  children: React.ReactNode;
  inline?: boolean;
}

export function GlossaryTerm({ termKey, children, inline = false }: GlossaryTermProps) {
  const entry = GLOSSARY[termKey];
  if (!entry) return <>{children}</>;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={`${inline ? 'inline-flex items-center gap-0.5' : ''} cursor-help border-b border-dotted border-muted-foreground/30 hover:border-muted-foreground/60 transition-colors`}>
          {children}
          {inline && <HelpCircle className="h-3 w-3 text-muted-foreground/50 shrink-0" />}
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[280px] text-left">
        <p className="font-semibold text-xs mb-1">{entry.term}</p>
        <p className="text-xs text-muted-foreground leading-relaxed">{entry.definition}</p>
      </TooltipContent>
    </Tooltip>
  );
}

export { GLOSSARY };
