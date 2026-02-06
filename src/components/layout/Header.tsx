import { Link, useLocation } from 'react-router-dom';
import { BarChart3, Eye, Home, Newspaper } from 'lucide-react';
import { SearchBar } from '@/components/search/SearchBar';
import { useWatchlistStore } from '@/stores/watchlistStore';
import { Badge } from '@/components/ui/badge';

const navLinks = [
  { label: 'Home', path: '/', icon: Home },
  { label: 'Watchlist', path: '/watchlist', icon: Eye },
  { label: 'News', path: '/news', icon: Newspaper },
] as const;

export function Header() {
  const { tickers } = useWatchlistStore();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 hero-gradient text-primary-foreground border-b border-primary-foreground/10">
      <div className="container mx-auto px-4 h-14 flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg shrink-0 tracking-tight">
          <BarChart3 className="h-5 w-5 text-accent" />
          <span className="hidden sm:inline">Stock<span className="text-accent">Dossier</span></span>
        </Link>
        <div className="flex-1 max-w-lg mx-auto hidden md:block">
          <SearchBar variant="header" />
        </div>
        <nav className="flex items-center gap-1 sm:gap-3 shrink-0">
          {navLinks.map(({ label, path, icon: Icon }) => {
            const isActive = path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-1.5 text-sm font-medium px-2.5 py-1.5 rounded-md transition-all ${
                  isActive
                    ? 'bg-primary-foreground/15 text-primary-foreground'
                    : 'text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
                {label === 'Watchlist' && tickers.length > 0 && (
                  <Badge variant="secondary" className="h-5 min-w-5 px-1.5 text-xs bg-accent text-accent-foreground">
                    {tickers.length}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
