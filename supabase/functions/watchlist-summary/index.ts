import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { checkRateLimit, rateLimitResponse } from "../_shared/rateLimiter.ts";
import {
  safeParseBody, validateTickerArray, sanitize, checkUnexpectedFields, validationError,
} from "../_shared/inputValidator.ts";
import {
  checkAndRecordAiUsage, aiLimitResponse, getUserIdFromRequest, COST_ESTIMATES,
} from "../_shared/aiUsageGuard.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const RATE_LIMIT = { functionName: "watchlist-summary", maxRequests: 5, windowSeconds: 60 };

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return validationError(corsHeaders, "Method not allowed");

  try {
    const rl = await checkRateLimit(req, RATE_LIMIT);
    if (!rl.allowed) return rateLimitResponse(corsHeaders, rl.retryAfterSeconds!);

    const parsed = await safeParseBody(req);
    if (!parsed.ok) return validationError(corsHeaders, parsed.error);
    const body = parsed.body;

    const unexpected = checkUnexpectedFields(body, ["tickers", "period"]);
    if (unexpected.length > 0) return validationError(corsHeaders, `Unexpected fields: ${unexpected.join(", ")}`);

    const v = validateTickerArray(body.tickers, 30);
    if (!v.valid) return validationError(corsHeaders, v.error);

    const period = body.period === "weekly" ? "weekly" : "daily";

    // AI usage guard
    const userId = await getUserIdFromRequest(req);
    let aiNotification: any = undefined;
    if (userId) {
      const guard = await checkAndRecordAiUsage(userId, COST_ESTIMATES.WATCHLIST_SUMMARY);
      if (guard.status === "blocked") return aiLimitResponse(corsHeaders, guard);
      aiNotification = guard.notification;
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("Server configuration error");

    const timeframe = period === "weekly" ? "past week" : "past 24 hours";
    const tickerList = v.tickers.join(", ");

    const prompt = `You are a financial news analyst. Provide a detailed ${period === "weekly" ? "weekly" : "daily"} summary for the following stocks: ${tickerList}.\n\nFor EACH stock, include:\n1. **Key Developments** (${timeframe}): The most significant news, earnings, product launches, regulatory actions, or market-moving events\n2. **Market Sentiment**: Overall market mood — bullish, bearish, or mixed — based on news coverage and social media (X/Twitter, Reddit)\n3. **Price Action Context**: Brief note on notable price movements if relevant\n\nThen provide:\n4. **Cross-Portfolio Themes**: Common trends or macro factors affecting multiple stocks in this watchlist\n5. **Watch This Week/Today**: 1-2 upcoming catalysts or events to keep an eye on\n\nKeep it factual, concise, and under 600 words total. Use bullet points and organize by ticker. Do NOT give investment advice or buy/sell/hold recommendations. This is informational only.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a financial markets analyst providing watchlist summaries. Be factual, neutral, and never provide investment advice or buy/sell/hold recommendations." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      throw new Error("AI service error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "No summary available.";

    return new Response(
      JSON.stringify({ content, period, tickers: v.tickers, generatedAt: new Date().toISOString(), ...(aiNotification && { ai_usage_notification: aiNotification }) }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("watchlist-summary error:", e);
    return new Response(JSON.stringify({ error: "An error occurred processing your request" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
