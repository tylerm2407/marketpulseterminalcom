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
          <div key={i} className="bg-card rounded-lg border border-border p-3 space-y-2">
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
            className={`bg-card rounded-lg border p-3 transition-colors ${
              isPositive ? 'border-gain/20 hover:border-gain/40' : 'border-loss/20 hover:border-loss/40'
            }`}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">{idx.name}</span>
            </div>
            <div className="font-bold font-mono text-foreground text-lg leading-tight">
              {formatCurrency(idx.price)}
            </div>
            <div className={`flex items-center gap-1 mt-1 text-sm font-mono font-semibold ${isPositive ? 'text-gain' : 'text-loss'}`}>
              {isPositive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
              <span>{formatPercent(idx.changePercent)}</span>
              <span className="text-xs text-muted-foreground font-normal ml-1">
                ({isPositive ? '+' : ''}{idx.change.toFixed(2)})
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
