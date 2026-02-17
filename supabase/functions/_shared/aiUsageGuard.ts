import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

// ─── Cost caps (in cents) ───────────────────────────────────
export const AI_COST_CAP_HARD_CENTS = 1000; // $10.00
export const AI_COST_CAP_SOFT_CENTS = 500;  // $5.00

// ─── Per-call cost estimates (cents) ────────────────────────
// Lovable AI gateway (Gemini Flash etc.) — ~0.15¢/1k input, ~0.6¢/1k output
// Conservative estimate: average call ≈ 2–5 cents
export function estimateChatCostCents(inputTokens: number, outputTokens: number): number {
  // Gemini Flash pricing approximation
  const inputCost = (inputTokens / 1000) * 0.15;
  const outputCost = (outputTokens / 1000) * 0.6;
  return Math.max(1, Math.ceil(inputCost + outputCost));
}

// Fixed estimates when token counts aren't known ahead of time
export const COST_ESTIMATES = {
  CHAT_DEFAULT: 3,       // ~3 cents for a typical chat completion
  SCREENER: 4,           // slightly more tokens
  WATCHLIST_SUMMARY: 5,  // longer output
  STOCK_BUZZ: 3,
  RISK_EXPLAIN: 2,       // short explanation
  STOCK_TWEETS: 4,       // Grok call, similar cost
  EMBEDDING: 1,          // if ever needed
} as const;

// ─── Guard result ───────────────────────────────────────────
export type AiGuardResult = "ok" | "soft_cap" | "hard_cap";

function getSupabaseAdmin() {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key);
}

function getCurrentPeriodStart(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-01`;
}

/**
 * Check and record AI usage for a user. Must be called BEFORE any external AI call.
 * Uses upsert + atomic increment to avoid race conditions.
 */
export async function checkAndRecordAiUsage(
  userId: string,
  estimatedCostCents: number
): Promise<AiGuardResult> {
  const sb = getSupabaseAdmin();
  const periodStart = getCurrentPeriodStart();

  // Upsert to ensure the row exists
  await sb.from("ai_usage").upsert(
    { user_id: userId, period_start: periodStart, total_cost_cents: 0, total_requests: 0 },
    { onConflict: "user_id,period_start", ignoreDuplicates: true }
  );

  // Read current usage
  const { data, error } = await sb
    .from("ai_usage")
    .select("total_cost_cents, total_requests")
    .eq("user_id", userId)
    .eq("period_start", periodStart)
    .single();

  if (error || !data) {
    console.error("ai_usage read error:", error);
    // Fail open cautiously — allow but log
    return "ok";
  }

  const currentCost = data.total_cost_cents as number;
  const projectedCost = currentCost + estimatedCostCents;

  // Hard cap check
  if (projectedCost > AI_COST_CAP_HARD_CENTS) {
    return "hard_cap";
  }

  // Soft cap check (also blocking)
  if (currentCost >= AI_COST_CAP_SOFT_CENTS) {
    return "soft_cap";
  }

  // Under budget — increment atomically via RPC or direct update
  const currentRequests = (data.total_requests as number) || 0;
  const { error: updateError } = await sb
    .from("ai_usage")
    .update({
      total_cost_cents: projectedCost,
      total_requests: currentRequests + 1,
      last_updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .eq("period_start", periodStart);

  if (updateError) {
    console.error("ai_usage update error:", updateError);
  }

  return "ok";
}

/** Standard JSON error response for capped users */
export function aiLimitResponse(corsHeaders: Record<string, string>, capType: AiGuardResult) {
  const limitDollars = capType === "hard_cap" ? 10 : 5;
  return new Response(
    JSON.stringify({
      error: "ai_limit_reached",
      message:
        "You've reached your monthly AI usage limit. To keep costs under control, further AI features are paused for this month.",
      limit_dollars: limitDollars,
    }),
    {
      status: 429,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}

/**
 * Extract user_id from the Authorization header (JWT).
 * Returns null if no valid token / anonymous.
 */
export async function getUserIdFromRequest(req: Request): Promise<string | null> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.replace("Bearer ", "");

  // Don't validate against anon key
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY");
  if (token === anonKey) return null;

  try {
    const sb = getSupabaseAdmin();
    const { data, error } = await sb.auth.getUser(token);
    if (error || !data?.user) return null;
    return data.user.id;
  } catch {
    return null;
  }
}
