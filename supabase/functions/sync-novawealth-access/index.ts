import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { checkRateLimit, rateLimitResponse } from "../_shared/rateLimiter.ts";
import { safeParseBody, isValidEmail, isValidUUID, checkUnexpectedFields, validationError } from "../_shared/inputValidator.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const RATE_LIMIT = { functionName: "sync-novawealth-access", maxRequests: 5, windowSeconds: 60 };

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return validationError(corsHeaders, "Method not allowed");

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } }
  );

  try {
    const rl = await checkRateLimit(req, RATE_LIMIT);
    if (!rl.allowed) return rateLimitResponse(corsHeaders, rl.retryAfterSeconds!);

    // Verify the caller is authenticated and matches the user_id being synced
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const token = authHeader.replace("Bearer ", "");
    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const parsed = await safeParseBody(req, 10240);
    if (!parsed.ok) return validationError(corsHeaders, parsed.error);
    const body = parsed.body;

    const unexpected = checkUnexpectedFields(body, ["user_id", "email"]);
    if (unexpected.length > 0) return validationError(corsHeaders, `Unexpected fields: ${unexpected.join(", ")}`);

    if (!isValidUUID(body.user_id)) return validationError(corsHeaders, "Invalid user_id");
    if (!isValidEmail(body.email)) return validationError(corsHeaders, "Invalid email");

    const user_id = body.user_id as string;
    const email = body.email as string;

    // Verify the authenticated user matches the requested user_id
    if (authData.user.id !== user_id) {
      return new Response(JSON.stringify({ error: "Forbidden: user_id mismatch" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const verifyUrl = Deno.env.get("NOVAWEALTH_VERIFY_URL");
    if (!verifyUrl) throw new Error("Server configuration error");

    const webhookSecret = Deno.env.get("NOVAWEALTH_WEBHOOK_SECRET");
    if (!webhookSecret) throw new Error("Server configuration error");

    // Call external NovaWealth verification
    const nwRes = await fetch(verifyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-webhook-secret": webhookSecret },
      body: JSON.stringify({ user_email: email }),
    });

    const nwData = await nwRes.json();
    const isSubscriber = nwData?.novawealth_subscriber === true;

    // Upsert into user_access
    const { error: upsertError } = await supabase
      .from("user_access")
      .upsert(
        {
          id: user_id, email,
          novawealth_subscriber: isSubscriber,
          last_novawealth_check: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

    if (upsertError) {
      console.error("[sync-novawealth] upsert error:", upsertError);
      throw new Error(upsertError.message);
    }

    return new Response(
      JSON.stringify({ novawealth_subscriber: isSubscriber }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[sync-novawealth] ERROR:", msg);
    return new Response(JSON.stringify({ error: "An error occurred" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
