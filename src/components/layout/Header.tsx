import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart3, Eye, Home, Newspaper, GitCompareArrows, Sparkles, Sun, Moon, Search, X, Wallet, Bell, LogIn, LogOut } from 'lucide-react';
import { SearchBar } from '@/components/search/SearchBar';
import { useWatchlistStore } from '@/stores/watchlistStore';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const navLinks = [
  { label: 'Home', path: '/', icon: Home },
  { label: 'Watchlist', path: '/watchlist', icon: Eye },
  { label: 'Portfolio', path: '/portfolio', icon: Wallet },
  { label: 'Alerts', path: '/alerts', icon: Bell },
  { label: 'News', path: '/news', icon: Newspaper },
  { label: 'Compare', path: '/compare', icon: GitCompareArrows },
  { label: 'Screener', path: '/screener', icon: Sparkles },
  { label: 'Pricing', path: '/pricing', icon: BarChart3 },
] as const;

export function Header() {
  const { tickers } = useWatchlistStore();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 hero-gradient text-primary-foreground border-b border-primary-foreground/10">
      <div className="container mx-auto px-4 h-14 flex items-center gap-3">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-lg shrink-0 tracking-tight">
          <BarChart3 className="h-5 w-5 text-accent" />
          <span>Market<span className="text-accent">Pulse</span></span>
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
            className="h-9 w-9 text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10 md:hidden"
          >
            {mobileSearchOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
            <span className="sr-only">Toggle search</span>
          </Button>

          {/* Desktop nav links — hidden on mobile (bottom nav handles mobile) */}
          <div className="hidden md:flex items-center gap-1">
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
                  <span>{label}</span>
                  {label === 'Watchlist' && tickers.length > 0 && (
                    <Badge variant="secondary" className="h-5 min-w-5 px-1.5 text-xs bg-accent text-accent-foreground">
                      {tickers.length}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Theme toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="h-9 w-9 text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                <span className="sr-only">Toggle theme</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {theme === 'dark' ? 'Light mode' : 'Dark mode'}
            </TooltipContent>
          </Tooltip>

          {/* Auth */}
          {user ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => signOut()}
                  className="h-9 w-9 text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="sr-only">Sign out</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Sign out</TooltipContent>
            </Tooltip>
          ) : (
            <Link
              to="/auth"
              className="flex items-center gap-1.5 text-sm font-medium px-2.5 py-1.5 rounded-md text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10 transition-all"
            >
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline">Sign In</span>
            </Link>
          )}
        </nav>
      </div>

      {/* Mobile search dropdown */}
      {mobileSearchOpen && (
        <div className="md:hidden px-4 pb-3">
          <SearchBar variant="header" />
        </div>
      )}
    </header>
  );
}
