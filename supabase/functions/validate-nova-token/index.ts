import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { checkRateLimit, rateLimitResponse } from "../_shared/rateLimiter.ts";
import { safeParseBody, checkUnexpectedFields, validationError } from "../_shared/inputValidator.ts";

const ALLOWED_ORIGINS = ["https://marketpulseterminal.com", "https://www.marketpulseterminal.com", "http://localhost:5173", "http://localhost:3000"];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("origin") ?? "";
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  };
}

const NOVA_WEALTH_URL = "https://dbwuegchdysuocbpsprd.supabase.co";
const NOVA_WEALTH_ANON_KEY = Deno.env.get("NOVA_WEALTH_ANON_KEY") ?? "";

// Strict rate limit - this is a sensitive auth endpoint
const RATE_LIMIT = { functionName: "validate-nova-token", maxRequests: 10, windowSeconds: 300 };

const logStep = (step: string, details?: any) => {
  // Sanitize details to never log tokens or secrets
  const safe = details ? { ...details } : undefined;
  if (safe?.token) safe.token = "***";
  if (safe?.password) safe.password = "***";
  const detailsStr = safe ? ` - ${JSON.stringify(safe)}` : '';
  console.log(`[VALIDATE-NOVA-TOKEN] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(req) });
  }
  if (req.method !== "POST") return validationError(getCorsHeaders(req), "Method not allowed");

  try {
    const rl = await checkRateLimit(req, RATE_LIMIT);
    if (!rl.allowed) return rateLimitResponse(getCorsHeaders(req), rl.retryAfterSeconds!);

    const parsed = await safeParseBody(req, 10240); // 10KB max
    if (!parsed.ok) return validationError(getCorsHeaders(req), parsed.error);
    const body = parsed.body;

    const unexpected = checkUnexpectedFields(body, ["token"]);
    if (unexpected.length > 0) return validationError(getCorsHeaders(req), `Unexpected fields: ${unexpected.join(", ")}`);

    if (typeof body.token !== "string" || body.token.length < 10 || body.token.length > 500) {
      return validationError(getCorsHeaders(req), "Invalid token");
    }
    const token = body.token as string;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    logStep("Validating Nova Wealth token");

    // Step 1: Validate token with Nova Wealth backend
    const validateRes = await fetch(`${NOVA_WEALTH_URL}/functions/v1/validate-auth-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "apikey": NOVA_WEALTH_ANON_KEY },
      body: JSON.stringify({ token }),
    });

    const validateData = await validateRes.json();
    if (!validateData.valid) {
      logStep("Token invalid");
      return new Response(JSON.stringify({ error: "Invalid or expired token" }), {
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
        status: 401,
      });
    }

    const { email, user_id: novaUserId } = validateData;
    if (typeof email !== "string" || !email.includes("@")) {
      return validationError(getCorsHeaders(req), "Invalid response from auth provider");
    }
    logStep("Token validated", { email, novaUserId });

    // Step 2: Derive display name
    const displayName = email.split("@")[0];
    const avatarUrl: string | null = null;

    // Step 3: Create or find local user
    // TODO: implement pagination for >1000 users
    const { data: existingUsers } = await supabase.auth.admin.listUsers({ perPage: 1000, page: 1 });
    const existingUser = existingUsers?.users?.find((u: any) => u.email === email);

    let userId: string;

    if (existingUser) {
      userId = existingUser.id;
      logStep("Found existing user", { userId });
    } else {
      const randomPassword = crypto.randomUUID() + crypto.randomUUID();
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        password: randomPassword,
        email_confirm: true,
      });
      if (createError) throw new Error(`Failed to create user: ${createError.message}`);
      userId = newUser.user.id;
      logStep("Created new user", { userId });
    }

    // Step 4: Upsert profile
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({
        user_id: userId, display_name: displayName, avatar_url: avatarUrl,
        nova_wealth_linked: true, nova_wealth_user_id: novaUserId,
      }, { onConflict: "user_id" });

    if (profileError) {
      logStep("Profile upsert error (non-fatal)", { error: profileError.message });
    }

    // Step 5: Generate magic link for session
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: "magiclink", email,
    });

    if (linkError) throw new Error(`Failed to generate link: ${linkError.message}`);

    const hashedToken = linkData.properties?.hashed_token;
    if (!hashedToken) throw new Error("No hashed token returned");

    logStep("Magic link generated", { userId });

    return new Response(JSON.stringify({
      success: true, hashed_token: hashedToken, email, display_name: displayName,
    }), {
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: msg });
    // Don't expose internal error details
    return new Response(JSON.stringify({ error: "Authentication failed" }), {
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      status: 500,
    });
  }
});
