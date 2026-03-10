import { useMarketOverview } from '@/hooks/useMarketOverview';
import { SectorHeatmap } from '@/components/market/SectorHeatmap';
import { DataFreshness } from '@/components/DataFreshness';
import { ErrorState } from '@/components/ErrorState';

const HeatMap = () => {
  const { data, isLoading, isError, refetch } = useMarketOverview();

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Market Heat Map</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Sector performance at a glance
          </p>
        </div>
        <DataFreshness updatedAt={data?.timestamp} />
      </div>

      {isError && !data ? (
        <ErrorState
          title="Could not load sector data"
          message="Market data is temporarily unavailable."
          onRetry={() => refetch()}
        />
      ) : (
        <SectorHeatmap sectors={data?.sectors} isLoading={isLoading} />
      )}
    </div>
  );
};

export default HeatMap;
