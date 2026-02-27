import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { checkRateLimit, rateLimitResponse } from "../_shared/rateLimiter.ts";
import {
  safeParseBody, isValidSearchQuery, sanitize, checkUnexpectedFields, validationError,
} from "../_shared/inputValidator.ts";
import {
  checkAndRecordAiUsage, aiLimitResponse, getUserIdFromRequest, COST_ESTIMATES,
} from "../_shared/aiUsageGuard.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const RATE_LIMIT = { functionName: "stock-screener", maxRequests: 10, windowSeconds: 60 };

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  if (req.method !== 'POST') return validationError(corsHeaders, "Method not allowed");

  try {
    const rl = await checkRateLimit(req, RATE_LIMIT);
    if (!rl.allowed) return rateLimitResponse(corsHeaders, rl.retryAfterSeconds!);

    const parsed = await safeParseBody(req);
    if (!parsed.ok) return validationError(corsHeaders, parsed.error);
    const body = parsed.body;

    const unexpected = checkUnexpectedFields(body, ["query"]);
    if (unexpected.length > 0) return validationError(corsHeaders, `Unexpected fields: ${unexpected.join(", ")}`);

    if (!isValidSearchQuery(body.query, 500)) return validationError(corsHeaders, "Invalid query (1-500 chars)");
    const query = sanitize(body.query as string);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('Server configuration error');

    // AI usage guard
    const userId = await getUserIdFromRequest(req);
    let aiNotification: any = undefined;
    if (userId) {
      const guard = await checkAndRecordAiUsage(userId, COST_ESTIMATES.SCREENER);
      if (guard.status === "blocked") return aiLimitResponse(corsHeaders, guard);
      aiNotification = guard.notification;
    }

    const systemPrompt = `You are a stock screener assistant for MarketPulse. Given a natural language query, return a JSON array of stock tickers that match the criteria. Use your knowledge of major US stocks (NASDAQ & NYSE).\n\nRules:\n- Return ONLY a JSON object with "results" array of objects with: ticker, name, reason (brief 1-line explanation of why it matches)\n- Return 5-15 results max\n- Only include real, currently listed US stocks\n- Be accurate about financial metrics (P/E ratios, market caps, sectors, etc.)\n- If you're unsure about exact current values, note that in the reason\n\nExample response:\n{"results":[{"ticker":"AAPL","name":"Apple Inc.","reason":"P/E ~30x, strong earnings growth, tech sector leader"},{"ticker":"MSFT","name":"Microsoft Corp.","reason":"P/E ~35x, consistent revenue growth, cloud dominance"}]}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query },
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'screen_stocks',
            description: 'Return stocks matching the screening criteria.',
            parameters: {
              type: 'object',
              properties: {
                results: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: { ticker: { type: 'string' }, name: { type: 'string' }, reason: { type: 'string' } },
                    required: ['ticker', 'name', 'reason'],
                    additionalProperties: false,
                  },
                },
              },
              required: ['results'],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: 'function', function: { name: 'screen_stocks' } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded.' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted.' }), {
          status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errText = await response.text();
      console.error('AI gateway error:', response.status, errText);
      throw new Error('AI service error');
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    let results = [];

    if (toolCall?.function?.arguments) {
      try {
        const parsed = JSON.parse(toolCall.function.arguments);
        results = parsed.results || [];
      } catch {
        console.error('Failed to parse tool call arguments');
      }
    }

    return new Response(JSON.stringify({ results, ...(aiNotification && { ai_usage_notification: aiNotification }) }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('stock-screener error:', error);
    return new Response(JSON.stringify({ error: 'An error occurred processing your request' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
