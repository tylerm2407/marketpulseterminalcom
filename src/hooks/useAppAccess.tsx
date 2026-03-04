import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour
const FREE_WATCHLIST_LIMIT = 10;
const UPGRADE_RETRY_DELAY = 3000; // 3s between retries
const UPGRADE_MAX_RETRIES = 5;

interface AppAccessContextType {
  hasAccess: boolean;
  loading: boolean;
  isGuest: boolean;
  refreshAccess: () => Promise<void>;
  /** Feature gate helpers – mirror old useSubscription API for easy migration */
  isPro: boolean;
  canUsePortfolio: boolean;
  canUseScreener: boolean;
  canUseTweets: boolean;
  watchlistLimit: number | null; // null = unlimited, 0 = no watchlist (guest)
  subscriptionEnd: string | null;
}

const AppAccessContext = createContext<AppAccessContextType | undefined>(undefined);

export function AppAccessProvider({ children }: { children: ReactNode }) {
  const { user, session, isGuest } = useAuth();
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAccess = useCallback(async (forceSync = false) => {
    if (isGuest || !user || !session?.access_token) {
      setHasAccess(false);
      setLoading(false);
      return;
    }

    try {
      // 1. Check profiles.nova_wealth_linked for lifetime access bypass
      const { data: profile } = await supabase
        .from('profiles')
        .select('nova_wealth_linked')
        .eq('user_id', user.id)
        .single();

      if (profile?.nova_wealth_linked) {
        setHasAccess(true);
        setLoading(false);
        return;
      }

      // 2. Read local cache from user_access
      const { data: row } = await supabase
        .from('user_access')
        .select('*')
        .eq('id', user.id)
        .single();

      const now = Date.now();
      const lastCheck = row?.last_novawealth_check
        ? new Date(row.last_novawealth_check).getTime()
        : 0;
      const needsSync = forceSync || !row || (now - lastCheck > CACHE_DURATION_MS);

      let novawealth = row?.novawealth_subscriber ?? false;
      let standalone = row?.standalone_subscriber ?? false;

      // 3. If cache is stale, sync with NovaWealth + check Stripe
      if (needsSync) {
        // Sync NovaWealth status
        try {
          const { data, error } = await supabase.functions.invoke('sync-novawealth-access', {
            body: { user_id: user.id, email: user.email },
          });
          if (!error && data) {
            novawealth = data.novawealth_subscriber === true;
          }
        } catch (syncErr) {
          console.warn('NovaWealth sync failed, using cached value:', syncErr);
        }

        // Check Stripe subscription status (also updates user_access)
        try {
          // Always get a fresh session to avoid expired token errors
          const { data: freshSession } = await supabase.auth.getSession();
          const freshToken = freshSession?.session?.access_token;
          if (!freshToken) throw new Error('No active session');
          const { data: stripeSub, error: stripeErr } = await supabase.functions.invoke('check-subscription', {
            headers: { Authorization: `Bearer ${freshToken}` },
          });
          if (!stripeErr && stripeSub?.subscribed) {
            standalone = true;
          }
        } catch (stripeCheckErr) {
          console.warn('Stripe check failed, using cached value:', stripeCheckErr);
        }

        // Re-read the row after sync to get latest values
        const { data: fresh } = await supabase
          .from('user_access')
          .select('*')
          .eq('id', user.id)
          .single();

        if (fresh) {
          novawealth = fresh.novawealth_subscriber ?? false;
          standalone = fresh.standalone_subscriber ?? false;
        }
      }

      setHasAccess(novawealth || standalone);
    } catch (err) {
      console.warn('Access check failed:', err);
      setHasAccess(false);
    } finally {
      setLoading(false);
    }
  }, [user, session?.access_token, isGuest]);

  // Run on login / app load
  useEffect(() => {
    checkAccess();
  }, [checkAccess]);

  // Auto-refresh every 60s (lightweight – only hits DB, not external API unless cache expired)
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => checkAccess(), 60_000);
    return () => clearInterval(interval);
  }, [user, checkAccess]);

  const refreshAccess = useCallback(async () => {
    await checkAccess(true);
  }, [checkAccess]);

  // Handle upgrade_success from Stripe redirect — retry until access is confirmed
  const upgradeHandled = useRef(false);
  useEffect(() => {
    if (upgradeHandled.current || !user || isGuest) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('upgrade_success') !== 'true') return;
    upgradeHandled.current = true;

    // Clean URL
    params.delete('upgrade_success');
    const newUrl = params.toString()
      ? `${window.location.pathname}?${params}`
      : window.location.pathname;
    window.history.replaceState({}, '', newUrl);

    // Retry loop: Stripe may take a moment to provision
    let retries = 0;
    const trySync = async () => {
      await checkAccess(true);
      // Re-read latest state after sync
      const { data: row } = await supabase
        .from('user_access')
        .select('standalone_subscriber, novawealth_subscriber')
        .eq('id', user.id)
        .single();
      const synced = row?.standalone_subscriber || row?.novawealth_subscriber;
      if (synced) {
        setHasAccess(true);
        const { toast } = await import('sonner');
        toast.success('🎉 Welcome to Pro! Your subscription is now active.');
      } else if (retries < UPGRADE_MAX_RETRIES) {
        retries++;
        setTimeout(trySync, UPGRADE_RETRY_DELAY);
      } else {
        const { toast } = await import('sonner');
        toast.info('Subscription is being activated. Features will unlock shortly.');
      }
    };
    trySync();
  }, [user, isGuest, checkAccess]);

  // Check NW SSO pro status from auth context
  const nwPro = (() => {
    try {
      const method = localStorage.getItem('nw_login_method');
      const tier = localStorage.getItem('nw_tier');
      return method === 'novawealth' && tier === 'pro';
    } catch { return false; }
  })();

  const isPro = (hasAccess && !isGuest) || nwPro;

  return (
    <AppAccessContext.Provider
      value={{
        hasAccess,
        loading,
        isGuest,
        refreshAccess,
        isPro,
        subscriptionEnd: null,
        canUsePortfolio: isPro,
        canUseScreener: isPro,
        canUseTweets: isPro,
        watchlistLimit: isGuest ? 0 : isPro ? null : FREE_WATCHLIST_LIMIT,
      }}
    >
      {children}
    </AppAccessContext.Provider>
  );
}

export function useAppAccess() {
  const context = useContext(AppAccessContext);
  if (!context) throw new Error('useAppAccess must be used within AppAccessProvider');
  return context;
}

/**
 * Backward-compatible alias so existing imports of useSubscription
 * continue to work without changing every file.
 */
export const useSubscription = useAppAccess;
