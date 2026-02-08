import type { StockData } from '@/types/stock';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Shield, TrendingDown, Zap, Database } from 'lucide-react';

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
            {risks.map((risk, i) => {
              const { icon: Icon, label } = categoryConfig[risk.category];
              return (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border active:bg-muted/50 transition-colors">
                  <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{risk.title}</span>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">{label}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{risk.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
