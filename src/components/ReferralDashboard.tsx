import { Copy, Check, Users, DollarSign, Clock, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useReferralData } from '@/hooks/useReferralData';
import { useSubscription } from '@/hooks/useSubscription';
import { REFERRAL_CONFIG } from '@/lib/referralConfig';
import { toast } from 'sonner';

export function ReferralDashboard() {
  const { isPro } = useSubscription();
  const { data, isLoading, error } = useReferralData();
  const [copied, setCopied] = useState(false);

  if (!isPro) {
    return (
      <Card className="border-dashed border-muted-foreground/30">
        <CardContent className="py-8 text-center">
          <Users className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            Start a paid subscription to unlock your personal referral code and earn commissions on referrals.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader><Skeleton className="h-5 w-40" /></CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <div className="grid grid-cols-3 gap-3">
            <Skeleton className="h-16" /><Skeleton className="h-16" /><Skeleton className="h-16" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent className="py-6 text-center text-sm text-muted-foreground">
          Could not load referral data. Try again later.
        </CardContent>
      </Card>
    );
  }

  const referralLink = `https://${REFERRAL_CONFIG.APP_DOMAIN}/?ref=${data.referral_code}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast.success('Referral link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-4 w-4 text-accent" />
          Referral Program
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Referral code + copy */}
        {data.referral_code ? (
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-muted rounded-md px-3 py-2 font-mono text-sm text-foreground">
              {data.referral_code}
            </div>
            <Button variant="outline" size="sm" onClick={handleCopy} className="shrink-0">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span className="ml-1.5 text-xs">{copied ? 'Copied' : 'Copy Link'}</span>
            </Button>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Your referral code will appear once your subscription is active.</p>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3">
          <StatBox icon={Users} label="Referrals" value={data.total_referrals} sub={`${data.pending_referrals} pending`} />
          <StatBox icon={DollarSign} label="Earned" value={`$${data.total_commission_earned.toFixed(2)}`} sub={`$${data.total_commission_paid.toFixed(2)} paid`} />
          <StatBox icon={Clock} label="Available" value={`$${data.available_for_payout.toFixed(2)}`} sub="for payout" />
        </div>

        {/* How it works */}
        <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground space-y-1">
          <p className="font-medium text-foreground text-xs">How it works</p>
          <p>Share your link → friends get {REFERRAL_CONFIG.DISCOUNT_PERCENT}% off for {REFERRAL_CONFIG.DISCOUNT_DURATION_MONTHS} months → you earn {REFERRAL_CONFIG.COMMISSION_PERCENT}% of their first paid month as cash commission.</p>
        </div>
      </CardContent>
    </Card>
  );
}

function StatBox({ icon: Icon, label, value, sub }: { icon: React.ElementType; label: string; value: string | number; sub: string }) {
  return (
    <div className="bg-muted/30 rounded-lg p-3 text-center">
      <Icon className="h-3.5 w-3.5 text-muted-foreground mx-auto mb-1" />
      <div className="text-sm font-bold font-mono text-foreground">{value}</div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className="text-[10px] text-muted-foreground/70">{sub}</div>
    </div>
  );
}
