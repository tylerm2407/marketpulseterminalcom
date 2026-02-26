import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Eye, Wallet, Bell, UserRound } from 'lucide-react';
import { useWatchlistStore } from '@/stores/watchlistStore';
import { useAuth } from '@/hooks/useAuth';

const navItems = [
  { label: 'Home', icon: Home, path: '/' },
  { label: 'Watchlist', icon: Eye, path: '/watchlist' },
  { label: 'Portfolio', icon: Wallet, path: '/portfolio' },
  { label: 'Alerts', icon: Bell, path: '/alerts' },
  { label: 'Profile', icon: UserRound, path: '/profile' },
] as const;

export function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { tickers } = useWatchlistStore();
  const { signOut } = useAuth();

  const handleNav = async (path: string) => {
    if (path === '/profile') {
      await signOut();
      navigate('/auth');
      return;
    }
    navigate(path);
  };

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 glass border-t border-[rgba(34,197,94,0.1)] sm:hidden safe-bottom">
      <div className="flex items-stretch justify-around h-14">
        {navItems.map(({ label, icon: Icon, path }) => {
          const isActive = path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
          return (
            <button
              key={path}
              onClick={() => handleNav(path)}
              className={`relative flex flex-col items-center justify-center flex-1 gap-0.5 text-[10px] font-medium transition-colors ${
                isActive ? 'text-[var(--accent-primary)]' : 'text-[var(--text-muted)] active:text-[var(--text-primary)]'
              } ${label === 'Profile' ? '!text-[var(--accent-danger)]' : ''}`}
            >
              <div className="relative">
                <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
                {label === 'Watchlist' && tickers.length > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-[var(--accent-primary)] text-white text-[9px] font-bold flex items-center justify-center">
                    {tickers.length}
                  </span>
                )}
              </div>
              <span>{label === 'Profile' ? 'Sign Out' : label}</span>
              {isActive && label !== 'Profile' && (
                <span className="absolute top-0 inset-x-4 h-0.5 rounded-b-full" style={{ background: 'var(--accent-primary)', boxShadow: '0 0 8px rgba(34,197,94,0.5)' }} />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
