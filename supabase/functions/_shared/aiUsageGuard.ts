import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

// ─── Cost cap (in cents) ────────────────────────────────────
export const AI_COST_CAP_CENTS = 1000; // $10.00 per user per month

// ─── Notification thresholds (in cents) ─────────────────────
const MILESTONE_HALF = 500;          // $5.00 — 50%
const MILESTONE_THREE_QUARTER = 750; // $7.50 — 75%

// ─── Per-call cost estimates (cents) ────────────────────────
export function estimateChatCostCents(inputTokens: number, outputTokens: number): number {
  const inputCost = (inputTokens / 1000) * 0.15;
  const outputCost = (outputTokens / 1000) * 0.6;
  return Math.max(1, Math.ceil(inputCost + outputCost));
}

export const COST_ESTIMATES = {
  CHAT_DEFAULT: 3,
  SCREENER: 4,
  WATCHLIST_SUMMARY: 5,
  STOCK_BUZZ: 3,
  RISK_EXPLAIN: 2,
  STOCK_TWEETS: 4,
  EMBEDDING: 1,
} as const;

// ─── Notification type returned to frontend ─────────────────
export interface AiUsageNotification {
  type: "half" | "three_quarter" | "limit_reached";
  message: string;
  usedDollars: number;
  limitDollars: number;
  resetDate: string; // ISO date string for start of next month
}

// ─── Guard result ───────────────────────────────────────────
export interface AiGuardResult {
  status: "ok" | "blocked";
  notification?: AiUsageNotification;
}

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

function getNextPeriodStart(): string {
  const now = new Date();
  const nextMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  return nextMonth.toISOString().split("T")[0];
}

function buildNotification(
  costBefore: number,
  costAfter: number
): AiUsageNotification | undefined {
  const resetDate = getNextPeriodStart();
  const limitDollars = AI_COST_CAP_CENTS / 100;

  // Check milestones crossed (before < threshold <= after)
  if (costBefore < MILESTONE_HALF && costAfter >= MILESTONE_HALF) {
    return {
      type: "half",
      message: "You've used 50% of your monthly AI credits ($5.00 of $10.00). Use them wisely!",
      usedDollars: costAfter / 100,
      limitDollars,
      resetDate,
    };
  }

  if (costBefore < MILESTONE_THREE_QUARTER && costAfter >= MILESTONE_THREE_QUARTER) {
    return {
      type: "three_quarter",
      message: "You've used 75% of your monthly AI credits ($7.50 of $10.00). Consider saving the rest for important queries.",
      usedDollars: costAfter / 100,
      limitDollars,
      resetDate,
    };
  }

  return undefined;
}

/**
 * Check and record AI usage for a user. Must be called BEFORE any external AI call.
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
    return { status: "ok" };
  }

  const currentCost = data.total_cost_cents as number;
  const projectedCost = currentCost + estimatedCostCents;

  // Hard cap — block entirely
  if (projectedCost > AI_COST_CAP_CENTS) {
    return {
      status: "blocked",
      notification: {
        type: "limit_reached",
        message: `You've used all your monthly AI credits ($10.00). Your credits will reset on ${getNextPeriodStart()}.`,
        usedDollars: currentCost / 100,
        limitDollars: AI_COST_CAP_CENTS / 100,
        resetDate: getNextPeriodStart(),
      },
    };
  }

  // Under budget — increment
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

  // Check if we crossed a milestone
  const notification = buildNotification(currentCost, projectedCost);
  return { status: "ok", notification };
}

/** Standard JSON error response for blocked users */
export function aiLimitResponse(corsHeaders: Record<string, string>, guard: AiGuardResult) {
  return new Response(
    JSON.stringify({
      error: "ai_limit_reached",
      message: guard.notification?.message ||
        "You've reached your monthly AI usage limit. Further AI features are paused for this month.",
      limit_dollars: AI_COST_CAP_CENTS / 100,
      reset_date: guard.notification?.resetDate || getNextPeriodStart(),
    }),
    {
      status: 429,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}

/**
 * Extract user_id from the Authorization header (JWT).
 */
export async function getUserIdFromRequest(req: Request): Promise<string | null> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.replace("Bearer ", "");

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
