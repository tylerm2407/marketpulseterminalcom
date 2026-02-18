import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

/**
 * Post a Stripe subscription to RevenueCat so it can track
 * the subscription status, renewals, and cancellations.
 *
 * RevenueCat Stripe integration docs:
 * https://www.revenuecat.com/docs/stripe
 */
async function postToRevenueCat(
  stripeSubscriptionId: string,
  appUserId: string
) {
  const revenueCatApiKey = Deno.env.get("REVENUECAT_API_KEY");
  if (!revenueCatApiKey) throw new Error("REVENUECAT_API_KEY is not set");

  const url = "https://api.revenuecat.com/v1/receipts";

  const body = JSON.stringify({
    app_user_id: appUserId,
    fetch_token: stripeSubscriptionId,
  });

  logStep("Posting to RevenueCat", { appUserId, stripeSubscriptionId });

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${revenueCatApiKey}`,
      "Content-Type": "application/json",
      "X-Platform": "stripe",
    },
    body,
  });

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(
      `RevenueCat API error ${response.status}: ${responseText}`
    );
  }

  logStep("RevenueCat response", { status: response.status });
  return responseText;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    if (!webhookSecret) throw new Error("STRIPE_WEBHOOK_SECRET is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Verify the webhook signature from Stripe
    const signature = req.headers.get("stripe-signature");
    if (!signature) throw new Error("Missing stripe-signature header");

    const rawBody = await req.text();
    let event: Stripe.Event;

    try {
      event = await stripe.webhooks.constructEventAsync(
        rawBody,
        signature,
        webhookSecret
      );
    } catch (err) {
      logStep("Webhook signature verification failed", { err });
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    logStep("Received event", { type: event.type, id: event.id });

    // Events we care about for RevenueCat sync
    const relevantEvents = new Set([
      "customer.subscription.created",
      "customer.subscription.updated",
      "customer.subscription.deleted",
      "invoice.payment_succeeded",
      "invoice.payment_failed",
    ]);

    if (!relevantEvents.has(event.type)) {
      logStep("Ignoring irrelevant event", { type: event.type });
      return new Response(JSON.stringify({ received: true, skipped: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Extract the subscription from the event
    let subscription: Stripe.Subscription | null = null;

    if (
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      subscription = event.data.object as Stripe.Subscription;
    } else if (
      event.type === "invoice.payment_succeeded" ||
      event.type === "invoice.payment_failed"
    ) {
      const invoice = event.data.object as Stripe.Invoice;
      if (invoice.subscription) {
        subscription = await stripe.subscriptions.retrieve(
          invoice.subscription as string
        );
      }
    }

    if (!subscription) {
      logStep("No subscription found in event");
      return new Response(JSON.stringify({ received: true, skipped: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const stripeSubscriptionId = subscription.id;
    const stripeCustomerId = subscription.customer as string;

    // Look up the Supabase user via their email (same strategy as check-subscription)
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get customer email from Stripe
    const customer = await stripe.customers.retrieve(stripeCustomerId);
    if (customer.deleted) {
      logStep("Customer deleted, skipping");
      return new Response(JSON.stringify({ received: true, skipped: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerEmail = (customer as Stripe.Customer).email;
    if (!customerEmail) {
      logStep("No customer email found");
      return new Response(JSON.stringify({ received: true, skipped: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    logStep("Looking up Supabase user", { email: customerEmail });

    // Find the Supabase user by email
    const { data: users, error: userError } =
      await supabaseClient.auth.admin.listUsers();

    if (userError) throw new Error(`Error listing users: ${userError.message}`);

    const supabaseUser = users?.users?.find(
      (u) => u.email === customerEmail
    );

    if (!supabaseUser) {
      logStep("No Supabase user found for email", { email: customerEmail });
      return new Response(
        JSON.stringify({ received: true, error: "User not found" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    logStep("Found Supabase user", { userId: supabaseUser.id });

    // Post to RevenueCat using subscription ID + Supabase user ID
    await postToRevenueCat(stripeSubscriptionId, supabaseUser.id);

    logStep("Successfully synced to RevenueCat", {
      event: event.type,
      subscriptionId: stripeSubscriptionId,
      userId: supabaseUser.id,
    });

    return new Response(
      JSON.stringify({ received: true, synced_to_revenuecat: true }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message });
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
