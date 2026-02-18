/**
 * NativeAppShell
 *
 * Mounts native Capacitor features when running inside a native build:
 *   - Network / offline detection
 *   - Push notifications
 *   - Deep linking
 *   - RevenueCat SDK initialisation
 *
 * Safe no-op for every feature in a browser build.
 */
import React from 'react';
import { useNetworkStatus, usePushNotifications, useDeepLinking } from './useNativeFeatures';
import { OfflineBanner } from './OfflineBanner';
import { useRevenueCat } from '@/hooks/useRevenueCat';

interface Props {
  children: React.ReactNode;
}

export function NativeAppShell({ children }: Props) {
  const isOnline = useNetworkStatus();
  usePushNotifications();
  useDeepLinking();

  // Initialise RevenueCat SDK on native; no-op on web.
  // The hook exposes state consumed by useSubscription via a separate context,
  // but calling it here ensures the SDK is configured before any feature gate
  // runs.  The returned state is also used by useSubscription through its own
  // call to the same hook (React deduplication ensures a single SDK init).
  useRevenueCat();

  return (
    <>
      {!isOnline && <OfflineBanner />}
      {children}
    </>
  );
}
