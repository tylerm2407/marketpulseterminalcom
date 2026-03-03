// Central referral program constants for MarketPulse Terminal
export const REFERRAL_CONFIG = {
  SOURCE_APP: 'marketpulse_terminal',
  DISCOUNT_PERCENT: 20,
  DISCOUNT_DURATION_MONTHS: 3,
  COMMISSION_PERCENT: 50,
  STRIPE_COUPON_ID: 'jPSNu7Zh',
  REFERRAL_CODE_REGEX: /^NW-[A-F0-9]{8}$/i,
  STORAGE_KEY: 'referral_code',
  NOVAWEALTH_BASE_URL: 'https://dbwuegchdysuocbpsprd.supabase.co/functions/v1',
  APP_DOMAIN: 'marketpulseterminalcom.lovable.app',
  NOVAWEALTH_DOMAIN: 'novawealthhq.com',
} as const;

/** Basic client-side format check before hitting API */
export function isValidReferralCodeFormat(code: string): boolean {
  return REFERRAL_CONFIG.REFERRAL_CODE_REGEX.test(code.trim());
}
