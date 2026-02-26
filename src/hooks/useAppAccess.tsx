import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour
const FREE_WATCHLIST_LIMIT = 10;

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
      // 1. Read local cache from user_access
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

      // 2. If cache is stale, sync with NovaWealth
      if (needsSync) {
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

        // Re-read the row after sync to get latest standalone too
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
