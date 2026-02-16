import { useLocation, Link } from 'react-router-dom';
import { Home, Eye, Newspaper, CalendarDays } from 'lucide-react';
import { useWatchlistStore } from '@/stores/watchlistStore';

const navItems = [
  { label: 'Home', icon: Home, path: '/' },
  { label: 'Watchlist', icon: Eye, path: '/watchlist' },
  { label: 'News', icon: Newspaper, path: '/news' },
  { label: 'Earnings', icon: CalendarDays, path: '/earnings' },
] as const;

export function MobileBottomNav() {
  const location = useLocation();
  const { tickers } = useWatchlistStore();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-card/95 backdrop-blur-md border-t border-border sm:hidden safe-bottom">
      <div className="flex items-stretch justify-around h-14">
        {navItems.map(({ label, icon: Icon, path }) => {
          const isActive =
            path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(path);

          return (
            <Link
              key={path}
              to={path}
              className={`relative flex flex-col items-center justify-center flex-1 gap-0.5 text-[10px] font-medium transition-colors ${
                isActive
                  ? 'text-accent'
                  : 'text-muted-foreground active:text-foreground'
              }`}
            >
              <div className="relative">
                <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
                {label === 'Watchlist' && tickers.length > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-accent text-accent-foreground text-[9px] font-bold flex items-center justify-center">
                    {tickers.length}
                  </span>
                )}
              </div>
              <span>{label}</span>
              {isActive && (
                <span className="absolute top-0 inset-x-4 h-0.5 rounded-b-full bg-accent" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
