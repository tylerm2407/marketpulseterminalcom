import { useMarketOverview } from '@/hooks/useMarketOverview';
import { Gauge, TrendingUp, TrendingDown, Minus } from 'lucide-react';

function computeSentimentScore(overview: any): number {
  if (!overview) return 50;
  const indices = overview.indices ?? [];
  const sectors = overview.sectors ?? [];

  // Score 0-100 based on:
  // 1. Average index performance (40% weight)
  const avgIndexChange = indices.length > 0
    ? indices.reduce((s: number, idx: any) => s + (idx.changePercent ?? 0), 0) / indices.length
    : 0;
  const indexScore = Math.min(100, Math.max(0, 50 + avgIndexChange * 8));

  // 2. Sector breadth — how many sectors are positive (40% weight)
  const positiveSectors = sectors.filter((s: any) => (s.changePercent ?? 0) > 0).length;
  const breadthScore = sectors.length > 0 ? (positiveSectors / sectors.length) * 100 : 50;

  // 3. Random market noise factor for realism (20% weight)
  const composite = indexScore * 0.6 + breadthScore * 0.4;
  return Math.round(Math.min(99, Math.max(1, composite)));
}

function getSentimentLabel(score: number): { label: string; color: string; description: string } {
  if (score >= 75) return { label: 'Extreme Greed', color: 'text-gain', description: 'Markets surging. Investors are very optimistic.' };
  if (score >= 60) return { label: 'Greed', color: 'text-[var(--accent-primary)]', description: 'Positive momentum across most sectors.' };
  if (score >= 45) return { label: 'Neutral', color: 'text-warning', description: 'Markets are balanced. Mixed signals.' };
  if (score >= 30) return { label: 'Fear', color: 'text-orange-400', description: 'Investors are cautious. Selling pressure building.' };
  return { label: 'Extreme Fear', color: 'text-loss', description: 'Heavy selling across markets. Panic conditions.' };
}

export function MarketSentiment() {
  const { data: overview, isLoading } = useMarketOverview();
  const score = computeSentimentScore(overview);
  const { label, color, description } = getSentimentLabel(score);
  const sectors = overview?.sectors ?? [];
  const positiveCount = sectors.filter((s: any) => (s.changePercent ?? 0) > 0).length;

  const gaugeAngle = (score / 100) * 180 - 90; // -90° (far left) to +90° (far right)

  if (isLoading) return null;

  return (
    <div className="bg-card rounded-lg border border-border card-elevated p-4">
      <div className="flex items-center gap-2 mb-3">
        <Gauge className="h-4 w-4 text-[var(--accent-primary)]" />
        <span className="text-sm font-semibold font-display text-[var(--text-primary)]">Market Sentiment</span>
        <span className="text-[10px] text-[var(--text-muted)] ml-auto">Based on sector breadth & index performance</span>
      </div>

      <div className="flex items-center gap-6">
        {/* Gauge SVG */}
        <div className="shrink-0 relative w-24 h-14">
          <svg viewBox="0 0 100 55" className="w-full h-full">
            {/* Background arc */}
            <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" strokeLinecap="round"/>
            {/* Color zones */}
            <path d="M 10 50 A 40 40 0 0 1 30 19" fill="none" stroke="rgba(239,68,68,0.6)" strokeWidth="8" strokeLinecap="round"/>
            <path d="M 30 19 A 40 40 0 0 1 50 10" fill="none" stroke="rgba(249,115,22,0.6)" strokeWidth="8" strokeLinecap="round"/>
            <path d="M 50 10 A 40 40 0 0 1 70 19" fill="none" stroke="rgba(245,158,11,0.6)" strokeWidth="8" strokeLinecap="round"/>
            <path d="M 70 19 A 40 40 0 0 1 90 50" fill="none" stroke="rgba(34,197,94,0.6)" strokeWidth="8" strokeLinecap="round"/>
            {/* Needle */}
            <line
              x1="50" y1="50"
              x2={50 + 32 * Math.cos(((gaugeAngle - 90) * Math.PI) / 180)}
              y2={50 + 32 * Math.sin(((gaugeAngle - 90) * Math.PI) / 180)}
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx="50" cy="50" r="3.5" fill="white"/>
            {/* Score text */}
            <text x="50" y="44" textAnchor="middle" fontSize="11" fontWeight="bold" fill="white">{score}</text>
          </svg>
        </div>

        <div className="flex-1">
          <div className={`text-lg font-bold font-display ${color}`}>{label}</div>
          <div className="text-xs text-[var(--text-muted)] mt-0.5">{description}</div>
          <div className="flex items-center gap-3 mt-2 text-[11px] text-[var(--text-muted)]">
            <span>{positiveCount}/{sectors.length} sectors positive</span>
            <span className="flex items-center gap-1">
              {score > 50 ? <TrendingUp className="h-3 w-3 text-gain" /> : score < 50 ? <TrendingDown className="h-3 w-3 text-loss" /> : <Minus className="h-3 w-3" />}
              Score: {score}/100
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
