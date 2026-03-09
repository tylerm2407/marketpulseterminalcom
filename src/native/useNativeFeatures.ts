import { useEffect, useState, useCallback } from 'react';

// Capacitor is only available in native builds — guard all imports
const isNative = () =>
  typeof (window as any).Capacitor !== 'undefined' &&
  (window as any).Capacitor?.isNativePlatform?.();

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    const setup = async () => {
      if (isNative()) {
        const { Network } = await import('@capacitor/network');
        const status = await Network.getStatus();
        setIsOnline(status.connected);

        const handle = await Network.addListener('networkStatusChange', s => {
          setIsOnline(s.connected);
        });
        cleanup = () => handle.remove();
      } else {
        // Web fallback
        const onOnline = () => setIsOnline(true);
        const onOffline = () => setIsOnline(false);
        window.addEventListener('online', onOnline);
        window.addEventListener('offline', onOffline);
        setIsOnline(navigator.onLine);
        cleanup = () => {
          window.removeEventListener('online', onOnline);
          window.removeEventListener('offline', onOffline);
        };
      }
    };

    setup();
    return () => cleanup?.();
  }, []);

  return isOnline;
}

export function useNativeShare() {
  const share = useCallback(async (title: string, text: string, url: string) => {
    if (isNative()) {
      const { Share } = await import('@capacitor/share');
      await Share.share({ title, text, url, dialogTitle: title });
    } else {
      if (navigator.share) {
        await navigator.share({ title, text, url });
      } else {
        await navigator.clipboard.writeText(url);
      }
    }
  }, []);

  return share;
}

export function usePushNotifications() {
  useEffect(() => {
    if (!isNative()) return;

    const setup = async () => {
      const { PushNotifications } = await import('@capacitor/push-notifications');

      let permStatus = await PushNotifications.checkPermissions();
      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }
      if (permStatus.receive !== 'granted') return;

      await PushNotifications.register();

      PushNotifications.addListener('registration', token => {
        console.log('[Push] Token:', token.value);
        // TODO: send token.value to your backend to store per-user
      });

      PushNotifications.addListener('registrationError', err => {
        console.error('[Push] Registration error:', err.error);
      });

      PushNotifications.addListener('pushNotificationReceived', notification => {
        console.log('[Push] Received:', notification);
      });

      PushNotifications.addListener('pushNotificationActionPerformed', action => {
        console.log('[Push] Action performed:', action.actionId, action.notification);
        // Handle deep link from notification data
        const deepLink = action.notification?.data?.url;
        if (deepLink && (deepLink.startsWith('marketpulse://') || deepLink.startsWith('/'))) {
          window.location.href = deepLink;
        }
      });
    };

    setup().catch(console.error);
  }, []);
}

export function useDeepLinking() {
  useEffect(() => {
    if (!isNative()) return;

    const setup = async () => {
      const { App } = await import('@capacitor/app');

      App.addListener('appUrlOpen', event => {
        // Handle deep links: marketpulse://stock/AAPL → /stock/AAPL
        const slug = event.url.split('marketpulse:/').pop();
        const ALLOWED_ROUTES = ['/', '/watchlist', '/portfolio', '/analytics', '/news', '/screener', '/earnings', '/alerts', '/settings', '/pricing', '/auth'];
        if (slug && (slug === '/' || ALLOWED_ROUTES.some(route => slug.startsWith(route)))) {
          window.location.href = slug;
        }
      });

      App.addListener('backButton', ({ canGoBack }) => {
        if (canGoBack) {
          window.history.back();
        } else {
          App.exitApp();
        }
      });
    };

    setup().catch(console.error);
  }, []);
}
