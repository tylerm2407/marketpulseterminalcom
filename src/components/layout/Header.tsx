import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, Home, Newspaper, GitCompareArrows, Sparkles, Search, X, Wallet, Bell, LogIn, LogOut, UserRound, Menu } from 'lucide-react';
import logoImg from '@/assets/logo.png';
import { SearchBar } from '@/components/search/SearchBar';
import { useWatchlistStore } from '@/stores/watchlistStore';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const navLinks = [
  { label: 'Home', path: '/', icon: Home },
  { label: 'Watchlist', path: '/watchlist', icon: Eye },
  { label: 'Portfolio', path: '/portfolio', icon: Wallet },
  { label: 'Alerts', path: '/alerts', icon: Bell },
  { label: 'News', path: '/news', icon: Newspaper },
  { label: 'Compare', path: '/compare', icon: GitCompareArrows },
  { label: 'Screener', path: '/screener', icon: Sparkles },
] as const;

export function Header() {
  const { tickers } = useWatchlistStore();
  const location = useLocation();
  const { user, signOut, isGuest } = useAuth();
  const navigate = useNavigate();
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-[rgba(79,142,247,0.1)]">
      <div className="container mx-auto px-4 md:px-5 h-14 flex items-center gap-3">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-display font-bold text-lg shrink-0 tracking-tight">
          <img src={logoImg} alt="MarketPulse" className="h-8 w-8 rounded" />
          <span className="text-[var(--text-primary)]">Market<span className="gradient-text">Pulse</span></span>
        </Link>

        {/* Search bar — desktop only */}
        <div className="flex-1 max-w-lg mx-auto hidden md:block">
          <SearchBar variant="header" />
        </div>

        {/* Spacer on mobile to push actions to right */}
        <div className="flex-1 md:hidden" />

        {/* Right actions */}
        <nav className="flex items-center gap-1 shrink-0">

          {/* Mobile search toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileSearchOpen(prev => !prev)}
            className="h-9 w-9 text-[var(--text-secondary)] hover:text-[var(--accent-primary)] hover:bg-[rgba(79,142,247,0.08)] md:hidden"
          >
            {mobileSearchOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
            <span className="sr-only">Toggle search</span>
          </Button>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-0.5">
            {navLinks.map(({ label, path, icon: Icon }) => {
              const isActive = path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
              return (
                <Link
                  key={path}
                  to={path}
                  className={`nav-link-glow flex items-center gap-1.5 text-sm font-medium px-2.5 py-1.5 rounded-md transition-all ${
                    isActive
                      ? 'text-[var(--accent-primary)] active'
                      : 'text-[var(--text-secondary)] hover:text-[var(--accent-primary)]'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                  {label === 'Watchlist' && tickers.length > 0 && (
                    <Badge variant="secondary" className="h-5 min-w-5 px-1.5 text-xs bg-[var(--accent-primary)] text-white">
                      {tickers.length}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Profile / Auth */}
          {user ? (
            isGuest ? (
              <div className="flex items-center gap-1.5">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1 text-xs text-[var(--text-muted)] px-2">
                      <UserRound className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Guest</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Browsing as guest — data not saved</TooltipContent>
                </Tooltip>
                <Link
                  to="/auth"
                  className="btn-primary flex items-center gap-1.5 text-sm !py-1.5 !px-4"
                >
                  <LogIn className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign Up Free</span>
                </Link>
              </div>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-[var(--text-secondary)] hover:text-[var(--accent-primary)] hover:bg-[rgba(79,142,247,0.08)]"
                  >
                    <UserRound className="h-4 w-4" />
                    <span className="sr-only">Profile</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44 bg-[var(--bg-elevated)] border-[var(--border-subtle)]">
                  <div className="px-2 py-1.5 text-xs text-[var(--text-muted)] truncate">
                    {user.email}
                  </div>
                  <DropdownMenuItem onClick={handleSignOut} className="gap-2 text-[var(--accent-danger)] focus:text-[var(--accent-danger)] cursor-pointer">
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )
          ) : (
            <Link
              to="/auth"
              className="btn-primary flex items-center gap-1.5 text-sm !py-1.5 !px-4"
            >
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline">Sign In</span>
            </Link>
          )}
        </nav>
      </div>

      {/* Mobile search dropdown */}
      {mobileSearchOpen && (
        <div className="md:hidden px-4 pb-3 animate-fade-in">
          <SearchBar variant="header" />
        </div>
      )}
    </header>
  );
}
