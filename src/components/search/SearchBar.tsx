import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { stocksMap, stocksList } from '@/data/mockStocks';
import { useStockSearch } from '@/hooks/useStockSearch';

export function SearchBar({ variant = 'header' }: { variant?: 'header' | 'hero' }) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('stockdossier-recent');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const navigate = useNavigate();
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Debounce the search query for live API calls
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: liveResults, isLoading: isSearching } = useStockSearch(debouncedQuery);

  // Instant local results for immediate feedback
  const localResults = useMemo(() => {
    if (query.length === 0) return [];
    return stocksList
      .filter(s =>
        s.ticker.toLowerCase().includes(query.toLowerCase()) ||
        s.name.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 3)
      .map(s => ({ ticker: s.ticker, name: s.name, exchange: s.exchange, type: 'stock' }));
  }, [query]);

  // Use live results when available, otherwise local
  const results = liveResults && debouncedQuery === query ? liveResults : localResults;

  const handleSelect = (ticker: string) => {
    setQuery('');
    setDebouncedQuery('');
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
          placeholder="Search any stock by ticker or name..."
          className={isHero
            ? 'pl-11 pr-10 h-14 text-base bg-card text-foreground border-border shadow-lg rounded-xl focus-visible:ring-accent'
            : 'pl-9 pr-8 h-9 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 focus-visible:ring-accent'
          }
        />
        {query ? (
          <button onClick={() => { setQuery(''); setDebouncedQuery(''); }} className="absolute right-3 top-1/2 -translate-y-1/2">
            {isSearching ? (
              <Loader2 className={`h-4 w-4 animate-spin ${isHero ? 'text-muted-foreground' : 'text-primary-foreground/50'}`} />
            ) : (
              <X className={`h-4 w-4 ${isHero ? 'text-muted-foreground' : 'text-primary-foreground/50'}`} />
            )}
          </button>
        ) : null}
      </div>

      {isOpen && (results.length > 0 || (recentSearches.length > 0 && query.length === 0)) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg overflow-hidden z-50">
          {results.length > 0 ? (
            <div className="py-1">
              {results.map(result => (
                <button
                  key={result.ticker}
                  onClick={() => handleSelect(result.ticker)}
                  className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-muted transition-colors text-left"
                >
                  <span className="font-semibold text-sm text-foreground font-mono">{result.ticker}</span>
                  <span className="text-sm text-muted-foreground truncate">{result.name}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{result.exchange}</span>
                </button>
              ))}
              {isSearching && (
                <div className="px-4 py-2 text-xs text-muted-foreground flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" /> Searching more stocks...
                </div>
              )}
            </div>
          ) : recentSearches.length > 0 && query.length === 0 ? (
            <div className="py-1">
              <div className="px-4 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Recent</div>
              {recentSearches.map(ticker => {
                const stock = stocksMap[ticker];
                return (
                  <button
                    key={ticker}
                    onClick={() => handleSelect(ticker)}
                    className="w-full px-4 py-2 flex items-center gap-3 hover:bg-muted transition-colors text-left"
                  >
                    <span className="font-semibold text-sm font-mono">{ticker}</span>
                    <span className="text-sm text-muted-foreground">{stock?.name || ticker}</span>
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
