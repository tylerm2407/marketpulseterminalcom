import type { StockData } from '@/types/stock';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';

const categoryLabels: Record<string, string> = {
  earnings: 'Earnings',
  products: 'Products',
  legal: 'Legal',
  mna: 'M&A',
  macro: 'Macro',
  general: 'General',
};

const sentimentColors: Record<string, string> = {
  positive: 'bg-gain/15 text-gain border-gain/30',
  neutral: 'bg-muted text-muted-foreground',
  negative: 'bg-loss/15 text-loss border-loss/30',
};

export function NewsSentiment({ stock }: { stock: StockData }) {
  return (
    <div className="space-y-3">
      {stock.news.map((item, i) => (
        <div key={i} className="flex gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors group border border-transparent hover:border-border">
          <div className="text-xs text-muted-foreground whitespace-nowrap pt-0.5 w-20 shrink-0 font-mono">
            {item.date}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2">
              <h4 className="text-sm font-medium text-foreground leading-snug">{item.title}</h4>
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
              </a>
            </div>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.summary}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">{categoryLabels[item.category]}</Badge>
              <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${sentimentColors[item.sentiment]}`}>
                {item.sentiment}
              </Badge>
              <span className="text-[10px] text-muted-foreground">{item.source}</span>
            </div>
          </div>
        </div>
      ))}
      <p className="text-xs text-muted-foreground italic mt-2">
        Sentiment reflects aggregated tone of coverage, not a recommendation.
      </p>
    </div>
  );
}
