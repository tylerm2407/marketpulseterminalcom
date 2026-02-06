import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { stocksMap, stocksList } from '@/data/mockStocks';

export function SearchBar({ variant = 'header' }: { variant?: 'header' | 'hero' }) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('stockdossier-recent');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const navigate = useNavigate();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const results = query.length > 0
    ? stocksList.filter(s =>
        s.ticker.toLowerCase().includes(query.toLowerCase()) ||
        s.name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 6)
    : [];

  const handleSelect = (ticker: string) => {
    setQuery('');
    setIsOpen(false);
    const updated = [ticker, ...recentSearches.filter(t => t !== ticker)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('stockdossier-recent', JSON.stringify(updated));
    navigate(`/stock/${ticker}`);
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const isHero = variant === 'hero';

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${isHero ? 'h-5 w-5 text-muted-foreground' : 'h-4 w-4 text-primary-foreground/50'}`} />
        <Input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(e) => { if (e.key === 'Enter' && results.length > 0) handleSelect(results[0].ticker); }}
          placeholder="Search by ticker or company name..."
          className={isHero
            ? 'pl-11 pr-10 h-14 text-base bg-card border-border shadow-lg rounded-xl focus-visible:ring-accent'
            : 'pl-9 pr-8 h-9 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 focus-visible:ring-accent'
          }
        />
        {query && (
          <button onClick={() => { setQuery(''); }} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className={`h-4 w-4 ${isHero ? 'text-muted-foreground' : 'text-primary-foreground/50'}`} />
          </button>
        )}
      </div>

      {isOpen && (results.length > 0 || (recentSearches.length > 0 && query.length === 0)) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg overflow-hidden z-50">
          {results.length > 0 ? (
            <div className="py-1">
              {results.map(stock => (
                <button
                  key={stock.ticker}
                  onClick={() => handleSelect(stock.ticker)}
                  className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-muted transition-colors text-left"
                >
                  <span className="font-semibold text-sm text-foreground font-mono">{stock.ticker}</span>
                  <span className="text-sm text-muted-foreground truncate">{stock.name}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{stock.exchange}</span>
                </button>
              ))}
            </div>
          ) : recentSearches.length > 0 && query.length === 0 ? (
            <div className="py-1">
              <div className="px-4 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Recent</div>
              {recentSearches.map(ticker => {
                const stock = stocksMap[ticker];
                if (!stock) return null;
                return (
                  <button
                    key={ticker}
                    onClick={() => handleSelect(ticker)}
                    className="w-full px-4 py-2 flex items-center gap-3 hover:bg-muted transition-colors text-left"
                  >
                    <span className="font-semibold text-sm font-mono">{ticker}</span>
                    <span className="text-sm text-muted-foreground">{stock.name}</span>
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
