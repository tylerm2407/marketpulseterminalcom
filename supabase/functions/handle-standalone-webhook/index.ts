import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-webhook-secret, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Validate webhook secret
  const secret = req.headers.get("x-webhook-secret");
  const expected = Deno.env.get("NOVAWEALTH_WEBHOOK_SECRET");
  if (!expected || secret !== expected) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } }
  );

  try {
    const body = await req.json();
    console.log("[standalone-webhook] payload:", JSON.stringify(body));

    // Support RevenueCat webhook format or simple { email, active } format
    const email: string | undefined =
      body?.event?.subscriber?.email ||
      body?.subscriber_attributes?.["$email"]?.value ||
      body?.email;

    const isActive: boolean =
      body?.event?.type === "INITIAL_PURCHASE" ||
      body?.event?.type === "RENEWAL" ||
      body?.event?.type === "UNCANCELLATION" ||
      body?.active === true;

    const isCancelled: boolean =
      body?.event?.type === "CANCELLATION" ||
      body?.event?.type === "EXPIRATION" ||
      body?.active === false;

    if (!email) {
      throw new Error("No email found in webhook payload");
    }

    const standaloneValue = isCancelled ? false : isActive;

    // Find user by email in auth, then upsert user_access
    const { data: users } = await supabase.auth.admin.listUsers();
    const matchedUser = users?.users?.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );

    if (!matchedUser) {
      console.warn("[standalone-webhook] No user found for email:", email);
      return new Response(
        JSON.stringify({ success: false, reason: "user_not_found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    const { error } = await supabase.from("user_access").upsert(
      {
        id: matchedUser.id,
        email,
        standalone_subscriber: standaloneValue,
      },
      { onConflict: "id" }
    );

    if (error) throw new Error(error.message);

    console.log(
      `[standalone-webhook] Updated user ${matchedUser.id}: standalone_subscriber=${standaloneValue}`
    );

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[standalone-webhook] ERROR:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
