import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { checkRateLimit, rateLimitResponse } from "../_shared/rateLimiter.ts";
import {
  safeParseBody, isValidEmail, sanitize, checkUnexpectedFields, validationError,
} from "../_shared/inputValidator.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SOURCE_APP = "marketpulse_terminal";
const REFERRAL_COUPON_ID = "jPSNu7Zh";
const MONTHLY_PRICE_ID = "price_1T1X6BAmUZkn8na4fZGfuj7k";
const YEARLY_PRICE_ID = "price_1T75DiAmUZkn8na4mV6RRBUI";
const RATE_LIMIT = { functionName: "create-checkout", maxRequests: 10, windowSeconds: 60 };

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") return validationError(corsHeaders, "Method not allowed");

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    // Rate limit
    const rl = await checkRateLimit(req, RATE_LIMIT);
    if (!rl.allowed) return rateLimitResponse(corsHeaders, rl.retryAfterSeconds!);

    // Parse & validate body
    const parsed = await safeParseBody(req);
    if (!parsed.ok) return validationError(corsHeaders, parsed.error);
    const body = parsed.body;

    const unexpected = checkUnexpectedFields(body, [
      "guest_email", "billing_period", "referral_code", "referrer_id", "referral_code_id",
    ]);
    if (unexpected.length > 0) return validationError(corsHeaders, `Unexpected fields: ${unexpected.join(", ")}`);

    const guestEmail = typeof body.guest_email === "string" ? sanitize(body.guest_email as string).toLowerCase() : null;
    const billingPeriod = body.billing_period === "yearly" ? "yearly" : "monthly";
    const isYearly = billingPeriod === "yearly";

    let userEmail: string;
    let userId: string | null = null;

    // Try authenticated flow first
    const authHeader = req.headers.get("Authorization");
    if (authHeader && !guestEmail) {
      const token = authHeader.replace("Bearer ", "");
      const { data, error: userError } = await supabaseClient.auth.getUser(token);
      if (userError) throw new Error(`Authentication error: ${userError.message}`);
      const user = data.user;
      if (!user) throw new Error("User not authenticated");
      if (user.is_anonymous) throw new Error("Guest users cannot subscribe. Please create an account first.");
      if (!user.email) throw new Error("No email associated with this account");
      userEmail = user.email;
      userId = user.id;
    } else if (guestEmail) {
      if (!isValidEmail(guestEmail)) return validationError(corsHeaders, "Invalid email address");
      userEmail = guestEmail;
    } else {
      throw new Error("No authentication or email provided");
    }

    const referralCode = typeof body.referral_code === "string" ? sanitize(body.referral_code as string).toUpperCase().substring(0, 50) : null;
    const referrerId = typeof body.referrer_id === "string" ? sanitize(body.referrer_id as string).substring(0, 100) : null;
    const referralCodeId = typeof body.referral_code_id === "string" ? sanitize(body.referral_code_id as string).substring(0, 100) : null;

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const customers = await stripe.customers.list({ email: userEmail, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    const origin = req.headers.get("origin") || "http://localhost:3000";
    const priceId = isYearly ? YEARLY_PRICE_ID : MONTHLY_PRICE_ID;

    const sessionParams: any = {
      customer: customerId,
      customer_email: customerId ? undefined : userEmail,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      subscription_data: {
        trial_period_days: 30,
        metadata: {
          ...(userId && { user_id: userId }),
          source_app: SOURCE_APP,
          billing_period: billingPeriod,
          ...(referralCode && { referral_code: referralCode }),
          ...(referrerId && { referrer_id: referrerId }),
        },
      },
      metadata: {
        ...(userId && { user_id: userId }),
        source_app: SOURCE_APP,
        billing_period: billingPeriod,
        ...(referralCode && { referral_code: referralCode }),
        ...(referrerId && { referrer_id: referrerId }),
        ...(referralCodeId && { referral_code_id: referralCodeId }),
      },
      success_url: userId
        ? `${origin}/?upgrade_success=true`
        : `${origin}/auth?checkout_success=true&paid_email=${encodeURIComponent(userEmail)}`,
      cancel_url: `${origin}/pricing`,
    };

    // Apply referral discount coupon ONLY for monthly plans
    if (!isYearly && referralCode && referrerId) {
      sessionParams.discounts = [{ coupon: REFERRAL_COUPON_ID }];
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
