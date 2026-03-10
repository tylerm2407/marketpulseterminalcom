import { SectorHeatmap } from "@/components/market/SectorHeatmap";

const HeatMap = () => {
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Market Heat Map</h1>
      <SectorHeatmap />
    </div>
  );
};

export default HeatMap;
