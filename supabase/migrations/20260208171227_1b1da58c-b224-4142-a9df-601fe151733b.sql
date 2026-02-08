
-- Drop the overly permissive policy
DROP POLICY "Allow service role full access to cache" ON public.api_cache;

-- Only allow inserts and updates for service role (edge functions use service role key)
-- Anonymous users can only SELECT (read from cache)
CREATE POLICY "Allow insert for service role"
  ON public.api_cache
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Allow update for service role"
  ON public.api_cache
  FOR UPDATE
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Allow delete for service role"
  ON public.api_cache
  FOR DELETE
  USING (auth.role() = 'service_role');
