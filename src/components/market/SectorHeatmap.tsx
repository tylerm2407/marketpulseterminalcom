import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import type { SectorData } from '@/hooks/useMarketOverview';

interface SectorHeatmapProps {
  sectors: SectorData[] | undefined;
  isLoading: boolean;
}

function getHeatColor(pct: number): string {
  if (pct >= 2) return 'bg-[rgba(34,197,94,0.35)] text-[var(--text-primary)]';
  if (pct >= 1) return 'bg-[rgba(34,197,94,0.22)] text-[var(--text-primary)]';
  if (pct >= 0.25) return 'bg-[rgba(34,197,94,0.12)] text-[var(--text-primary)]';
  if (pct >= -0.25) return 'bg-[var(--bg-elevated)] text-[var(--text-primary)]';
  if (pct >= -1) return 'bg-[rgba(239,68,68,0.12)] text-[var(--text-primary)]';
  if (pct >= -2) return 'bg-[rgba(239,68,68,0.22)] text-[var(--text-primary)]';
  return 'bg-[rgba(239,68,68,0.35)] text-[var(--text-primary)]';
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
          <Link
            key={sector.ticker}
            to={`/sector/${sector.ticker}`}
            className={`rounded-lg p-3 transition-transform hover:scale-[1.02] cursor-pointer border border-[var(--border-subtle)] ${getHeatColor(sector.changePercent)}`}
          >
            <div className="text-xs font-medium truncate text-[var(--text-secondary)]">{sector.name}</div>
            <div className={`text-lg font-bold font-mono leading-tight mt-0.5 ${isPositive ? 'text-[var(--accent-success)]' : 'text-[var(--accent-danger)]'}`}>
              {isPositive ? '+' : ''}{sector.changePercent.toFixed(2)}%
            </div>
            <div className="text-[10px] font-mono text-[var(--text-muted)] mt-0.5">{sector.ticker}</div>
          </Link>
        );
      })}
    </div>
  );
}
