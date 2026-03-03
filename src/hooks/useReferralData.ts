import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface ReferralData {
  user_id: string;
  referral_code: string | null;
  total_referrals: number;
  pending_referrals: number;
  successful_referrals: number;
  total_commission_earned: number;
  total_commission_paid: number;
  available_for_payout: number;
  is_commission_eligible: boolean;
  referrals: Array<{
    id: string;
    source_app: string;
    status: string;
    reward_amount: number;
    created_at: string;
    rewarded_at: string | null;
  }>;
  payouts: Array<{
    id: string;
    amount: number;
    currency: string;
    status: string;
    created_at: string;
    paid_at: string | null;
  }>;
}

export function useReferralData() {
  const { session } = useAuth();

  return useQuery<ReferralData>({
    queryKey: ['referral-data'],
    enabled: !!session?.access_token,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('referral-proxy', {
        body: { action: 'get-data' },
      });
      if (error) throw error;
      return data as ReferralData;
    },
  });
}
