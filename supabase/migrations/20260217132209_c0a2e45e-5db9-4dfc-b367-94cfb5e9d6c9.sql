
-- AI usage tracking per user per month
CREATE TABLE public.ai_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  period_start DATE NOT NULL,
  total_cost_cents INTEGER NOT NULL DEFAULT 0,
  total_requests INTEGER NOT NULL DEFAULT 0,
  last_updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Each user gets at most one row per billing period
CREATE UNIQUE INDEX idx_ai_usage_user_period ON public.ai_usage (user_id, period_start);
CREATE INDEX idx_ai_usage_user_id ON public.ai_usage (user_id);

-- Enable RLS
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;

-- Users can read their own usage
CREATE POLICY "Users can view own ai_usage"
  ON public.ai_usage FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can do everything (edge functions use service role)
CREATE POLICY "Service role full access to ai_usage"
  ON public.ai_usage FOR ALL
  USING (auth.role() = 'service_role'::text)
  WITH CHECK (auth.role() = 'service_role'::text);
