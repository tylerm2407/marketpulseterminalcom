/**
 * Shared input validation & sanitization utilities.
 * OWASP-aligned: reject unexpected fields, enforce types/lengths.
 */

/** Strip HTML tags and trim whitespace */
export function sanitize(input: string): string {
  return input
    .replace(/<[^>]*>/g, "") // strip HTML
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "") // strip control chars
    .trim();
}

/** Validate a stock ticker: 1-10 uppercase letters, dots, hyphens */
export function isValidTicker(ticker: unknown): ticker is string {
  return typeof ticker === "string" && /^[A-Za-z][A-Za-z0-9.\-]{0,9}$/.test(ticker);
}

/** Validate an array of tickers with a max count */
export function validateTickerArray(
  tickers: unknown,
  maxCount: number
): { valid: true; tickers: string[] } | { valid: false; error: string } {
  if (!Array.isArray(tickers)) return { valid: false, error: "tickers must be an array" };
  if (tickers.length === 0) return { valid: false, error: "tickers array is empty" };
  if (tickers.length > maxCount) return { valid: false, error: `Too many tickers (max ${maxCount})` };
  for (const t of tickers) {
    if (!isValidTicker(t)) return { valid: false, error: `Invalid ticker: ${String(t).substring(0, 20)}` };
  }
  return { valid: true, tickers: tickers.map((t: string) => t.toUpperCase()) };
}

/** Validate a search query string */
export function isValidSearchQuery(query: unknown, maxLen = 100): query is string {
  return typeof query === "string" && query.trim().length > 0 && query.length <= maxLen;
}

/** Validate email format (basic) */
export function isValidEmail(email: unknown): email is string {
  return typeof email === "string" && /^[^\s@]{1,64}@[^\s@]{1,255}$/.test(email) && email.length <= 320;
}

/** Validate UUID */
export function isValidUUID(id: unknown): id is string {
  return typeof id === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

/** Safe JSON parse with size limit (default 100KB) */
export async function safeParseBody(
  req: Request,
  maxSizeBytes = 102400
): Promise<{ ok: true; body: Record<string, unknown> } | { ok: false; error: string }> {
  try {
    const contentLength = req.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > maxSizeBytes) {
      return { ok: false, error: "Request body too large" };
    }
    const text = await req.text();
    if (text.length > maxSizeBytes) {
      return { ok: false, error: "Request body too large" };
    }
    const parsed = JSON.parse(text);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return { ok: false, error: "Request body must be a JSON object" };
    }
    return { ok: true, body: parsed as Record<string, unknown> };
  } catch {
    return { ok: false, error: "Invalid JSON body" };
  }
}

/** Reject unexpected fields - returns list of unknown fields */
export function checkUnexpectedFields(
  body: Record<string, unknown>,
  allowedFields: string[]
): string[] {
  const allowed = new Set(allowedFields);
  return Object.keys(body).filter((k) => !allowed.has(k));
}

/** Build a 400 error response */
export function validationError(
  corsHeaders: Record<string, string>,
  message: string
): Response {
  return new Response(
    JSON.stringify({ error: message }),
    { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
