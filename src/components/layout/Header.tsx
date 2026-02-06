import { Link } from 'react-router-dom';
import { BarChart3, Eye } from 'lucide-react';
import { SearchBar } from '@/components/search/SearchBar';
import { useWatchlistStore } from '@/stores/watchlistStore';
import { Badge } from '@/components/ui/badge';

export function Header() {
  const { tickers } = useWatchlistStore();

  return (
    <header className="sticky top-0 z-50 hero-gradient text-primary-foreground border-b border-primary-foreground/10">
      <div className="container mx-auto px-4 h-14 flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg shrink-0 tracking-tight">
          <BarChart3 className="h-5 w-5 text-accent" />
          <span>Stock<span className="text-accent">Dossier</span></span>
        </Link>
        <div className="flex-1 max-w-lg mx-auto hidden sm:block">
          <SearchBar variant="header" />
        </div>
        <nav className="flex items-center gap-4 shrink-0">
          <Link
            to="/watchlist"
            className="flex items-center gap-1.5 text-sm font-medium opacity-90 hover:opacity-100 transition-opacity"
          >
            <Eye className="h-4 w-4" />
            <span className="hidden md:inline">Watchlist</span>
            {tickers.length > 0 && (
              <Badge variant="secondary" className="h-5 min-w-5 px-1.5 text-xs bg-accent text-accent-foreground">
                {tickers.length}
              </Badge>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
