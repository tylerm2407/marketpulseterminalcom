/**
 * NativeAppShell
 * Mounts native Capacitor features (push notifications, deep linking, network detection)
 * when running inside a Capacitor native build. Safe no-op in browser.
 */
import { useNetworkStatus, usePushNotifications, useDeepLinking } from './useNativeFeatures';
import { OfflineBanner } from './OfflineBanner';

interface Props {
  children: React.ReactNode;
}

export function NativeAppShell({ children }: Props) {
  const isOnline = useNetworkStatus();
  usePushNotifications();
  useDeepLinking();

  return (
    <>
      {!isOnline && <OfflineBanner />}
      {children}
    </>
  );
}
