import { ExternalLink } from 'lucide-react';

interface SourceAttributionProps {
  source?: string;
  url?: string;
  className?: string;
}

const SOURCE_URLS: Record<string, string> = {
  'Polygon.io': 'https://polygon.io',
  'SEC Filings': 'https://www.sec.gov/cgi-bin/browse-edgar',
  'Company Reports': '#',
};

export function SourceAttribution({ source = 'Polygon.io', url, className = '' }: SourceAttributionProps) {
  const href = url || SOURCE_URLS[source] || '#';

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1 text-[10px] text-muted-foreground/60 hover:text-muted-foreground transition-colors ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      <span>via {source}</span>
      <ExternalLink className="h-2.5 w-2.5" />
    </a>
  );
}
