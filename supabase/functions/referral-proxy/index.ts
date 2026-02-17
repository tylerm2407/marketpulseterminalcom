import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const NOVA_WEALTH_URL = "https://dbwuegchdysuocbpsprd.supabase.co/functions/v1";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const crossAppSecret = Deno.env.get("CROSS_APP_SECRET");
  if (!crossAppSecret) {
    return new Response(JSON.stringify({ error: "CROSS_APP_SECRET not configured" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }

  try {
    const body = await req.json();
    const action = body.action; // "validate" or "track"

    let endpoint: string;
    let payload: any;

    if (action === "validate") {
      endpoint = `${NOVA_WEALTH_URL}/validate-referral`;
      payload = {
        referral_code: body.referral_code,
        user_email: body.user_email,
      };
    } else if (action === "track") {
      endpoint = `${NOVA_WEALTH_URL}/track-referral`;
      payload = {
        referral_code: body.referral_code,
        referrer_id: body.referrer_id,
        referred_email: body.referred_email,
        app_name: body.app_name || "MarketPulseTerminal",
      };
    } else {
      throw new Error("Invalid action. Use 'validate' or 'track'.");
    }

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-secret": crossAppSecret,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: res.status,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
