import { useMarketOverview } from '@/hooks/useMarketOverview';
import { Gauge, TrendingUp, TrendingDown, Minus } from 'lucide-react';

function getSentimentLabel(score: number): { label: string; color: string; description: string } {
  // VIX levels: <12 = Extreme Complacency, 12-17 = Low Vol, 17-25 = Normal, 25-35 = High Vol, >35 = Extreme Fear
  if (score <= 12) return { label: 'Extreme Complacency', color: 'text-gain', description: 'Historically low volatility. Markets are calm.' };
  if (score <= 17) return { label: 'Low Volatility', color: 'text-[var(--accent-primary)]', description: 'Markets are steady. Investors are confident.' };
  if (score <= 25) return { label: 'Normal', color: 'text-warning', description: 'Typical market conditions. Standard risk levels.' };
  if (score <= 35) return { label: 'Elevated Fear', color: 'text-orange-400', description: 'Heightened uncertainty. Investors hedging positions.' };
  return { label: 'Extreme Fear', color: 'text-loss', description: 'Panic conditions. Heavy demand for protection.' };
}

export function MarketSentiment() {
  const { data: overview, isLoading } = useMarketOverview();
  const vix = overview?.vix;
  const vixValue = vix?.price ?? 0;
  const vixChange = vix?.changePercent ?? 0;
  const { label, color, description } = getSentimentLabel(vixValue);

  // Map VIX (10-50 range) to gauge angle
  const clampedVix = Math.min(50, Math.max(10, vixValue));
  const gaugeAngle = ((clampedVix - 10) / 40) * 180 - 90;

  if (isLoading || !vix) return null;

  return (
    <div className="bg-card rounded-lg border border-border card-elevated p-4">
      <div className="flex items-center gap-2 mb-3">
        <Gauge className="h-4 w-4 text-[var(--accent-primary)]" />
        <span className="text-sm font-semibold font-display text-[var(--text-primary)]">Market Sentiment</span>
        <span className="text-[10px] text-[var(--text-muted)] ml-auto">CBOE Volatility Index (VIX)</span>
      </div>

      <div className="flex items-center gap-6">
        {/* Gauge SVG */}
        <div className="shrink-0 relative w-24 h-14">
          <svg viewBox="0 0 100 55" className="w-full h-full">
            {/* Background arc */}
            <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" strokeLinecap="round"/>
            {/* Color zones — reversed: low VIX = green (left), high VIX = red (right) */}
            <path d="M 10 50 A 40 40 0 0 1 30 19" fill="none" stroke="rgba(34,197,94,0.6)" strokeWidth="8" strokeLinecap="round"/>
            <path d="M 30 19 A 40 40 0 0 1 50 10" fill="none" stroke="rgba(245,158,11,0.6)" strokeWidth="8" strokeLinecap="round"/>
            <path d="M 50 10 A 40 40 0 0 1 70 19" fill="none" stroke="rgba(249,115,22,0.6)" strokeWidth="8" strokeLinecap="round"/>
            <path d="M 70 19 A 40 40 0 0 1 90 50" fill="none" stroke="rgba(239,68,68,0.6)" strokeWidth="8" strokeLinecap="round"/>
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
            {/* VIX value */}
            <text x="50" y="44" textAnchor="middle" fontSize="11" fontWeight="bold" fill="white">{vixValue.toFixed(1)}</text>
          </svg>
        </div>

        <div className="flex-1">
          <div className={`text-lg font-bold font-display ${color}`}>{label}</div>
          <div className="text-xs text-[var(--text-muted)] mt-0.5">{description}</div>
          <div className="flex items-center gap-3 mt-2 text-[11px] text-[var(--text-muted)]">
            <span className="font-mono">VIX: {vixValue.toFixed(2)}</span>
            <span className={`flex items-center gap-1 font-mono ${vixChange > 0 ? 'text-loss' : vixChange < 0 ? 'text-gain' : ''}`}>
              {vixChange > 0 ? <TrendingUp className="h-3 w-3" /> : vixChange < 0 ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
              {vixChange > 0 ? '+' : ''}{vixChange.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
