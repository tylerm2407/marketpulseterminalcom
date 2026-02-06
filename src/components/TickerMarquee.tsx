import { Link } from 'react-router-dom';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { useWatchlistQuotes } from '@/hooks/useStockData';
import { formatCurrency, formatPercent } from '@/lib/formatters';

const MARQUEE_TICKERS = ['AAPL', 'MSFT', 'NVDA', 'GOOGL', 'AMZN', 'TSLA', 'META', 'BRK-B', 'JPM', 'V'];

interface TickerMarqueeProps {
  /** Visual variant to match surrounding context */
  variant?: 'default' | 'hero';
}

export function TickerMarquee({ variant = 'default' }: TickerMarqueeProps) {
  const { data: quotes } = useWatchlistQuotes(MARQUEE_TICKERS);

  if (!quotes?.length) return null;

  // Double the items so the scroll loops seamlessly
  const items = [...quotes, ...quotes];

  const isHero = variant === 'hero';

  return (
    <div
      className={`overflow-hidden border-y ${
        isHero
          ? 'border-primary-foreground/10 bg-primary-foreground/5'
          : 'border-border bg-muted/40'
      }`}
    >
      <div className="marquee-track flex w-max">
        {items.map((q, i) => {
          const isPositive = q.change >= 0;
          return (
            <Link
              key={`${q.ticker}-${i}`}
              to={`/stock/${q.ticker}`}
              className={`inline-flex items-center gap-2 px-4 py-2 text-xs shrink-0 transition-opacity hover:opacity-80 ${
                isHero ? 'text-primary-foreground/90' : 'text-foreground'
              }`}
            >
              <span className="font-bold font-mono">{q.ticker}</span>
              <span className={`font-mono ${isHero ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                {formatCurrency(q.price)}
              </span>
              <span
                className={`inline-flex items-center gap-0.5 font-mono font-semibold ${
                  isPositive ? 'text-gain' : 'text-loss'
                }`}
              >
                {isPositive ? (
                  <ArrowUp className="h-3 w-3" />
                ) : (
                  <ArrowDown className="h-3 w-3" />
                )}
                {formatPercent(q.changePercent)}
              </span>
              {/* Separator dot */}
              <span
                className={`ml-2 h-1 w-1 rounded-full ${
                  isHero ? 'bg-primary-foreground/20' : 'bg-border'
                }`}
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
