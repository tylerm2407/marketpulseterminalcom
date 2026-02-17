import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import {
  checkAndRecordAiUsage,
  aiLimitResponse,
  getUserIdFromRequest,
  COST_ESTIMATES,
} from "../_shared/aiUsageGuard.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CACHE_TTL_SECONDS = 15 * 60;

function getSupabaseAdmin() {
  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey);
}

async function getFromCache(key: string): Promise<any | null> {
  try {
    const sb = getSupabaseAdmin();
    if (!sb) return null;
    const { data, error } = await sb.from("api_cache").select("data, expires_at").eq("cache_key", key).single();
    if (error || !data) return null;
    if (new Date(data.expires_at) < new Date()) {
      sb.from("api_cache").delete().eq("cache_key", key).then(() => {});
      return null;
    }
    console.log(`Cache HIT: ${key}`);
    return data.data;
  } catch { return null; }
}

async function setCache(key: string, data: any): Promise<void> {
  try {
    const sb = getSupabaseAdmin();
    if (!sb) return;
    const expiresAt = new Date(Date.now() + CACHE_TTL_SECONDS * 1000).toISOString();
    await sb.from("api_cache").upsert(
      { cache_key: key, data, cached_at: new Date().toISOString(), expires_at: expiresAt },
      { onConflict: "cache_key" }
    );
    console.log(`Cache SET: ${key} (TTL ${CACHE_TTL_SECONDS}s)`);
  } catch (err) { console.warn("Cache write failed:", err); }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { ticker, companyName } = await req.json();
    if (!ticker) {
      return new Response(JSON.stringify({ error: "ticker is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const upperTicker = ticker.toUpperCase();
    const cacheKey = `tweets:${upperTicker}`;

    // Check cache first (no usage cost if cached)
    const cached = await getFromCache(cacheKey);
    if (cached) {
      return new Response(JSON.stringify(cached), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── AI usage guard (only if cache miss) ──
    const userId = await getUserIdFromRequest(req);
    let aiNotification: any = undefined;
    if (userId) {
      const guard = await checkAndRecordAiUsage(userId, COST_ESTIMATES.STOCK_TWEETS);
      if (guard.status === "blocked") return aiLimitResponse(corsHeaders, guard);
      aiNotification = guard.notification;
    }

    const GROK_API_KEY = Deno.env.get("GROK_API_KEY");
    if (!GROK_API_KEY) throw new Error("GROK_API_KEY is not configured");

    const prompt = `Search X (Twitter) for the most relevant and trending tweets about ${companyName || upperTicker} (ticker: $${upperTicker}) from the last 48 hours.\n\nReturn EXACTLY 5-8 tweets in this JSON format (no markdown, no code fences, just raw JSON):\n[\n  {\n    "username": "@handle",\n    "displayName": "Display Name",\n    "content": "The tweet text (keep it under 280 chars)",\n    "likes": 1234,\n    "retweets": 567,\n    "timestamp": "2h ago",\n    "sentiment": "bullish" | "bearish" | "neutral"\n  }\n]\n\nFocus on tweets from:\n- Financial analysts and traders\n- News accounts covering $${upperTicker}\n- Popular finance influencers\n- Any viral tweets about the stock\n\nPrioritize tweets with high engagement (likes/retweets). Include the actual tweet content. Return ONLY the JSON array, nothing else.`;

    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROK_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "grok-3-mini",
        messages: [
          { role: "system", content: "You are a financial social media analyst with real-time access to X (Twitter). You find and summarize the most relevant trending tweets about stocks. Always return valid JSON arrays. Never wrap in markdown code fences." },
          { role: "user", content: prompt },
        ],
        search_mode: "on",
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402 || response.status === 401) {
        return new Response(JSON.stringify({ error: "Grok API authentication failed. Check your API key." }), {
          status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("Grok API error:", response.status, errText);
      throw new Error(`Grok API returned ${response.status}`);
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || "[]";

    let tweets: any[] = [];
    try {
      const cleaned = rawContent.replace(/```json?\n?/g, "").replace(/```\n?/g, "").trim();
      tweets = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse Grok tweet response:", rawContent.substring(0, 500));
      tweets = [];
    }

    const result = { tweets, generatedAt: new Date().toISOString(), ...(aiNotification && { ai_usage_notification: aiNotification }) };
    if (tweets.length > 0) await setCache(cacheKey, result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("stock-tweets error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
