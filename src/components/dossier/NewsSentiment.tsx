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
        <a
          key={i}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block p-3 sm:p-3 rounded-lg hover:bg-muted/50 active:bg-muted/70 transition-colors group border border-transparent hover:border-border touch-manipulation"
        >
          <div className="flex flex-col sm:flex-row sm:gap-4">
            <div className="flex items-center gap-2 sm:block sm:w-20 sm:shrink-0 mb-1 sm:mb-0">
              <span className="text-[10px] sm:text-xs text-muted-foreground font-mono">{item.date}</span>
              <span className="text-[10px] text-muted-foreground sm:hidden">·</span>
              <span className="text-[10px] text-muted-foreground sm:hidden">{item.source}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2">
                <h4 className="text-sm font-medium text-foreground leading-snug">{item.title}</h4>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5 opacity-50 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">{item.summary}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">{categoryLabels[item.category]}</Badge>
                <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${sentimentColors[item.sentiment]}`}>
                  {item.sentiment}
                </Badge>
                <span className="text-[10px] text-muted-foreground hidden sm:inline">{item.source}</span>
              </div>
            </div>
          </div>
        </a>
      ))}
      <p className="text-xs text-muted-foreground italic mt-2">
        Sentiment reflects aggregated tone of coverage, not a recommendation.
      </p>
    </div>
  );
}
