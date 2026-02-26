import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Mail, Lock, ArrowRight, Loader2, ExternalLink,
  Check, X, Crown, Zap, TrendingUp, Bell, Shield, UserRound, Eye, EyeOff
} from 'lucide-react';
import logoImg from '@/assets/logo.png';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { AmbientOrbs } from '@/components/effects/AmbientOrbs';

const features = [
  { name: 'Stock Dossiers & Charts', free: true, pro: true },
  { name: 'Market Overview & News', free: true, pro: true },
  { name: 'Earnings Calendar', free: true, pro: true },
  { name: 'Watchlist', free: '10 stocks', pro: 'Unlimited' },
  { name: 'Portfolio Tracking', free: false, pro: true },
  { name: 'Price Alerts', free: false, pro: true },
  { name: 'AI Stock Screener', free: false, pro: true },
  { name: 'Social Sentiment (Grok AI)', free: false, pro: true },
  { name: 'Real-time Data', free: 'Delayed', pro: 'Live' },
];

const highlights = [
  { icon: TrendingUp, label: 'AI-powered analysis' },
  { icon: Bell, label: 'Real-time alerts' },
  { icon: Shield, label: 'Bank-grade security' },
];

export default function Auth() {
  const { user, loading, signIn, signUp, signInAsGuest } = useAuth();
  const [isSignUp, setIsSignUp] = useState(true);
  const [guestLoading, setGuestLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (loading) return null;
  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isSignUp) {
        const { error } = await signUp(email, password);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success('Check your email to confirm your account!');
          setIsSignUp(false);
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          toast.error(error.message);
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleGuestSignIn = async () => {
    setGuestLoading(true);
    const { error } = await signInAsGuest();
    if (error) {
      toast.error('Could not start guest session. Please try again.');
    }
    setGuestLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row" style={{ background: 'var(--bg-base)' }}>

      {/* ── Left panel: Branding + plan cards ── */}
      <div className="lg:w-[55%] relative overflow-hidden flex flex-col justify-center px-8 py-12 lg:py-16 lg:px-14" style={{ background: 'var(--bg-surface)' }}>
        <AmbientOrbs />
        <div className="dot-pattern absolute inset-0 opacity-[0.03]" />
        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-8 animate-fade-in-up">
            <img src={logoImg} alt="MarketPulse" className="h-10 w-10 rounded-lg" />
            <span className="text-2xl font-display font-bold tracking-tight text-[var(--text-primary)]">
              Market<span className="gradient-text">Pulse</span>
            </span>
          </div>

          <h1 className="text-3xl lg:text-4xl font-display font-extrabold leading-tight mb-3 text-[var(--text-primary)] animate-fade-in-up" style={{ animationDelay: '100ms', fontSize: 'clamp(1.875rem, 3vw, 2.5rem)' }}>
            Smarter investing<br />
            <span className="gradient-text">starts here.</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-base mb-8 max-w-sm animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            AI-powered stock research, real-time alerts, and portfolio tracking — all in one terminal.
          </p>

          {/* Highlight pills */}
          <div className="flex flex-wrap gap-2 mb-10 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            {highlights.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 bg-[rgba(79,142,247,0.08)] border border-[var(--border-subtle)] rounded-full px-3 py-1.5 text-sm">
                <Icon className="h-3.5 w-3.5 text-[var(--accent-primary)]" />
                <span className="text-[var(--text-secondary)]">{label}</span>
              </div>
            ))}
          </div>

          {/* Plan comparison cards */}
          <div className="grid grid-cols-2 gap-4 animate-fade-in-up" style={{ animationDelay: '400ms' }}>

            {/* Free */}
            <div className="card-elevated p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <Zap className="h-4 w-4 text-[var(--text-muted)]" />
                <span className="text-sm font-semibold text-[var(--text-secondary)]">Free</span>
              </div>
              <div className="text-2xl font-bold font-mono text-[var(--text-primary)] mb-3">$0<span className="text-xs font-normal text-[var(--text-muted)]">/mo</span></div>
              <ul className="space-y-1.5">
                {features.map(f => (
                  <li key={f.name} className="flex items-start gap-1.5 text-xs">
                    {f.free ? (
                      <Check className="h-3.5 w-3.5 text-[var(--accent-success)] shrink-0 mt-0.5" />
                    ) : (
                      <X className="h-3.5 w-3.5 text-[var(--text-muted)] shrink-0 mt-0.5" />
                    )}
                    <span className={f.free ? 'text-[var(--text-secondary)]' : 'text-[var(--text-muted)]'}>
                      {f.name}
                      {typeof f.free === 'string' && (
                        <span className="text-[var(--text-muted)]"> ({f.free})</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pro */}
            <div className="card-elevated p-4 relative border-[var(--border-active)] !border-[rgba(79,142,247,0.35)]">
              <Badge className="absolute -top-2.5 left-3 bg-[var(--accent-primary)] text-white text-[10px] px-2 border-0">
                Most Popular
              </Badge>
              <div className="flex items-center gap-1.5 mb-2">
                <Crown className="h-4 w-4 text-[var(--accent-primary)]" />
                <span className="text-sm font-semibold text-[var(--text-primary)]">Pro</span>
              </div>
              <div className="text-2xl font-bold font-mono text-[var(--text-primary)] mb-0.5">
                $19.99<span className="text-xs font-normal text-[var(--text-muted)]">/mo</span>
              </div>
              <p className="text-[10px] text-[var(--accent-primary)] mb-3">30-day free trial</p>
              <ul className="space-y-1.5">
                {features.map(f => (
                  <li key={f.name} className="flex items-start gap-1.5 text-xs">
                    <Check className="h-3.5 w-3.5 text-[var(--accent-primary)] shrink-0 mt-0.5" />
                    <span className="text-[var(--text-secondary)]">
                      {f.name}
                      {typeof f.pro === 'string' && (
                        <span className="text-[var(--accent-primary)]"> ({f.pro})</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="text-xs text-[var(--text-muted)] mt-5 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
            No credit card required to start. Cancel anytime.
          </p>
        </div>
      </div>

      {/* ── Right panel: Auth form ── */}
      <div className="lg:w-[45%] flex items-center justify-center px-6 py-12 lg:py-0 relative">
        <div className="w-full max-w-sm">

          <div className="mb-8 text-center">
            <h2 className="text-2xl font-display font-bold text-[var(--text-primary)]">
              {isSignUp ? 'Create your free account' : 'Welcome back'}
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              {isSignUp
                ? 'Start your 30-day Pro trial — no card needed'
                : 'Sign in to access your dashboard'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[var(--text-secondary)]">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="pl-10 input-premium"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-[var(--text-secondary)]">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="pl-10 pr-10 input-premium"
                  required
                  minLength={6}
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {isSignUp && (
                <p className="text-xs text-[var(--text-muted)]">Minimum 6 characters</p>
              )}
            </div>

            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2" disabled={submitting}>
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  {isSignUp ? 'Get Started Free' : 'Sign In'}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="relative my-5">
            <div className="section-divider" />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-3 text-xs text-[var(--text-muted)]" style={{ background: 'var(--bg-base)' }}>
              or
            </span>
          </div>

          <button
            className="btn-ghost w-full flex items-center justify-center gap-2 !py-2.5"
            onClick={() => {
              window.location.href = 'https://novawealthhqcom.lovable.app/login?redirect_app=marketpulse';
            }}
          >
            <ExternalLink className="h-4 w-4" />
            Continue with Nova Wealth
          </button>

          <button
            className="w-full flex items-center justify-center gap-2 mt-2 py-2.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors text-sm rounded-lg"
            onClick={handleGuestSignIn}
            disabled={guestLoading}
          >
            {guestLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <UserRound className="h-4 w-4" />
            )}
            Continue as Guest
          </button>
          <p className="text-center text-[11px] text-[var(--text-muted)] -mt-1">
            No account needed · Free features only · Data not saved
          </p>

          <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-[var(--accent-primary)] hover:underline font-medium"
            >
              {isSignUp ? 'Sign In' : 'Sign Up Free'}
            </button>
          </p>

          <p className="mt-4 text-center text-xs text-[var(--text-muted)]">
            By continuing you agree to our{' '}
            <a href="/privacy" className="hover:underline text-[var(--text-secondary)]">Privacy Policy</a>.
            This app does not provide investment advice.
          </p>
        </div>
      </div>
    </div>
  );
}
