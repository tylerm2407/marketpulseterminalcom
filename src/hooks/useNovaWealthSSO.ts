import { useEffect, useState, useCallback } from 'react';

const NW_KEYS = {
  email: 'nw_user_email',
  userId: 'nw_user_id',
  tier: 'nw_tier',
  loginMethod: 'nw_login_method',
} as const;

const NW_VALIDATE_URL =
  'https://dbwuegchdysuocbpsprd.supabase.co/functions/v1/validate-auth-token';
const NW_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRid3VlZ2NoZHlzdW9jYnBzcHJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExNzYyMTAsImV4cCI6MjA4Njc1MjIxMH0.6LEKjLXhaxeRublNoAITpVVueHwpUPuLxS0sbgcTUlE';

export interface NWSession {
  email: string;
  userId: string;
  tier: 'free' | 'pro';
  loginMethod: 'novawealth';
}

function readSession(): NWSession | null {
  const method = localStorage.getItem(NW_KEYS.loginMethod);
  if (method !== 'novawealth') return null;
  const email = localStorage.getItem(NW_KEYS.email);
  const userId = localStorage.getItem(NW_KEYS.userId);
  const tier = localStorage.getItem(NW_KEYS.tier) as 'free' | 'pro' | null;
  if (!email || !userId || !tier) return null;
  return { email, userId, tier, loginMethod: 'novawealth' };
}

function saveSession(data: { email: string; user_id: string; tier: string }) {
  localStorage.setItem(NW_KEYS.email, data.email);
  localStorage.setItem(NW_KEYS.userId, data.user_id);
  localStorage.setItem(NW_KEYS.tier, data.tier);
  localStorage.setItem(NW_KEYS.loginMethod, 'novawealth');
}

export function clearNWSession() {
  Object.values(NW_KEYS).forEach((k) => localStorage.removeItem(k));
}

export function useNovaWealthSSO() {
  const [nwSession, setNwSession] = useState<NWSession | null>(readSession);
  const [processing, setProcessing] = useState(false);

  // Handle ?nw_token= on landing
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('nw_token');
    if (!token) return;

    // Remove token from URL immediately
    const url = new URL(window.location.href);
    url.searchParams.delete('nw_token');
    window.history.replaceState({}, '', url.pathname + url.search);

    setProcessing(true);

    (async () => {
      try {
        const res = await fetch(NW_VALIDATE_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: NW_ANON_KEY,
          },
          body: JSON.stringify({ token }),
        });

        if (!res.ok) throw new Error(`Validation failed: ${res.status}`);

        const data = await res.json();

        if (!data.valid) throw new Error('Token invalid');

        saveSession({ email: data.email, user_id: data.user_id, tier: data.tier });
        setNwSession(readSession());
      } catch (err) {
        console.error('NovaWealth SSO failed:', err);
      } finally {
        setProcessing(false);
      }
    })();
  }, []);

  const signOutNW = useCallback(() => {
    clearNWSession();
    setNwSession(null);
  }, []);

  const isNWPro = nwSession?.tier === 'pro';

  return { nwSession, processing, signOutNW, isNWPro };
}
