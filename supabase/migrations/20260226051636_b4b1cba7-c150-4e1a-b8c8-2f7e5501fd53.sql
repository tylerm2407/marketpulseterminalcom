
-- Create user_access table for cross-app subscription caching
CREATE TABLE public.user_access (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  novawealth_subscriber BOOLEAN NOT NULL DEFAULT false,
  standalone_subscriber BOOLEAN NOT NULL DEFAULT false,
  last_novawealth_check TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.user_access ENABLE ROW LEVEL SECURITY;

-- Users can read their own access
CREATE POLICY "Users can view own access"
  ON public.user_access FOR SELECT
  USING (auth.uid() = id);

-- Users can insert their own access row
CREATE POLICY "Users can insert own access"
  ON public.user_access FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own access row
CREATE POLICY "Users can update own access"
  ON public.user_access FOR UPDATE
  USING (auth.uid() = id);

-- Service role full access (for edge functions)
CREATE POLICY "Service role full access to user_access"
  ON public.user_access FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
