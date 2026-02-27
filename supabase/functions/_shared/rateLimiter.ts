import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

/**
 * IP + User-based rate limiter using the api_cache table.
 * Stores counters as cache entries with short TTLs.
 *
 * Returns { allowed: true } or { allowed: false, retryAfterSeconds }.
 */

interface RateLimitConfig {
  /** Unique function identifier, e.g. "stock-data" */
  functionName: string;
  /** Max requests per window */
  maxRequests: number;
  /** Window size in seconds (default 60) */
  windowSeconds?: number;
}

interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds?: number;
}

function getSupabaseAdmin() {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return null;
  return createClient(url, key);
}

function getClientIP(req: Request): string {
  // Lovable Cloud / Supabase edge functions pass these headers
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}

/**
 * Check rate limit for a request. Uses IP by default, and user_id if available.
 * Applies the stricter of the two if both are present.
 */
export async function checkRateLimit(
  req: Request,
  config: RateLimitConfig,
  userId?: string | null
): Promise<RateLimitResult> {
  const sb = getSupabaseAdmin();
  if (!sb) return { allowed: true }; // fail open if no DB

  const windowSeconds = config.windowSeconds ?? 60;
  const ip = getClientIP(req);
  const now = Date.now();

  // Build keys to check
  const keys: string[] = [];
  if (ip !== "unknown") keys.push(`rl:${config.functionName}:ip:${ip}`);
  if (userId) keys.push(`rl:${config.functionName}:user:${userId}`);
  if (keys.length === 0) return { allowed: true };

  try {
    for (const key of keys) {
      // Read current counter
      const { data } = await sb
        .from("api_cache")
        .select("data, expires_at")
        .eq("cache_key", key)
        .maybeSingle();

      if (data && new Date(data.expires_at) > new Date()) {
        const counter = (data.data as any)?.count ?? 0;
        if (counter >= config.maxRequests) {
          const expiresAt = new Date(data.expires_at).getTime();
          const retryAfter = Math.max(1, Math.ceil((expiresAt - now) / 1000));
          return { allowed: false, retryAfterSeconds: retryAfter };
        }

        // Increment
        await sb.from("api_cache").update({
          data: { count: counter + 1 },
        }).eq("cache_key", key);
      } else {
        // Create new window
        const expiresAt = new Date(now + windowSeconds * 1000).toISOString();
        await sb.from("api_cache").upsert(
          {
            cache_key: key,
            data: { count: 1 },
            cached_at: new Date().toISOString(),
            expires_at: expiresAt,
          },
          { onConflict: "cache_key" }
        );
      }
    }

    return { allowed: true };
  } catch (err) {
    console.warn("[rate-limiter] Error (failing open):", err);
    return { allowed: true }; // fail open
  }
}

/**
 * Returns a 429 Response with Retry-After header.
 */
export function rateLimitResponse(
  corsHeaders: Record<string, string>,
  retryAfterSeconds: number
): Response {
  return new Response(
    JSON.stringify({
      error: "Too many requests. Please try again later.",
      retry_after_seconds: retryAfterSeconds,
    }),
    {
      status: 429,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Retry-After": String(retryAfterSeconds),
      },
    }
  );
}
