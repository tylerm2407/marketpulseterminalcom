import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { checkRateLimit, rateLimitResponse } from "../_shared/rateLimiter.ts";
import {
  safeParseBody, sanitize, checkUnexpectedFields, validationError,
} from "../_shared/inputValidator.ts";
import {
  checkAndRecordAiUsage, aiLimitResponse, getUserIdFromRequest, COST_ESTIMATES,
} from "../_shared/aiUsageGuard.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const RATE_LIMIT = { functionName: "news-summarize", maxRequests: 15, windowSeconds: 60 };

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return validationError(corsHeaders, "Method not allowed");

  try {
    const rl = await checkRateLimit(req, RATE_LIMIT);
    if (!rl.allowed) return rateLimitResponse(corsHeaders, rl.retryAfterSeconds!);

    const parsed = await safeParseBody(req);
    if (!parsed.ok) return validationError(corsHeaders, parsed.error);
    const body = parsed.body;

    const unexpected = checkUnexpectedFields(body, ["title", "text", "site"]);
    if (unexpected.length > 0) return validationError(corsHeaders, `Unexpected fields: ${unexpected.join(", ")}`);

    if (typeof body.title !== "string" || body.title.trim().length === 0 || body.title.length > 500) {
      return validationError(corsHeaders, "title is required (1-500 chars)");
    }
    const title = sanitize(body.title as string);
    const text = typeof body.text === "string" ? sanitize(body.text as string).substring(0, 2000) : "No excerpt available.";
    const site = typeof body.site === "string" ? sanitize(body.site as string).substring(0, 100) : "Unknown";

    const userId = await getUserIdFromRequest(req);
    let aiNotification: any = undefined;
    if (userId) {
      const guard = await checkAndRecordAiUsage(userId, COST_ESTIMATES.STOCK_BUZZ);
      if (guard.status === "blocked") return aiLimitResponse(corsHeaders, guard);
      aiNotification = guard.notification;
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("Server configuration error");

    const prompt = `Summarize this financial news article in 3-4 concise bullet points. Focus on the key facts, market impact, and what investors should know.\n\nTitle: ${title}\nExcerpt: ${text}\nSource: ${site}\n\nKeep each bullet point to 1-2 sentences. Be factual and neutral. Do NOT give investment advice.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a concise financial news summarizer. Output clear bullet points." },
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
    const content = data.choices?.[0]?.message?.content || "Unable to summarize.";

    return new Response(JSON.stringify({ summary: content, ...(aiNotification && { ai_usage_notification: aiNotification }) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("news-summarize error:", e);
    return new Response(JSON.stringify({ error: "An error occurred processing your request" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
