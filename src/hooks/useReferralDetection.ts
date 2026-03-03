import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { REFERRAL_CONFIG } from '@/lib/referralConfig';

/**
 * Detects ?ref= query parameter and stores referral code in localStorage.
 * Call this hook on any page where users might land with a referral link.
 */
export function useReferralDetection() {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      localStorage.setItem(REFERRAL_CONFIG.STORAGE_KEY, refCode.toUpperCase());
    }
  }, [searchParams]);
}

/** Read stored referral code (if any) */
export function getStoredReferralCode(): string | null {
  try {
    return localStorage.getItem(REFERRAL_CONFIG.STORAGE_KEY);
  } catch {
    return null;
  }
}

/** Clear stored referral code after successful tracking */
export function clearStoredReferralCode(): void {
  try {
    localStorage.removeItem(REFERRAL_CONFIG.STORAGE_KEY);
  } catch { /* ignore */ }
}
