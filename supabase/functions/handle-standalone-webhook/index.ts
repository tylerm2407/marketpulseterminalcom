import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { checkRateLimit, rateLimitResponse } from "../_shared/rateLimiter.ts";
import { safeParseBody, isValidEmail, validationError } from "../_shared/inputValidator.ts";

const ALLOWED_ORIGINS = ["https://marketpulseterminal.com", "https://www.marketpulseterminal.com", "http://localhost:5173", "http://localhost:3000"];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("origin") ?? "";
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-secret, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  };
}

// Webhook endpoint: strict rate limit
const RATE_LIMIT = { functionName: "handle-standalone-webhook", maxRequests: 20, windowSeconds: 60 };

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(req) });
  }
  if (req.method !== "POST") return validationError(getCorsHeaders(req), "Method not allowed");

  // Validate webhook secret
  const secret = req.headers.get("x-webhook-secret");
  const expected = Deno.env.get("NOVAWEALTH_WEBHOOK_SECRET");
  if (!expected || secret !== expected) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } }
  );

  try {
    const rl = await checkRateLimit(req, RATE_LIMIT);
    if (!rl.allowed) return rateLimitResponse(getCorsHeaders(req), rl.retryAfterSeconds!);

    const parsed = await safeParseBody(req, 51200); // 50KB max for webhook payloads
    if (!parsed.ok) return validationError(getCorsHeaders(req), parsed.error);
    const body = parsed.body as any;

    // Support RevenueCat webhook format or simple { email, active } format
    const email: string | undefined =
      body?.event?.subscriber?.email ||
      body?.subscriber_attributes?.["$email"]?.value ||
      body?.email;

    if (!email || !isValidEmail(email)) {
      return validationError(getCorsHeaders(req), "No valid email found in webhook payload");
    }

    const isActive: boolean =
      body?.event?.type === "INITIAL_PURCHASE" ||
      body?.event?.type === "RENEWAL" ||
      body?.event?.type === "UNCANCELLATION" ||
      body?.active === true;

    const isCancelled: boolean =
      body?.event?.type === "CANCELLATION" ||
      body?.event?.type === "EXPIRATION" ||
      body?.active === false;

    const standaloneValue = isCancelled ? false : isActive;

    // Find user by email in auth, then upsert user_access
    // TODO: implement pagination for >1000 users
    const { data: users } = await supabase.auth.admin.listUsers({ perPage: 1000, page: 1 });
    const matchedUser = users?.users?.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );

    if (!matchedUser) {
      console.warn("[standalone-webhook] No user found for email");
      return new Response(
        JSON.stringify({ success: false, reason: "user_not_found" }),
        { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" }, status: 200 }
      );
    }

    const { error } = await supabase.from("user_access").upsert(
      { id: matchedUser.id, email, standalone_subscriber: standaloneValue },
      { onConflict: "id" }
    );

    if (error) throw new Error(error.message);

    console.log(`[standalone-webhook] Updated user ${matchedUser.id}: standalone_subscriber=${standaloneValue}`);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[standalone-webhook] ERROR:", msg);
    return new Response(JSON.stringify({ error: "Processing error" }), {
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      status: 500,
    });
  }
});
