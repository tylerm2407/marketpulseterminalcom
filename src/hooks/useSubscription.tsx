import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useRevenueCat } from '@/hooks/useRevenueCat';

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

  // RevenueCat: active on native builds, no-op on web
  const { isProViaRC, rcReady, refreshRC } = useRevenueCat();

  const checkSubscription = useCallback(async () => {
    // ------------------------------------------------------------------
    // On native: RevenueCat is the source of truth for entitlements.
    // We still allow Nova Wealth linked accounts to bypass.
    // ------------------------------------------------------------------
    const isNative =
      typeof (window as any).Capacitor !== 'undefined' &&
      (window as any).Capacitor?.isNativePlatform?.();

    if (!session?.access_token) {
      // On native, RC may already report Pro (anonymous purchase restore)
      setIsPro(isNative && isProViaRC);
      setSubscriptionEnd(null);
      setLoading(false);
      return;
    }

    try {
      // Always check Nova Wealth link first (automatic Pro)
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

      // On native: trust RevenueCat entitlement (managed by the stripe-webhook sync)
      if (isNative) {
        setIsPro(isProViaRC);
        setSubscriptionEnd(null);
        setLoading(false);
        return;
      }

      // On web: fall back to Stripe check via edge function
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (error) throw error;

      const isSubscribed = data?.subscribed === true && data?.product_id === PRO_PRODUCT_ID;
      setIsPro(isSubscribed);
      setSubscriptionEnd(data?.subscription_end ?? null);
    } catch (err) {
      console.warn('Subscription check failed:', err);
      // On native, fall back to RC even if the network check failed
      const isNativeFallback =
        typeof (window as any).Capacitor !== 'undefined' &&
        (window as any).Capacitor?.isNativePlatform?.();
      setIsPro(isNativeFallback && isProViaRC);
    } finally {
      setLoading(false);
    }
  }, [session?.access_token, user?.id, isProViaRC]);

  // Re-run whenever the RC state settles (native) or session changes (web)
  useEffect(() => {
    if (!rcReady) return; // wait for RC SDK to initialise on native
    checkSubscription();
  }, [checkSubscription, rcReady]);

  // Auto-refresh every 60 seconds for web users
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      checkSubscription();
    }, 60_000);
    return () => clearInterval(interval);
  }, [user, checkSubscription]);

  const refreshSubscription = useCallback(async () => {
    await refreshRC();      // re-fetch RC entitlements on native
    await checkSubscription();
  }, [refreshRC, checkSubscription]);

  return (
    <SubscriptionContext.Provider
      value={{
        isPro,
        loading,
        subscriptionEnd,
        refreshSubscription,
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
