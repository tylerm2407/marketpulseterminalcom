import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Crown, ArrowLeft, Loader2, Check, Mail, Tag, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ReferralCodeInput, type ReferralValidation } from '@/components/ReferralCodeInput';
import { toast } from 'sonner';
import { useReferralDetection } from '@/hooks/useReferralDetection';
import logoImg from '@/assets/logo.png';

const MONTHLY_PRO = 19.99;
const YEARLY_PRO = 119.88;
const REFERRAL_DISCOUNT_PERCENT = 20;
const REFERRAL_DISCOUNT_MONTHS = 3;

const proFeatures = [
  'Unlimited Watchlists',
  'Portfolio Tracking',
  'Price Alerts',
  'AI Stock Screener',
  'Social Sentiment (Grok AI)',
  'Live Real-time Data',
  '30-day free trial',
];

export default function Checkout() {
  useReferralDetection();
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const plan = searchParams.get('plan') || 'monthly';
  const isYearly = plan === 'yearly';
  const basePrice = isYearly ? YEARLY_PRO : MONTHLY_PRO;
  const period = isYearly ? '/yr' : '/mo';

  const [email, setEmail] = useState('');
  const [referral, setReferral] = useState<ReferralValidation | null>(null);
  const [loading, setLoading] = useState(false);

  const effectiveEmail = user?.email || email;

  // Referral only applies to monthly
  const showReferral = !isYearly;
  const hasValidReferral = showReferral && referral;
  const discountedPrice = hasValidReferral
    ? MONTHLY_PRO * (1 - REFERRAL_DISCOUNT_PERCENT / 100)
    : basePrice;

  const handleProceed = async () => {
    if (!effectiveEmail) {
      toast.error('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      // Store referral info for post-payment tracking
      if (referral) {
        sessionStorage.setItem('mp_referral', JSON.stringify({
          code: referral.code,
          referrer_id: referral.referrer_id,
          referral_code_id: referral.referral_code_id,
          email: effectiveEmail,
        }));
      }

      const body: Record<string, string> = {
        billing_period: isYearly ? 'yearly' : 'monthly',
        ...(referral && !isYearly && {
          referral_code: referral.code,
          referrer_id: referral.referrer_id,
          referral_code_id: referral.referral_code_id,
        }),
      };

      if (session?.access_token) {
        body.guest_email = undefined as any;
        const { data, error } = await supabase.functions.invoke('create-checkout', {
          headers: { Authorization: `Bearer ${session.access_token}` },
          body,
        });
        if (error) throw error;
        if (data?.url) window.location.href = data.url;
      } else {
        body.guest_email = effectiveEmail;
        const { data, error } = await supabase.functions.invoke('create-checkout', {
          body,
        });
        if (error) throw error;
        if (data?.url) window.location.href = data.url;
      }
    } catch (err) {
      toast.error('Failed to start checkout. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: 'var(--bg-base)' }}>
      <div className="w-full max-w-md">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        {/* Logo */}
        <div className="flex items-center gap-2 mb-6">
          <img src={logoImg} alt="MarketPulse" className="h-8 w-8 rounded-lg" />
          <span className="text-lg font-display font-bold tracking-tight text-foreground">
            Market<span className="gradient-text">Pulse</span> Pro
          </span>
        </div>

        {/* Plan summary card */}
        <Card className="mb-6 border-accent/30">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-accent" />
                <span className="font-semibold text-foreground">Pro Plan</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {isYearly ? 'Annual' : 'Monthly'}
              </Badge>
            </div>

            <div className="mb-4">
              {hasValidReferral ? (
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold font-mono text-foreground">${discountedPrice.toFixed(2)}</span>
                    <span className="text-lg font-mono text-muted-foreground line-through">${MONTHLY_PRO.toFixed(2)}</span>
                    <span className="text-sm text-muted-foreground">/mo</span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5 text-gain" />
                    <Badge className="bg-gain/10 text-gain border-gain/30 text-xs">
                      {REFERRAL_DISCOUNT_PERCENT}% off first {REFERRAL_DISCOUNT_MONTHS} months applied!
                    </Badge>
                  </div>
                </div>
              ) : (
                <div>
                  <span className="text-3xl font-bold font-mono text-foreground">${basePrice.toFixed(2)}</span>
                  <span className="text-sm text-muted-foreground">{period}</span>
                  {isYearly && (
                    <p className="text-xs text-accent mt-1">
                      Save 50% — that's just ${(YEARLY_PRO / 12).toFixed(2)}/mo
                    </p>
                  )}
                </div>
              )}
            </div>

            <p className="text-xs text-accent mb-3">Includes a 30-day free trial — cancel anytime</p>

            <ul className="space-y-1.5">
              {proFeatures.map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="h-3.5 w-3.5 text-gain shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Email input for guests */}
        {!user && (
          <div className="mb-4 space-y-1.5">
            <Label htmlFor="checkout-email" className="text-sm text-foreground">Email address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="checkout-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">You'll create your account after payment.</p>
          </div>
        )}

        {user && (
          <div className="mb-4 p-3 rounded-lg bg-muted/50 text-sm text-foreground">
            <span className="text-muted-foreground">Checking out as</span>{' '}
            <span className="font-medium">{user.email}</span>
          </div>
        )}

        {/* Referral code input — monthly only */}
        {showReferral ? (
          <div className="mb-6">
            <ReferralCodeInput userId={user?.id} onValidated={setReferral} />
          </div>
        ) : (
          <div className="mb-6 p-3 rounded-lg bg-muted/30 text-xs text-muted-foreground text-center">
            <Tag className="h-3 w-3 inline mr-1" />
            Referral codes apply to monthly plans only. Your yearly plan already saves 50%.
          </div>
        )}

        {/* Proceed button */}
        <Button
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground h-12 text-base font-semibold"
          onClick={handleProceed}
          disabled={loading || (!user && !email.trim())}
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
          ) : (
            <Crown className="h-5 w-5 mr-2" />
          )}
          Proceed to Payment
        </Button>

        <p className="text-center text-xs text-muted-foreground mt-4">
          You won't be charged during the 30-day trial. Cancel anytime.
        </p>
      </div>
    </div>
  );
}
