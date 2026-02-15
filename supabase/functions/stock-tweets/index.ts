import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ticker, companyName } = await req.json();
    if (!ticker) {
      return new Response(JSON.stringify({ error: "ticker is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const GROK_API_KEY = Deno.env.get("GROK_API_KEY");
    if (!GROK_API_KEY) {
      throw new Error("GROK_API_KEY is not configured");
    }

    const prompt = `Search X (Twitter) for the most relevant and trending tweets about ${companyName || ticker} (ticker: $${ticker}) from the last 48 hours.

Return EXACTLY 5-8 tweets in this JSON format (no markdown, no code fences, just raw JSON):
[
  {
    "username": "@handle",
    "displayName": "Display Name",
    "content": "The tweet text (keep it under 280 chars)",
    "likes": 1234,
    "retweets": 567,
    "timestamp": "2h ago",
    "sentiment": "bullish" | "bearish" | "neutral"
  }
]

Focus on tweets from:
- Financial analysts and traders
- News accounts covering $${ticker}
- Popular finance influencers
- Any viral tweets about the stock

Prioritize tweets with high engagement (likes/retweets). Include the actual tweet content. Return ONLY the JSON array, nothing else.`;

    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROK_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "grok-3-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a financial social media analyst with real-time access to X (Twitter). You find and summarize the most relevant trending tweets about stocks. Always return valid JSON arrays. Never wrap in markdown code fences.",
          },
          { role: "user", content: prompt },
        ],
        search_mode: "on",
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402 || response.status === 401) {
        return new Response(
          JSON.stringify({ error: "Grok API authentication failed. Check your API key." }),
          { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errText = await response.text();
      console.error("Grok API error:", response.status, errText);
      throw new Error(`Grok API returned ${response.status}`);
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || "[]";

    // Parse the JSON response, stripping any markdown fences if present
    let tweets: any[] = [];
    try {
      const cleaned = rawContent.replace(/```json?\n?/g, "").replace(/```\n?/g, "").trim();
      tweets = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse Grok tweet response:", rawContent.substring(0, 500));
      tweets = [];
    }

    return new Response(
      JSON.stringify({ tweets, generatedAt: new Date().toISOString() }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("stock-tweets error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
