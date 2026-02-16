import { formatPercent } from '@/lib/formatters';
import { Skeleton } from '@/components/ui/skeleton';
import type { SectorData } from '@/hooks/useMarketOverview';

interface SectorHeatmapProps {
  sectors: SectorData[] | undefined;
  isLoading: boolean;
}

function getHeatColor(pct: number): string {
  if (pct >= 2) return 'bg-gain/90 text-gain-foreground';
  if (pct >= 1) return 'bg-gain/60 text-foreground';
  if (pct >= 0.25) return 'bg-gain/30 text-foreground';
  if (pct >= -0.25) return 'bg-muted text-foreground';
  if (pct >= -1) return 'bg-loss/30 text-foreground';
  if (pct >= -2) return 'bg-loss/60 text-foreground';
  return 'bg-loss/90 text-loss-foreground';
}

export function SectorHeatmap({ sectors, isLoading }: SectorHeatmapProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {Array.from({ length: 11 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
    );
  }

  if (!sectors?.length) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
      {sectors.map((sector) => {
        const isPositive = sector.changePercent >= 0;
        return (
          <div
            key={sector.ticker}
            className={`rounded-lg p-3 transition-transform hover:scale-[1.02] cursor-default ${getHeatColor(sector.changePercent)}`}
          >
            <div className="text-xs font-medium truncate opacity-80">{sector.name}</div>
            <div className="text-lg font-bold font-mono leading-tight mt-0.5">
              {isPositive ? '+' : ''}{sector.changePercent.toFixed(2)}%
            </div>
            <div className="text-[10px] font-mono opacity-60 mt-0.5">{sector.ticker}</div>
          </div>
        );
      })}
    </div>
  );
}
