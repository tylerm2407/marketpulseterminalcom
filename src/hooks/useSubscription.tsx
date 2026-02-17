import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const PRO_PRODUCT_ID = 'prod_TzW8JALJpGDw1A';
const FREE_WATCHLIST_LIMIT = 10;

interface SubscriptionContextType {
  isPro: boolean;
  loading: boolean;
  subscriptionEnd: string | null;
  refreshSubscription: () => Promise<void>;
  /** Feature gate helpers */
  canUsePortfolio: boolean;
  canUseScreener: boolean;
  canUseTweets: boolean;
  watchlistLimit: number | null; // null = unlimited
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user, session } = useAuth();
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);

  const checkSubscription = useCallback(async () => {
    if (!session?.access_token) {
      setIsPro(false);
      setSubscriptionEnd(null);
      setLoading(false);
      return;
    }

    try {
      // Check if user is linked from Nova Wealth (automatic Pro)
      const { data: profile } = await supabase
        .from('profiles')
        .select('nova_wealth_linked')
        .eq('user_id', user?.id ?? '')
        .single();

      if (profile?.nova_wealth_linked) {
        setIsPro(true);
        setSubscriptionEnd(null);
        setLoading(false);
        return;
      }

      // Otherwise check Stripe subscription
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (error) throw error;

      const isSubscribed = data?.subscribed === true && data?.product_id === PRO_PRODUCT_ID;
      setIsPro(isSubscribed);
      setSubscriptionEnd(data?.subscription_end ?? null);
    } catch (err) {
      console.warn('Subscription check failed:', err);
      setIsPro(false);
    } finally {
      setLoading(false);
    }
  }, [session?.access_token, user?.id]);

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(checkSubscription, 60_000);
    return () => clearInterval(interval);
  }, [user, checkSubscription]);

  return (
    <SubscriptionContext.Provider
      value={{
        isPro,
        loading,
        subscriptionEnd,
        refreshSubscription: checkSubscription,
        canUsePortfolio: isPro,
        canUseScreener: isPro,
        canUseTweets: isPro,
        watchlistLimit: isPro ? null : FREE_WATCHLIST_LIMIT,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) throw new Error('useSubscription must be used within SubscriptionProvider');
  return context;
}
