import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check, X, Crown, Zap, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ReferralCodeInput, type ReferralValidation } from '@/components/ReferralCodeInput';

const features = [
  { name: 'Stock Dossiers & Charts', free: true, pro: true },
  { name: 'Market Overview & News', free: true, pro: true },
  { name: 'Earnings Calendar', free: true, pro: true },
  { name: 'Stock Comparison', free: true, pro: true },
  { name: 'Watchlist', free: '10 stocks', pro: 'Unlimited' },
  { name: 'Portfolio Tracking', free: false, pro: true },
  { name: 'Price Alerts', free: false, pro: true },
  { name: 'AI Stock Screener', free: false, pro: true },
  { name: 'Social Sentiment (Grok AI)', free: false, pro: true },
  { name: 'Real-time Data', free: 'Delayed', pro: 'Live' },
];

export default function Pricing() {
  const { user, session } = useAuth();
  const { isPro, loading: subLoading, subscriptionEnd, refreshSubscription } = useSubscription();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [referral, setReferral] = useState<ReferralValidation | null>(null);

  const success = searchParams.get('success') === 'true';

  // Track referral on successful payment redirect
  useEffect(() => {
    if (!success) return;
    refreshSubscription();

    const stored = sessionStorage.getItem('mp_referral');
    if (!stored) return;

    try {
      const ref = JSON.parse(stored);
      fetch('https://dbwuegchdysuocbpsprd.supabase.co/functions/v1/track-referral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referral_code: ref.code,
          referrer_id: ref.referrer_id,
          referred_email: ref.email,
          app_name: 'MarketPulseTerminal',
          subscription_amount: 1999,
          discount_amount: 500,
        }),
      }).then(() => sessionStorage.removeItem('mp_referral'))
        .catch(console.error);
    } catch { /* ignore */ }
  }, [success]);

  const handleCheckout = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    setCheckoutLoading(true);
    try {
      // Store referral data for post-checkout tracking
      if (referral) {
        sessionStorage.setItem('mp_referral', JSON.stringify({
          code: referral.code,
          referrer_id: referral.referrer_id,
          email: user.email,
        }));
      }

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        headers: { Authorization: `Bearer ${session?.access_token}` },
        body: referral ? { referral_code: referral.code, referrer_id: referral.referrer_id } : {},
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (err) {
      toast.error('Failed to start checkout. Please try again.');
      console.error(err);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleManage = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (err) {
      toast.error('Failed to open subscription management.');
      console.error(err);
    } finally {
      setPortalLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-16 sm:pb-0">
      <section className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-foreground mb-2">Choose Your Plan</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Start with a <span className="font-semibold text-accent">30-day free trial</span> of Pro — no commitment, cancel anytime.
          </p>
        </div>

        {success && (
          <div className="bg-gain/10 border border-gain/30 rounded-lg p-4 mb-8 text-center">
            <p className="text-sm font-medium text-gain">🎉 Welcome to MarketPulse Pro! Your subscription is now active.</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {/* Free Tier */}
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
                <span className="text-sm text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
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

          {/* Pro Tier */}
          <Card className={`relative ${isPro ? 'border-accent/50 ring-1 ring-accent/20' : 'border-accent/30'}`}>
            {isPro && !subLoading && (
              <Badge className="absolute -top-2.5 left-4 bg-accent text-accent-foreground text-[10px]">Your Plan</Badge>
            )}
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Crown className="h-5 w-5 text-accent" />
                Pro
              </CardTitle>
              <div className="mt-2">
                <span className="text-3xl font-bold font-mono text-foreground">$19.99</span>
                <span className="text-sm text-muted-foreground">/month</span>
              </div>
              <p className="text-xs text-accent mt-1">30-day free trial included</p>
            </CardHeader>
            <CardContent className="space-y-3">
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
                  <Button variant="outline" className="w-full" onClick={handleManage} disabled={portalLoading}>
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
                <>
                  <Button className="w-full mt-4 bg-accent hover:bg-accent/90 text-accent-foreground" onClick={handleCheckout} disabled={checkoutLoading}>
                    {checkoutLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Crown className="h-4 w-4 mr-2" />}
                    {referral ? 'Subscribe — 25% Off' : 'Start Free Trial'}
                  </Button>
                  {user && (
                    <ReferralCodeInput userEmail={user.email || ''} onValidated={setReferral} />
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Cancel anytime during your trial — you won't be charged. After the trial, $19.99/month billed monthly.
        </p>
      </section>
      <Footer />
    </div>
  );
}
