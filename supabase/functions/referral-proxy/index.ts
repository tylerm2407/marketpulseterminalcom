import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { checkRateLimit, rateLimitResponse } from "../_shared/rateLimiter.ts";
import {
  safeParseBody, sanitize, checkUnexpectedFields, validationError, isValidEmail,
} from "../_shared/inputValidator.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const NOVA_WEALTH_URL = "https://dbwuegchdysuocbpsprd.supabase.co/functions/v1";
const RATE_LIMIT = { functionName: "referral-proxy", maxRequests: 10, windowSeconds: 60 };

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") return validationError(corsHeaders, "Method not allowed");

  const crossAppSecret = Deno.env.get("CROSS_APP_SECRET");
  if (!crossAppSecret) {
    return new Response(JSON.stringify({ error: "Server configuration error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }

  try {
    const rl = await checkRateLimit(req, RATE_LIMIT);
    if (!rl.allowed) return rateLimitResponse(corsHeaders, rl.retryAfterSeconds!);

    const parsed = await safeParseBody(req, 10240);
    if (!parsed.ok) return validationError(corsHeaders, parsed.error);
    const body = parsed.body;

    const action = body.action;
    if (action !== "validate" && action !== "track") {
      return validationError(corsHeaders, "Invalid action. Use 'validate' or 'track'.");
    }

    let endpoint: string;
    let payload: any;

    if (action === "validate") {
      const unexpected = checkUnexpectedFields(body, ["action", "referral_code", "user_email"]);
      if (unexpected.length > 0) return validationError(corsHeaders, `Unexpected fields: ${unexpected.join(", ")}`);

      if (typeof body.referral_code !== "string" || body.referral_code.length > 50) {
        return validationError(corsHeaders, "Invalid referral_code");
      }
      if (body.user_email && !isValidEmail(body.user_email)) {
        return validationError(corsHeaders, "Invalid user_email");
      }

      endpoint = `${NOVA_WEALTH_URL}/validate-referral`;
      payload = {
        referral_code: sanitize(body.referral_code as string),
        user_email: body.user_email ? sanitize(body.user_email as string) : undefined,
      };
    } else {
      const unexpected = checkUnexpectedFields(body, ["action", "referral_code", "referrer_id", "referred_email", "app_name"]);
      if (unexpected.length > 0) return validationError(corsHeaders, `Unexpected fields: ${unexpected.join(", ")}`);

      if (typeof body.referral_code !== "string" || body.referral_code.length > 50) {
        return validationError(corsHeaders, "Invalid referral_code");
      }
      if (typeof body.referrer_id !== "string" || body.referrer_id.length > 100) {
        return validationError(corsHeaders, "Invalid referrer_id");
      }
      if (!isValidEmail(body.referred_email)) {
        return validationError(corsHeaders, "Invalid referred_email");
      }

      endpoint = `${NOVA_WEALTH_URL}/track-referral`;
      payload = {
        referral_code: sanitize(body.referral_code as string),
        referrer_id: sanitize(body.referrer_id as string),
        referred_email: sanitize(body.referred_email as string),
        app_name: typeof body.app_name === "string" ? sanitize(body.app_name as string).substring(0, 50) : "MarketPulseTerminal",
      };
    }

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-secret": crossAppSecret },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: res.status,
    });
  } catch (error) {
    console.error("referral-proxy error:", error);
    return new Response(JSON.stringify({ error: "An error occurred processing your request" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
