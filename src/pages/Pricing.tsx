import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check, X, Crown, Zap, Loader2, ExternalLink, Sparkles, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ReferralDashboard } from '@/components/ReferralDashboard';
import { clearStoredReferralCode, getStoredReferralCode } from '@/hooks/useReferralDetection';

const features = [
  { name: 'Stock Dossiers & Charts', free: true, pro: true, bundle: true },
  { name: 'Market Overview & News', free: true, pro: true, bundle: true },
  { name: 'Earnings Calendar', free: true, pro: true, bundle: true },
  { name: 'Stock Comparison', free: true, pro: true, bundle: true },
  { name: 'Watchlist', free: '10 stocks', pro: 'Unlimited', bundle: 'Unlimited' },
  { name: 'Portfolio Tracking', free: false, pro: true, bundle: true },
  { name: 'Price Alerts', free: false, pro: true, bundle: true },
  { name: 'AI Stock Screener', free: false, pro: true, bundle: true },
  { name: 'Social Sentiment (Grok AI)', free: false, pro: true, bundle: true },
  { name: 'Real-time Data', free: 'Delayed', pro: 'Live', bundle: 'Live' },
];

const bundleExtras = [
  'Everything in Pro',
  'Access to all Nova apps',
  'Unified subscription',
  'Cross-app insights',
];

const MONTHLY_PRO = 19.99;
const YEARLY_PRO = 119.88;
const MONTHLY_BUNDLE = 29.99;
const YEARLY_BUNDLE = 179.88;

const REFERRAL_DISCOUNT_PERCENT = 20;
const REFERRAL_DISCOUNT_MONTHS = 3;

function savingsPercent(monthly: number, yearly: number) {
  return Math.round((1 - yearly / (monthly * 12)) * 100);
}

const NOVAWEALTH_PRICING_URL = 'https://novawealthhq.com/pricing';

export default function Pricing() {
  const { user, session } = useAuth();
  const { isPro, loading: subLoading, subscriptionEnd, refreshAccess, isGuest } = useSubscription();
  const [portalLoading, setPortalLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isYearly, setIsYearly] = useState(false);

  const hasReferralCode = !!getStoredReferralCode();
  const success = searchParams.get('success') === 'true';

  useEffect(() => {
    if (!success) return;
    refreshAccess();
    const stored = sessionStorage.getItem('mp_referral');
    if (!stored) return;
    try {
      const ref = JSON.parse(stored);
      supabase.functions.invoke('referral-proxy', {
        body: {
          action: 'track',
          referral_code: ref.code,
          referral_code_id: ref.referral_code_id,
          referrer_user_id: ref.referrer_id,
          referred_user_id: user?.id,
          event: 'subscription_created',
        },
      }).then(() => {
        sessionStorage.removeItem('mp_referral');
        clearStoredReferralCode();
      }).catch(console.error);
    } catch { /* ignore */ }
  }, [success]);

  const handleManage = async () => {
    setPortalLoading(true);
    try {
      const { data: freshSession } = await supabase.auth.getSession();
      const freshToken = freshSession?.session?.access_token;
      if (!freshToken) throw new Error('No active session');
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: { Authorization: `Bearer ${freshToken}` },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, '_blank');
    } catch (err) {
      toast.error('Failed to open subscription management.');
      console.error(err);
    } finally { setPortalLoading(false); }
  };

  const proPrice = isYearly ? YEARLY_PRO : MONTHLY_PRO;
  const bundlePrice = isYearly ? YEARLY_BUNDLE : MONTHLY_BUNDLE;
  const period = isYearly ? '/yr' : '/mo';
  const proSavings = savingsPercent(MONTHLY_PRO, YEARLY_PRO);
  const bundleSavings = savingsPercent(MONTHLY_BUNDLE, YEARLY_BUNDLE);

  // Referral discount display for monthly only
  const showReferralOnMonthly = hasReferralCode && !isYearly;
  const discountedMonthly = MONTHLY_PRO * (1 - REFERRAL_DISCOUNT_PERCENT / 100);

  return (
    <div className="min-h-screen bg-background pb-16 sm:pb-0">
      <section className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Choose Your Plan</h1>
          <p className="text-muted-foreground">Start free, upgrade anytime</p>
        </div>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-1 mb-10">
          <button
            onClick={() => setIsYearly(false)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
              !isYearly
                ? 'bg-accent text-accent-foreground shadow-md'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Monthly
          </button>
          <div className="relative">
            <button
              onClick={() => setIsYearly(true)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                isYearly
                  ? 'bg-accent text-accent-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Yearly
            </button>
            <span className="absolute -top-3 -right-4 text-[10px] font-bold bg-warning text-black px-1.5 py-0.5 rounded-full leading-none">
              -{proSavings}%
            </span>
          </div>
        </div>

        {success && (
          <div className="bg-gain/10 border border-gain/30 rounded-lg p-4 mb-8 text-center">
            <p className="text-sm font-medium text-gain">🎉 Welcome to MarketPulse Pro! Your subscription is now active.</p>
          </div>
        )}

        {/* 3-column pricing grid */}
        <div className="grid md:grid-cols-3 gap-5 mb-10">
          {/* ── Free ── */}
          <Card className={`relative ${!isPro ? 'border-accent/50 ring-1 ring-accent/20' : ''}`}>
            {!isPro && !subLoading && (
              <Badge className="absolute -top-2.5 left-4 bg-accent text-accent-foreground text-[10px]">Your Plan</Badge>
            )}
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="h-5 w-5 text-muted-foreground" />
                Free
              </CardTitle>
              <div className="mt-2">
                <span className="text-3xl font-bold font-mono text-foreground">$0</span>
                <span className="text-sm text-muted-foreground">/mo</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Get started with the basics</p>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {features.map(f => (
                <div key={f.name} className="flex items-center gap-2.5 text-sm">
                  {f.free ? (
                    <Check className="h-4 w-4 text-gain shrink-0" />
                  ) : (
                    <X className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                  )}
                  <span className={f.free ? 'text-foreground' : 'text-muted-foreground/60'}>
                    {f.name}
                    {typeof f.free === 'string' && (
                      <span className="text-xs text-muted-foreground ml-1">({f.free})</span>
                    )}
                  </span>
                </div>
              ))}
              {!isPro && (
                <Button variant="outline" className="w-full mt-4" disabled>
                  Current Plan
                </Button>
              )}
            </CardContent>
          </Card>

          {/* ── Pro ── */}
          <Card
            className={`relative cursor-pointer transition-transform hover:scale-[1.02] ${isPro ? 'border-accent/50 ring-1 ring-accent/20' : 'border-accent/40 ring-1 ring-accent/15'}`}
            onClick={() => !isPro && navigate(`/checkout?plan=${isYearly ? 'yearly' : 'monthly'}`)}
          >
            <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground text-[10px] uppercase tracking-wider">
              {isPro && !subLoading ? 'Your Plan' : 'Popular'}
            </Badge>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Crown className="h-5 w-5 text-accent" />
                Pro
              </CardTitle>
              <div className="mt-2">
                {showReferralOnMonthly ? (
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold font-mono text-foreground">
                        ${discountedMonthly.toFixed(2)}
                      </span>
                      <span className="text-lg font-mono text-muted-foreground line-through">
                        ${MONTHLY_PRO.toFixed(2)}
                      </span>
                      <span className="text-sm text-muted-foreground">/mo</span>
                    </div>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <Tag className="h-3.5 w-3.5 text-gain" />
                      <Badge className="bg-gain/10 text-gain border-gain/30 text-[10px] font-semibold">
                        {REFERRAL_DISCOUNT_PERCENT}% off for {REFERRAL_DISCOUNT_MONTHS} months — Referral applied!
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <>
                    <span className="text-3xl font-bold font-mono text-foreground">
                      ${proPrice.toFixed(2)}
                    </span>
                    <span className="text-sm text-muted-foreground">{period}</span>
                  </>
                )}
              </div>
              {isYearly ? (
                <p className="text-xs text-accent mt-1">Save {proSavings}% vs monthly — ${(MONTHLY_PRO * 12 - YEARLY_PRO).toFixed(2)} saved/yr</p>
              ) : !showReferralOnMonthly ? (
                <p className="text-xs text-accent mt-1">30-day free trial included</p>
              ) : null}
            </CardHeader>
            <CardContent className="space-y-2.5">
              {features.map(f => (
                <div key={f.name} className="flex items-center gap-2.5 text-sm">
                  <Check className="h-4 w-4 text-gain shrink-0" />
                  <span className="text-foreground">
                    {f.name}
                    {typeof f.pro === 'string' && (
                      <span className="text-xs text-accent ml-1">({f.pro})</span>
                    )}
                  </span>
                </div>
              ))}
              {isPro ? (
                <div className="space-y-2 mt-4">
                  <Button variant="outline" className="w-full" onClick={(e) => { e.stopPropagation(); handleManage(); }} disabled={portalLoading}>
                    {portalLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ExternalLink className="h-4 w-4 mr-2" />}
                    Manage Subscription
                  </Button>
                  {subscriptionEnd && (
                    <p className="text-[11px] text-muted-foreground text-center">
                      Renews {new Date(subscriptionEnd).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ) : (
                <Button className="w-full mt-4 bg-accent hover:bg-accent/90 text-accent-foreground">
                  <Crown className="h-4 w-4 mr-2" />
                  Start Free Trial
                </Button>
              )}
            </CardContent>
          </Card>

          {/* ── Bundle ── */}
          <Card
            className="relative border-warning/40 ring-1 ring-warning/15 cursor-pointer transition-transform hover:scale-[1.02]"
            onClick={() => window.open(NOVAWEALTH_PRICING_URL, '_blank')}
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="h-5 w-5 text-warning" />
                Bundle
              </CardTitle>
              <div className="mt-2">
                <span className="text-3xl font-bold font-mono text-foreground">
                  ${bundlePrice.toFixed(2)}
                </span>
                <span className="text-sm text-muted-foreground">{period}</span>
              </div>
              {isYearly ? (
                <p className="text-xs text-warning mt-1">Save {bundleSavings}% vs monthly</p>
              ) : (
                <p className="text-xs text-warning mt-1">NovaWealth ecosystem</p>
              )}
            </CardHeader>
            <CardContent className="space-y-2.5">
              {bundleExtras.map(item => (
                <div key={item} className="flex items-center gap-2.5 text-sm">
                  <Check className="h-4 w-4 text-warning shrink-0" />
                  <span className="text-foreground">{item}</span>
                </div>
              ))}
              <Button className="w-full mt-4 bg-warning hover:bg-warning/90 text-black font-semibold">
                <ExternalLink className="h-4 w-4 mr-2" />
                Get the Bundle
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Referral note for yearly */}
        {hasReferralCode && isYearly && (
          <div className="bg-muted/50 border border-border rounded-lg p-3 mb-6 text-center">
            <p className="text-xs text-muted-foreground">
              <Tag className="h-3 w-3 inline mr-1" />
              Referral discounts apply to monthly plans only. The yearly plan already includes 50% savings.
            </p>
          </div>
        )}

        {/* NovaWealth note */}
        <div className="bg-warning/5 border border-warning/20 rounded-lg p-4 mb-6 text-center">
          <p className="text-sm text-foreground">
            Already a <span className="font-semibold text-warning">NovaWealth Pro</span> subscriber? You have full access —{' '}
            <a
              href="https://novawealthhqcom.lovable.app/login?redirect_app=MarketPulse"
              className="text-warning underline hover:text-warning/80 font-medium"
            >
              Log in with NovaWealth
            </a>
          </p>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Cancel anytime during your trial — you won't be charged.{' '}
          {isYearly
            ? `After the trial, $${YEARLY_PRO.toFixed(2)}/year billed annually.`
            : `After the trial, $${MONTHLY_PRO.toFixed(2)}/month billed monthly.`}
        </p>

        {/* Referral Dashboard */}
        {user && !isGuest && (
          <div className="mt-10">
            <ReferralDashboard />
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
}
