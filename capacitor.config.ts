import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.novawealth.marketpulseterminal',
  appName: 'MarketPulse',
  webDir: 'dist',
  server: {
    url: 'https://marketpulseterminal.com',
    cleartext: false,
  },
  ios: {
    contentInset: 'always',
    allowsLinkPreview: false,
    scrollEnabled: true,
    limitsNavigationsToAppBoundDomains: true,
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#0d1117',
      iosSpinnerStyle: 'large',
      spinnerColor: '#1aab8a',
      showSpinner: true,
    },
  },
};

export default config;
