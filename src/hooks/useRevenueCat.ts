/**
 * useRevenueCat
 *
 * Initialises the RevenueCat Capacitor SDK on native platforms and exposes
 * real-time entitlement data.  On web (browser) builds it is a complete
 * no-op so existing Stripe-based gating continues to work unchanged.
 *
 * Entitlement ID "pro" must match what you configured in the RevenueCat
 * dashboard (Project → Entitlements).
 */
import { useEffect, useState, useCallback } from 'react';

// Public iOS SDK key – safe to ship in client code
const REVENUECAT_IOS_KEY = 'rcb_BciRPduQmvBgglsUQeIVuRbjqKJJ';

// Must match the entitlement identifier in your RevenueCat dashboard
const PRO_ENTITLEMENT_ID = 'pro';

const isNative = () =>
  typeof (window as any).Capacitor !== 'undefined' &&
  (window as any).Capacitor?.isNativePlatform?.();

export interface RevenueCatState {
  /** Whether the SDK is initialised and the first fetch has completed */
  rcReady: boolean;
  /** true when the "pro" entitlement is active in RevenueCat */
  isProViaRC: boolean;
  /** Re-fetch customer info on demand (e.g. after a purchase) */
  refreshRC: () => Promise<void>;
}

export function useRevenueCat(): RevenueCatState {
  const [rcReady, setRcReady] = useState(false);
  const [isProViaRC, setIsProViaRC] = useState(false);

  const fetchEntitlements = useCallback(async () => {
    if (!isNative()) return;

    try {
      const { Purchases } = await import('@revenuecat/purchases-capacitor');
      const { customerInfo } = await Purchases.getCustomerInfo();
      const active = customerInfo?.entitlements?.active ?? {};
      setIsProViaRC(PRO_ENTITLEMENT_ID in active);
    } catch (err) {
      console.warn('[RevenueCat] getCustomerInfo failed:', err);
      setIsProViaRC(false);
    }
  }, []);

  useEffect(() => {
    if (!isNative()) {
      // Not a native build – nothing to do
      setRcReady(true);
      return;
    }

    let mounted = true;

    const init = async () => {
      try {
        const { Purchases, LOG_LEVEL } = await import(
          '@revenuecat/purchases-capacitor'
        );

        // Only configure once; calling configure() again is a no-op in RC SDK
        await Purchases.setLogLevel({ level: LOG_LEVEL.WARN });
        await Purchases.configure({ apiKey: REVENUECAT_IOS_KEY });

        console.log('[RevenueCat] SDK configured');

        await fetchEntitlements();
      } catch (err) {
        console.error('[RevenueCat] Initialisation error:', err);
      } finally {
        if (mounted) setRcReady(true);
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, [fetchEntitlements]);

  return { rcReady, isProViaRC, refreshRC: fetchEntitlements };
}
