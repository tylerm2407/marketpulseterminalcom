import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const NOVAWEALTH_URL =
  "https://dbwuegchdysuocbpsprd.supabase.co/functions/v1/verify-novawealth-subscription";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } }
  );

  try {
    const { user_id, email } = await req.json();
    if (!user_id || !email) {
      throw new Error("user_id and email are required");
    }

    const webhookSecret = Deno.env.get("NOVAWEALTH_WEBHOOK_SECRET");
    if (!webhookSecret) throw new Error("NOVAWEALTH_WEBHOOK_SECRET not configured");

    // Call external NovaWealth verification
    const nwRes = await fetch(NOVAWEALTH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-webhook-secret": webhookSecret,
      },
      body: JSON.stringify({ user_email: email }),
    });

    const nwData = await nwRes.json();
    console.log("[sync-novawealth] response:", JSON.stringify(nwData));

    const isSubscriber = nwData?.subscribed === true;

    // Upsert into user_access
    const { error: upsertError } = await supabase
      .from("user_access")
      .upsert(
        {
          id: user_id,
          email,
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
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
