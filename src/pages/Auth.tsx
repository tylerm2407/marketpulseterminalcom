import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  BarChart3, Mail, Lock, ArrowRight, Loader2, ExternalLink,
  Check, X, Crown, Zap, TrendingUp, Bell, Shield
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

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
  const { user, loading, signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">

      {/* ── Left panel: Branding + plan cards ── */}
      <div className="lg:w-[55%] bg-primary text-primary-foreground flex flex-col justify-center px-8 py-12 lg:py-16 lg:px-14">

        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8">
          <div className="p-2 rounded-lg bg-accent/20">
            <BarChart3 className="h-6 w-6 text-accent" />
          </div>
          <span className="text-2xl font-bold tracking-tight">
            Market<span className="text-accent">Pulse</span>
          </span>
        </div>

        <h1 className="text-3xl lg:text-4xl font-extrabold leading-tight mb-3">
          Smarter investing<br />
          <span className="text-accent">starts here.</span>
        </h1>
        <p className="text-primary-foreground/70 text-base mb-8 max-w-sm">
          AI-powered stock research, real-time alerts, and portfolio tracking — all in one terminal.
        </p>

        {/* Highlight pills */}
        <div className="flex flex-wrap gap-2 mb-10">
          {highlights.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-1.5 bg-primary-foreground/10 rounded-full px-3 py-1.5 text-sm">
              <Icon className="h-3.5 w-3.5 text-accent" />
              <span className="text-primary-foreground/90">{label}</span>
            </div>
          ))}
        </div>

        {/* Plan comparison cards */}
        <div className="grid grid-cols-2 gap-4">

          {/* Free */}
          <div className="rounded-xl border border-primary-foreground/15 bg-primary-foreground/5 p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <Zap className="h-4 w-4 text-primary-foreground/60" />
              <span className="text-sm font-semibold text-primary-foreground/80">Free</span>
            </div>
            <div className="text-2xl font-bold font-mono mb-3">$0<span className="text-xs font-normal text-primary-foreground/50">/mo</span></div>
            <ul className="space-y-1.5">
              {features.map(f => (
                <li key={f.name} className="flex items-start gap-1.5 text-xs">
                  {f.free ? (
                    <Check className="h-3.5 w-3.5 text-accent shrink-0 mt-0.5" />
                  ) : (
                    <X className="h-3.5 w-3.5 text-primary-foreground/25 shrink-0 mt-0.5" />
                  )}
                  <span className={f.free ? 'text-primary-foreground/80' : 'text-primary-foreground/30'}>
                    {f.name}
                    {typeof f.free === 'string' && (
                      <span className="text-primary-foreground/50"> ({f.free})</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pro */}
          <div className="rounded-xl border border-accent/50 bg-accent/10 p-4 relative">
            <Badge className="absolute -top-2.5 left-3 bg-accent text-accent-foreground text-[10px] px-2">
              Most Popular
            </Badge>
            <div className="flex items-center gap-1.5 mb-2">
              <Crown className="h-4 w-4 text-accent" />
              <span className="text-sm font-semibold text-primary-foreground">Pro</span>
            </div>
            <div className="text-2xl font-bold font-mono mb-0.5">
              $19.99<span className="text-xs font-normal text-primary-foreground/50">/mo</span>
            </div>
            <p className="text-[10px] text-accent mb-3">30-day free trial</p>
            <ul className="space-y-1.5">
              {features.map(f => (
                <li key={f.name} className="flex items-start gap-1.5 text-xs">
                  <Check className="h-3.5 w-3.5 text-accent shrink-0 mt-0.5" />
                  <span className="text-primary-foreground/90">
                    {f.name}
                    {typeof f.pro === 'string' && (
                      <span className="text-accent"> ({f.pro})</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="text-xs text-primary-foreground/40 mt-5">
          No credit card required to start. Cancel anytime.
        </p>
      </div>

      {/* ── Right panel: Auth form ── */}
      <div className="lg:w-[45%] flex items-center justify-center px-6 py-12 lg:py-0">
        <div className="w-full max-w-sm">

          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-foreground">
              {isSignUp ? 'Create your free account' : 'Welcome back'}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {isSignUp
                ? 'Start your 30-day Pro trial — no card needed'
                : 'Sign in to access your dashboard'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="pl-10"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="pl-10"
                  required
                  minLength={6}
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                />
              </div>
              {isSignUp && (
                <p className="text-xs text-muted-foreground">Minimum 6 characters</p>
              )}
            </div>

            <Button type="submit" className="w-full gap-2 bg-accent hover:bg-accent/90 text-accent-foreground" disabled={submitting}>
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  {isSignUp ? 'Get Started Free' : 'Sign In'}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="relative my-5">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-xs text-muted-foreground">
              or
            </span>
          </div>

          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={() => {
              window.location.href = 'https://novawealthhqcom.lovable.app/login?redirect_app=marketpulse';
            }}
          >
            <ExternalLink className="h-4 w-4" />
            Continue with Nova Wealth
          </Button>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-accent hover:underline font-medium"
            >
              {isSignUp ? 'Sign In' : 'Sign Up Free'}
            </button>
          </p>

          <p className="mt-4 text-center text-xs text-muted-foreground/60">
            By continuing you agree to our{' '}
            <a href="/privacy" className="hover:underline text-muted-foreground">Privacy Policy</a>.
            This app does not provide investment advice.
          </p>
        </div>
      </div>
    </div>
  );
}
