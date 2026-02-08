import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { searchStockDirectory } from '@/data/stockDirectory';
import { getStockByTicker } from '@/data/stockDirectory';
import { useStockSearch } from '@/hooks/useStockSearch';

export function SearchBar({ variant = 'header' }: { variant?: 'header' | 'hero' }) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
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

  // Instant local results for immediate feedback (no debounce delay)
  const localResults = useMemo(() => {
    if (query.length === 0) return [];
    return searchStockDirectory(query, 8).map(s => ({
      ticker: s.t,
      name: s.n,
      exchange: s.e,
      sector: s.s,
      type: 'stock',
    }));
  }, [query]);

  // Use live results when available and matching current query, otherwise instant local
  const results = liveResults && liveResults.length > 0 && debouncedQuery === query
    ? liveResults.map(r => ({ ...r, sector: undefined }))
    : localResults;

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results.length, query]);

  const handleSelect = (ticker: string) => {
    setQuery('');
    setDebouncedQuery('');
    setIsOpen(false);
    const updated = [ticker, ...recentSearches.filter(t => t !== ticker)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('stockdossier-recent', JSON.stringify(updated));
    navigate(`/stock/${ticker}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results.length > 0) {
      e.preventDefault();
      handleSelect(results[selectedIndex]?.ticker || results[0]?.ticker);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
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
          onKeyDown={handleKeyDown}
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
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg overflow-hidden z-50 max-h-[400px] overflow-y-auto">
          {results.length > 0 ? (
            <div className="py-1">
              {results.map((result, index) => (
                <button
                  key={result.ticker}
                  onClick={() => handleSelect(result.ticker)}
                  className={`w-full px-4 py-2.5 flex items-center gap-3 transition-colors text-left ${
                    index === selectedIndex ? 'bg-muted' : 'hover:bg-muted'
                  }`}
                >
                  <span className="font-semibold text-sm text-foreground font-mono min-w-[60px]">{result.ticker}</span>
                  <span className="text-sm text-muted-foreground truncate flex-1">{result.name}</span>
                  {'sector' in result && result.sector && (
                    <Badge variant="outline" className="text-[10px] shrink-0 hidden sm:inline-flex">{result.sector}</Badge>
                  )}
                  <span className="text-xs text-muted-foreground shrink-0">{result.exchange}</span>
                </button>
              ))}
              {isSearching && (
                <div className="px-4 py-2 text-xs text-muted-foreground flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" /> Searching more stocks...
                </div>
              )}
              {query.length >= 1 && !isSearching && results.length > 0 && (
                <div className="px-4 py-2 text-[10px] text-muted-foreground/60 border-t border-border">
                  Can't find what you're looking for? Try the full ticker symbol (e.g. AAPL, MSFT)
                </div>
              )}
            </div>
          ) : recentSearches.length > 0 && query.length === 0 ? (
            <div className="py-1">
              <div className="px-4 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Recent</div>
              {recentSearches.map(ticker => {
                const stock = getStockByTicker(ticker);
                return (
                  <button
                    key={ticker}
                    onClick={() => handleSelect(ticker)}
                    className="w-full px-4 py-2 flex items-center gap-3 hover:bg-muted transition-colors text-left"
                  >
                    <span className="font-semibold text-sm font-mono">{ticker}</span>
                    <span className="text-sm text-muted-foreground">{stock?.n || ticker}</span>
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
