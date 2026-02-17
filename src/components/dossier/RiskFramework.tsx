import { useState } from 'react';
import type { StockData, RiskItem } from '@/types/stock';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Shield, TrendingDown, Zap, Database, Sparkles, Loader2, ChevronDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { handleAiUsageNotification } from '@/lib/aiUsageNotifications';

const categoryConfig = {
  business: { icon: TrendingDown, label: 'Business' },
  financial: { icon: AlertTriangle, label: 'Financial' },
  market: { icon: Zap, label: 'Market' },
  event: { icon: Shield, label: 'Event' },
  data: { icon: Database, label: 'Data' },
};

const severityConfig = {
  low: { className: 'bg-muted text-muted-foreground', label: 'Low' },
  medium: { className: 'bg-warning/15 text-warning border-warning/30', label: 'Medium' },
  high: { className: 'bg-loss/15 text-loss border-loss/30', label: 'High' },
};

function RiskCard({ risk, stock }: { risk: RiskItem; stock: StockData }) {
  const [expanded, setExpanded] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { icon: Icon, label } = categoryConfig[risk.category];

  const handleToggle = async () => {
    if (expanded) {
      setExpanded(false);
      return;
    }

    setExpanded(true);

    if (explanation) return; // already fetched

    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('risk-explain', {
        body: {
          ticker: stock.ticker,
          companyName: stock.name,
          riskTitle: risk.title,
          riskDescription: risk.description,
          riskCategory: risk.category,
          riskSeverity: risk.severity,
        },
      });

      if (fnError) throw new Error(fnError.message);
      if (data?.error) throw new Error(data.error);
      handleAiUsageNotification(data);
      setExplanation(data.explanation);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load explanation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={cn(
        'rounded-lg bg-muted/30 border border-border transition-colors cursor-pointer',
        expanded && 'bg-muted/50'
      )}
      onClick={handleToggle}
    >
      <div className="flex items-start gap-3 p-3">
        <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">{risk.title}</span>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">{label}</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{risk.description}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
          <span className="text-[10px] text-muted-foreground hidden sm:inline">Explain</span>
          <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
          <ChevronDown className={cn('h-3.5 w-3.5 text-muted-foreground transition-transform duration-200', expanded && 'rotate-180')} />
        </div>
      </div>

      {expanded && (
        <div className="px-3 pb-3 pt-0 ml-7 border-t border-border/50 mt-0">
          <div className="pt-2.5">
            {loading && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Generating explanation…</span>
              </div>
            )}
            {error && (
              <p className="text-xs text-destructive py-2">{error}</p>
            )}
            {explanation && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 mb-1">
                  <Sparkles className="h-3 w-3 text-primary" />
                  <span className="text-[10px] font-medium text-primary">AI Explanation</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">{explanation}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function RiskFramework({ stock }: { stock: StockData }) {
  const grouped = stock.risks.reduce((acc, risk) => {
    if (!acc[risk.severity]) acc[risk.severity] = [];
    acc[risk.severity].push(risk);
    return acc;
  }, {} as Record<string, typeof stock.risks>);

  const orderedSeverities: Array<'high' | 'medium' | 'low'> = ['high', 'medium', 'low'];

  return (
    <div className="space-y-4">
      {orderedSeverities.map(severity => {
        const risks = grouped[severity];
        if (!risks?.length) return null;

        return (
          <div key={severity} className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={severityConfig[severity].className}>
                {severityConfig[severity].label} Risk
              </Badge>
              <span className="text-xs text-muted-foreground">({risks.length})</span>
            </div>
            {risks.map((risk, i) => (
              <RiskCard key={i} risk={risk} stock={stock} />
            ))}
          </div>
        );
      })}
    </div>
  );
}
