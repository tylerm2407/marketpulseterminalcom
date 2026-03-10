import { useState } from 'react';
import { Footer } from '@/components/layout/Footer';
import { TickerMarquee } from '@/components/TickerMarquee';
import { BookOpen, Search } from 'lucide-react';

interface GlossaryTerm {
  term: string;
  category: string;
  definition: string;
  example?: string;
}

const GLOSSARY_TERMS: GlossaryTerm[] = [
  { term: 'Bear Market', category: 'Market Basics', definition: 'A period when stock prices are falling, typically defined as a 20%+ decline from recent highs. Investors are pessimistic and selling.', example: 'The 2022 bear market saw the NASDAQ fall over 33% from its peak.' },
  { term: 'Bid-Ask Spread', category: 'Market Basics', definition: 'The difference between the highest price a buyer will pay and the lowest price a seller will accept. A narrow spread indicates high liquidity; a wide spread indicates low liquidity.', example: 'A stock with a bid of $99.98 and ask of $100.02 has a $0.04 spread.' },
  { term: 'Blue Chip', category: 'Market Basics', definition: 'A large, well-established company with a long track record of stable earnings and reliable dividends. Examples: Apple, Microsoft, Johnson and Johnson.' },
  { term: 'Book Value', category: 'Valuation', definition: 'The net asset value of a company: total assets minus total liabilities. Represents what shareholders would receive if the company were liquidated today.' },
  { term: 'Bull Market', category: 'Market Basics', definition: 'A period when stock prices are rising, typically defined as a 20%+ gain from recent lows. Investors are optimistic and buying.', example: 'The S&P 500 entered a bull market after recovering 20% from its October 2022 lows.' },
  { term: 'Call Option', category: 'Options', definition: 'A contract giving the buyer the right to purchase a stock at a specific price before a specific date. Buyers profit when the stock rises above the strike price.', example: 'A $150 call on AAPL gives you the right to buy 100 shares at $150, even if the stock rises to $200.' },
  { term: 'Candlestick Chart', category: 'Technical Analysis', definition: 'A price chart showing four data points per period: open, high, low, and close. Green candles indicate price went up; red candles indicate price went down.' },
  { term: 'CPI', category: 'Macro', definition: 'Consumer Price Index. Measures the average change in prices paid by consumers for a basket of goods and services. The primary inflation gauge watched by the Federal Reserve.', example: 'A CPI print of 3.5% means consumer prices are 3.5% higher than a year ago.' },
  { term: 'Debt-to-Equity Ratio', category: 'Fundamentals', definition: 'Total debt divided by shareholders equity. Measures how much a company relies on debt vs equity to finance itself. Higher ratios mean more financial leverage and risk.', example: 'A D/E ratio of 2.0 means a company has twice as much debt as equity.' },
  { term: 'Delta', category: 'Options', definition: 'How much an option price changes for every $1 move in the underlying stock. A delta of 0.5 means the option gains $0.50 for every $1 the stock rises.' },
  { term: 'Diversification', category: 'Strategy', definition: 'Spreading investments across different assets, sectors, and geographies to reduce risk. If one investment falls, others may rise or hold steady, softening the blow.' },
  { term: 'Dollar-Cost Averaging', category: 'Strategy', definition: 'Investing a fixed dollar amount at regular intervals regardless of price. You buy more shares when prices are low and fewer when prices are high.', example: 'Investing $500 in the S&P 500 every month regardless of market conditions.' },
  { term: 'EBITDA', category: 'Fundamentals', definition: 'Earnings Before Interest, Taxes, Depreciation, and Amortization. A proxy for cash flow from operations allowing comparison across companies with different capital structures.' },
  { term: 'EPS', category: 'Valuation', definition: 'Earnings Per Share. Net profit divided by the number of outstanding shares. Measures how much money a company earns for each share held by investors.', example: 'If a company earns $10M net profit with 5M shares outstanding, its EPS is $2.00.' },
  { term: 'ETF', category: 'Funds', definition: 'Exchange-Traded Fund. A basket of securities that trades on an exchange like a stock. Offers diversification at low cost. Examples: SPY (S&P 500), QQQ (NASDAQ 100).', example: 'Buying one share of SPY gives you exposure to all 500 companies in the S&P 500.' },
  { term: 'EV/EBITDA', category: 'Valuation', definition: 'Enterprise Value to EBITDA. Compares a company total value (including debt) to its operating earnings. Often used in M&A analysis to value companies.' },
  { term: 'Expense Ratio', category: 'Funds', definition: 'The annual fee charged by a fund, expressed as a percentage of assets. A 0.03% expense ratio on $10,000 costs $3 per year. Lower is better for long-term investors.' },
  { term: 'Federal Funds Rate', category: 'Macro', definition: 'The interest rate at which banks lend to each other overnight, set by the Federal Reserve. The primary tool for controlling inflation and stimulating the economy.' },
  { term: 'Free Cash Flow', category: 'Fundamentals', definition: 'Cash generated by the business after paying for capital expenditures. The money available to return to shareholders, pay down debt, or reinvest in the business.', example: 'Apple generated over $100 billion in free cash flow in 2023, funding its massive buyback program.' },
  { term: 'GDP', category: 'Macro', definition: 'Gross Domestic Product. The total monetary value of all goods and services produced within a country. Two consecutive quarters of negative GDP growth is typically called a recession.' },
  { term: 'Gross Margin', category: 'Fundamentals', definition: 'Revenue minus cost of goods sold, expressed as a percentage of revenue. Higher margins mean more pricing power. Software companies typically have 70-90% gross margins.' },
  { term: 'Hedge', category: 'Strategy', definition: 'An investment made to offset potential losses in another investment. Like insurance for your portfolio. Common hedges include put options, inverse ETFs, and gold.' },
  { term: 'Implied Volatility', category: 'Options', definition: 'The market forecast of how much a stock will move, derived from option prices. High IV means options are expensive; low IV means options are cheap.', example: 'IV typically spikes before earnings announcements as traders anticipate big post-earnings moves.' },
  { term: 'Index Fund', category: 'Funds', definition: 'A fund that passively tracks a market index rather than trying to beat it. Lower costs than active funds; historically outperforms most active managers over the long term.' },
  { term: 'Inflation', category: 'Macro', definition: 'The rate at which prices rise over time, eroding purchasing power. Measured by the Consumer Price Index (CPI). The Fed targets 2% annual inflation.' },
  { term: 'Intrinsic Value', category: 'Valuation', definition: 'The true underlying value of a stock based on fundamentals, independent of its current market price. Calculated using methods like discounted cash flow analysis.' },
  { term: 'IPO', category: 'Market Basics', definition: 'Initial Public Offering. When a private company sells shares to the public for the first time. Companies use IPOs to raise capital for growth.' },
  { term: 'Liquidity', category: 'Market Basics', definition: 'How easily an asset can be bought or sold without significantly affecting its price. Highly liquid assets can be traded instantly; illiquid assets like real estate take time.' },
  { term: 'Market Capitalization', category: 'Market Basics', definition: 'The total market value of a company outstanding shares. Calculated as share price times total shares outstanding. Used to classify companies as large-cap, mid-cap, or small-cap.' },
  { term: 'Momentum Investing', category: 'Strategy', definition: 'Buying stocks that have been rising on the theory that strong performance will continue. Works well in trending markets but can fail badly in reversals.' },
  { term: 'Moving Average', category: 'Technical Analysis', definition: 'The average stock price over a specific period (50-day or 200-day), updated daily. Smooths out short-term price fluctuations to show the underlying trend.', example: 'When a stock 50-day MA crosses above its 200-day MA, traders call it a golden cross.' },
  { term: 'P/E Ratio', category: 'Valuation', definition: 'Price-to-Earnings Ratio. Compares a stock price to its annual earnings per share. A higher P/E means investors pay more for each dollar of earnings.', example: 'A stock at $50 with $5 EPS has a P/E of 10. The S&P 500 average P/E is typically 15-25.' },
  { term: 'P/S Ratio', category: 'Valuation', definition: 'Price-to-Sales Ratio. Compares a company market cap to its annual revenue. Useful for valuing companies that are not yet profitable, like early-stage tech firms.' },
  { term: 'PMI', category: 'Macro', definition: 'Purchasing Managers Index. A survey-based indicator of economic activity. Above 50 means expansion; below 50 means contraction. Released monthly.' },
  { term: 'Put Option', category: 'Options', definition: 'A contract giving the buyer the right to sell a stock at the strike price before expiration. Buyers profit when the stock falls below the strike price. Often used as portfolio insurance.' },
  { term: 'Resistance Level', category: 'Technical Analysis', definition: 'A price level where a stock has historically struggled to break above. Sellers tend to emerge at resistance, capping further gains.' },
  { term: 'Revenue', category: 'Fundamentals', definition: 'The total income a company generates from its core business before any expenses are deducted. Also called the top line because it is the first line of the income statement.' },
  { term: 'RSI', category: 'Technical Analysis', definition: 'Relative Strength Index. A momentum indicator measuring how overbought or oversold a stock is, on a scale of 0-100. Above 70 may be overbought; below 30 may be oversold.' },
  { term: 'Sector ETF', category: 'Funds', definition: 'An ETF that holds stocks from a specific market sector such as technology, healthcare, or energy. Lets investors target specific parts of the economy without picking individual stocks.' },
  { term: 'Short Selling', category: 'Strategy', definition: 'Borrowing shares and selling them, hoping to buy them back cheaper later. Profits from price declines. Losses are theoretically unlimited if the stock rises.' },
  { term: 'Support Level', category: 'Technical Analysis', definition: 'A price level where a stock has historically stopped falling and bounced back up. Buyers tend to step in at support levels, preventing further decline.' },
  { term: 'Volatility', category: 'Market Basics', definition: 'How much a stock price fluctuates over time. High volatility means large price swings; low volatility means steadier prices. Measured by standard deviation or the VIX index.' },
  { term: 'Volume', category: 'Technical Analysis', definition: 'The number of shares traded during a given period. High volume on a price move confirms the move strength; low volume suggests it may not be sustained.' },
  { term: 'Yield Curve', category: 'Macro', definition: 'A chart showing interest rates on bonds of different maturities. An inverted yield curve where short-term rates exceed long-term rates has historically predicted recessions.' },
];

const CATEGORIES = ['All', ...Array.from(new Set(GLOSSARY_TERMS.map(t => t.category)))];

export default function Glossary() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = GLOSSARY_TERMS.filter((term) => {
    const matchesSearch =
      term.term.toLowerCase().includes(search.toLowerCase()) ||
      term.definition.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All' || term.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const grouped = filtered.reduce<Record<string, GlossaryTerm[]>>((acc, term) => {
    const letter = term.term[0].toUpperCase();
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(term);
    return acc;
  }, {});

  const letters = Object.keys(grouped).sort();

  return (
    <div className="min-h-screen pb-16 sm:pb-0" style={{ backgroundColor: 'var(--bg-base)' }}>
      <TickerMarquee />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-5 w-5 text-[var(--accent-primary)]" />
            <h1 className="text-2xl font-bold font-display text-[var(--text-primary)]">Investing Glossary</h1>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">
            {GLOSSARY_TERMS.length}+ investing terms explained in plain English. No jargon, no fluff.
          </p>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search terms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
          />
        </div>

        <div className="flex flex-wrap gap-1.5 mb-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                activeCategory === cat
                  ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]'
                  : 'border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-[var(--accent-primary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {(search || activeCategory !== 'All') && (
          <p className="text-xs text-[var(--text-muted)] mb-4">{filtered.length} term{filtered.length !== 1 ? 's' : ''} found</p>
        )}

        {filtered.length === 0 ? (
          <div className="text-center py-16 card-elevated">
            <BookOpen className="h-10 w-10 text-[var(--text-muted)] mx-auto mb-3 opacity-30" />
            <p className="text-[var(--text-secondary)] text-sm">No terms match your search.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {letters.map((letter) => (
              <div key={letter}>
                <div className="text-xs font-bold text-[var(--accent-primary)] uppercase tracking-widest mb-2 pl-1">{letter}</div>
                <div className="space-y-2">
                  {grouped[letter].map((term) => (
                    <div key={term.term} className="card-elevated p-4">
                      <div className="flex items-start justify-between gap-3 mb-1.5">
                        <h3 className="font-semibold text-[var(--text-primary)] text-sm">{term.term}</h3>
                        <span className="text-[10px] text-[var(--text-muted)] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] px-2 py-0.5 rounded-full shrink-0">
                          {term.category}
                        </span>
                      </div>
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{term.definition}</p>
                      {term.example && (
                        <p className="text-xs text-[var(--text-muted)] mt-2 pl-3 border-l-2 border-[rgba(34,197,94,0.4)] italic leading-relaxed">
                          {term.example}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}