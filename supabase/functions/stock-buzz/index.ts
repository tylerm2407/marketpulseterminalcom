import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { checkRateLimit, rateLimitResponse } from "../_shared/rateLimiter.ts";
import {
  safeParseBody, isValidTicker, sanitize, checkUnexpectedFields, validationError,
} from "../_shared/inputValidator.ts";
import {
  checkAndRecordAiUsage, aiLimitResponse, getUserIdFromRequest, COST_ESTIMATES,
} from "../_shared/aiUsageGuard.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const RATE_LIMIT = { functionName: "stock-buzz", maxRequests: 10, windowSeconds: 60 };

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return validationError(corsHeaders, "Method not allowed");

  try {
    const rl = await checkRateLimit(req, RATE_LIMIT);
    if (!rl.allowed) return rateLimitResponse(corsHeaders, rl.retryAfterSeconds!);

    const parsed = await safeParseBody(req);
    if (!parsed.ok) return validationError(corsHeaders, parsed.error);
    const body = parsed.body;

    const unexpected = checkUnexpectedFields(body, ["ticker", "companyName"]);
    if (unexpected.length > 0) return validationError(corsHeaders, `Unexpected fields: ${unexpected.join(", ")}`);

    if (!isValidTicker(body.ticker)) return validationError(corsHeaders, "Invalid ticker format");
    const ticker = (body.ticker as string).toUpperCase();
    const companyName = typeof body.companyName === "string" ? sanitize(body.companyName).substring(0, 100) : ticker;

    // AI usage guard
    const userId = await getUserIdFromRequest(req);
    let aiNotification: any = undefined;
    if (userId) {
      const guard = await checkAndRecordAiUsage(userId, COST_ESTIMATES.STOCK_BUZZ);
      if (guard.status === "blocked") return aiLimitResponse(corsHeaders, guard);
      aiNotification = guard.notification;
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("Server configuration error");

    const prompt = `You are a financial news analyst. Provide a concise summary of the latest buzz around ${companyName} (ticker: ${ticker}). Include:\n\n1. **Recent News** (last 24-48 hours): 2-3 key headlines or developments\n2. **Social Media Sentiment**: What people on X/Twitter and Reddit are saying — summarize the dominant sentiment (bullish/bearish/mixed) and any notable tweets or threads\n3. **Key Takeaway**: One sentence summarizing the overall market mood\n\nKeep it factual, concise, and under 300 words. Use bullet points. Do NOT give investment advice.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a financial markets analyst who summarizes the latest news, tweets, and social media buzz for stocks. Be concise, factual, and neutral." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
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
    const content = data.choices?.[0]?.message?.content || "No buzz available.";

    return new Response(JSON.stringify({ content, generatedAt: new Date().toISOString(), ...(aiNotification && { ai_usage_notification: aiNotification }) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("stock-buzz error:", e);
    return new Response(JSON.stringify({ error: "An error occurred processing your request" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
