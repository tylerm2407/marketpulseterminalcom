
-- Drop the overly permissive policy
DROP POLICY "Service role can manage all profiles" ON public.profiles;

-- Create a proper service role policy using role check
CREATE POLICY "Service role full access to profiles"
ON public.profiles
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');
