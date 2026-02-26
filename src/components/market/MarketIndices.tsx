import { ArrowUp, ArrowDown, TrendingUp } from 'lucide-react';
import { formatCurrency, formatPercent } from '@/lib/formatters';
import { Skeleton } from '@/components/ui/skeleton';
import type { IndexData } from '@/hooks/useMarketOverview';

interface MarketIndicesProps {
  indices: IndexData[] | undefined;
  isLoading: boolean;
}

export function MarketIndices({ indices, isLoading }: MarketIndicesProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card-elevated p-3 space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (!indices?.length) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {indices.map((idx) => {
        const isPositive = idx.change >= 0;
        return (
          <div
            key={idx.ticker}
            className="card-elevated p-3 transition-colors"
          >
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp className="h-3.5 w-3.5 text-[var(--text-muted)]" />
              <span className="text-xs font-medium text-[var(--text-secondary)]">{idx.name}</span>
            </div>
            <div className="font-bold font-mono text-[var(--text-primary)] text-lg leading-tight">
              {formatCurrency(idx.price)}
            </div>
            <div className={`flex items-center gap-1 mt-1 text-sm font-mono font-semibold ${isPositive ? 'text-[var(--accent-success)]' : 'text-[var(--accent-danger)]'}`}>
              {isPositive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
              <span>{formatPercent(idx.changePercent)}</span>
              <span className="text-xs text-[var(--text-muted)] font-normal ml-1">
                ({isPositive ? '+' : ''}{idx.change.toFixed(2)})
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
