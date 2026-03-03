import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { checkRateLimit, rateLimitResponse } from "../_shared/rateLimiter.ts";
import {
  safeParseBody, sanitize, checkUnexpectedFields, validationError,
} from "../_shared/inputValidator.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const NOVA_URL = "https://dbwuegchdysuocbpsprd.supabase.co/functions/v1";
const SOURCE_APP = "marketpulse_terminal";
const RATE_LIMIT = { functionName: "referral-proxy", maxRequests: 15, windowSeconds: 60 };

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") return validationError(corsHeaders, "Method not allowed");

  const crossAppSecret = Deno.env.get("CROSS_APP_SECRET");
  if (!crossAppSecret) {
    return new Response(JSON.stringify({ error: "Server configuration error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500,
    });
  }

  try {
    const rl = await checkRateLimit(req, RATE_LIMIT);
    if (!rl.allowed) return rateLimitResponse(corsHeaders, rl.retryAfterSeconds!);

    const parsed = await safeParseBody(req, 10240);
    if (!parsed.ok) return validationError(corsHeaders, parsed.error);
    const body = parsed.body;

    const action = body.action;
    const validActions = ["validate", "track", "get-data"];
    if (!validActions.includes(action as string)) {
      return validationError(corsHeaders, `Invalid action. Use: ${validActions.join(", ")}`);
    }

    // Get user JWT for user-facing calls
    const authHeader = req.headers.get("Authorization") || "";
    const userJwt = authHeader.replace("Bearer ", "");

    // ── validate-referral ──
    if (action === "validate") {
      const unexpected = checkUnexpectedFields(body, ["action", "referral_code", "referred_user_id"]);
      if (unexpected.length > 0) return validationError(corsHeaders, `Unexpected fields: ${unexpected.join(", ")}`);

      if (typeof body.referral_code !== "string" || body.referral_code.length > 50) {
        return validationError(corsHeaders, "Invalid referral_code");
      }

      const payload = {
        referral_code: sanitize(body.referral_code as string).toUpperCase(),
        source_app: SOURCE_APP,
        referred_user_id: body.referred_user_id ? sanitize(body.referred_user_id as string) : null,
      };

      // Always use x-api-secret for validation — the supabase client auto-injects the
      // anon key as Authorization, which NovaWealth would reject as an invalid JWT.
      const res = await fetch(`${NOVA_URL}/validate-referral`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-secret": crossAppSecret,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      // Map central response to what the frontend expects
      if (data.valid) {
        return new Response(JSON.stringify({
          valid: true,
          referrer_id: data.referrer_user_id,
          referral_code_id: data.referral_code_id,
          code: payload.referral_code,
          discount_percent: data.discount?.value || 20,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200,
        });
      } else {
        return new Response(JSON.stringify({
          valid: false,
          error: mapInvalidReason(data.reason),
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200,
        });
      }
    }

    // ── track-referral ──
    if (action === "track") {
      const unexpected = checkUnexpectedFields(body, [
        "action", "referral_code", "referral_code_id", "referrer_user_id", "referred_user_id", "event",
      ]);
      if (unexpected.length > 0) return validationError(corsHeaders, `Unexpected fields: ${unexpected.join(", ")}`);

      if (typeof body.referral_code !== "string") return validationError(corsHeaders, "Invalid referral_code");
      if (typeof body.referred_user_id !== "string") return validationError(corsHeaders, "Invalid referred_user_id");

      const validEvents = ["signup", "subscription_created", "first_payment"];
      const event = validEvents.includes(body.event as string) ? body.event : "signup";

      const payload = {
        referral_code: sanitize(body.referral_code as string).toUpperCase(),
        referral_code_id: body.referral_code_id ? sanitize(body.referral_code_id as string) : undefined,
        referrer_user_id: body.referrer_user_id ? sanitize(body.referrer_user_id as string) : undefined,
        referred_user_id: sanitize(body.referred_user_id as string),
        source_app: SOURCE_APP,
        event,
      };

      const res = await fetch(`${NOVA_URL}/track-referral`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-secret": crossAppSecret,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: res.status,
      });
    }

    // ── get-referral-data ──
    if (action === "get-data") {
      if (!userJwt) {
        return new Response(JSON.stringify({ error: "Authentication required" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401,
        });
      }

      const res = await fetch(`${NOVA_URL}/get-referral-data`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${userJwt}` },
      });

      const data = await res.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: res.status,
      });
    }

    return validationError(corsHeaders, "Unknown action");
  } catch (error) {
    console.error("referral-proxy error:", error);
    return new Response(JSON.stringify({ error: "An error occurred processing your request" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500,
    });
  }
});

function mapInvalidReason(reason: string | null): string {
  switch (reason) {
    case "expired_or_not_found": return "That referral code is invalid or expired.";
    case "self_referral": return "You cannot use your own referral code.";
    case "already_used_for_app": return "You've already used a referral code for this app.";
    case "no_code_provided": return "No referral code provided.";
    default: return "Invalid referral code.";
  }
}
