import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Nova Wealth backend config (public values)
const NOVA_WEALTH_URL = "https://dbwuegchdysuocbpsprd.supabase.co";
const NOVA_WEALTH_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRid3VlZ2NoZHlzdW9jYnBzcHJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExNzYyMTAsImV4cCI6MjA4Njc1MjIxMH0.6LEKjLXhaxeRublNoAITpVVueHwpUPuLxS0sbgcTUlE";

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VALIDATE-NOVA-TOKEN] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const { token } = await req.json();
    if (!token) throw new Error("token is required");
    logStep("Validating Nova Wealth token");

    // Step 1: Validate token with Nova Wealth backend
    const validateRes = await fetch(`${NOVA_WEALTH_URL}/functions/v1/validate-auth-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": NOVA_WEALTH_ANON_KEY,
      },
      body: JSON.stringify({ token }),
    });

    const validateData = await validateRes.json();
    if (!validateData.valid) {
      logStep("Token invalid", validateData);
      return new Response(JSON.stringify({ error: "Invalid or expired token" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const { email, user_id: novaUserId } = validateData;
    logStep("Token validated", { email, novaUserId });

    // Step 2: Fetch Nova Wealth profile info
    let displayName: string | null = null;
    let avatarUrl: string | null = null;
    try {
      const novaClient = createClient(NOVA_WEALTH_URL, NOVA_WEALTH_ANON_KEY, { auth: { persistSession: false } });
      // We can't read profiles with anon key due to RLS, so we'll use email as display name fallback
      displayName = email.split("@")[0];
    } catch {
      displayName = email.split("@")[0];
    }

    // Step 3: Create or find local user
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find((u: any) => u.email === email);

    let userId: string;

    if (existingUser) {
      userId = existingUser.id;
      logStep("Found existing user", { userId });
    } else {
      // Create new user with a random password (they'll auth via Nova Wealth tokens)
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

    // Step 4: Upsert profile with nova_wealth_linked = true
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({
        user_id: userId,
        display_name: displayName,
        avatar_url: avatarUrl,
        nova_wealth_linked: true,
        nova_wealth_user_id: novaUserId,
      }, { onConflict: "user_id" });

    if (profileError) {
      logStep("Profile upsert error (non-fatal)", { error: profileError.message });
    }

    // Step 5: Generate magic link for session
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email,
    });

    if (linkError) throw new Error(`Failed to generate link: ${linkError.message}`);

    const hashedToken = linkData.properties?.hashed_token;
    if (!hashedToken) throw new Error("No hashed token returned");

    logStep("Magic link generated", { userId });

    return new Response(JSON.stringify({
      success: true,
      hashed_token: hashedToken,
      email,
      display_name: displayName,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: msg });
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
