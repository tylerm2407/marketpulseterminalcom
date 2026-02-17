import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { ticker, companyName, riskTitle, riskDescription, riskCategory, riskSeverity } = await req.json();

    // ── AI usage guard ──
    const userId = await getUserIdFromRequest(req);
    let aiNotification: any = undefined;
    if (userId) {
      const guard = await checkAndRecordAiUsage(userId, COST_ESTIMATES.RISK_EXPLAIN);
      if (guard.status === "blocked") return aiLimitResponse(corsHeaders, guard);
      aiNotification = guard.notification;
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are a stock market risk analyst. Provide a clear, educational explanation of a specific risk for a stock. Be factual and balanced — never give investment advice or buy/sell recommendations. Keep it under 150 words. Use plain language accessible to retail investors. Structure: 1) What this risk means, 2) Why it matters for this company specifically, 3) What investors typically watch for.`,
          },
          {
            role: "user",
            content: `Company: ${companyName} (${ticker})\nRisk: ${riskTitle}\nCategory: ${riskCategory}\nSeverity: ${riskSeverity}\nBrief description: ${riskDescription}\n\nExplain this risk in more detail.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited — please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const explanation = data.choices?.[0]?.message?.content || "No explanation available.";

    return new Response(JSON.stringify({ explanation, ...(aiNotification && { ai_usage_notification: aiNotification }) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("risk-explain error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
