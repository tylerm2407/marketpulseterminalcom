
-- Create API cache table for storing FMP responses with TTL
CREATE TABLE public.api_cache (
  cache_key TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  cached_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Index for fast expiration lookups during cleanup
CREATE INDEX idx_api_cache_expires_at ON public.api_cache (expires_at);

-- Enable RLS (public read/write via service role only from edge functions)
ALTER TABLE public.api_cache ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to read cache (edge functions use service role for writes)
CREATE POLICY "Allow public read access to cache"
  ON public.api_cache
  FOR SELECT
  USING (true);

-- Allow service role full access (edge functions)
CREATE POLICY "Allow service role full access to cache"
  ON public.api_cache
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Function to clean up expired cache entries (can be called periodically)
CREATE OR REPLACE FUNCTION public.cleanup_expired_cache()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.api_cache WHERE expires_at < now();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
