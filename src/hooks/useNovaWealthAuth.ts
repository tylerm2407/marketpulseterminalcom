import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useNovaWealthAuth() {
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authToken = params.get('auth_token');
    if (!authToken) return;

    // Clean the URL immediately
    window.history.replaceState({}, '', window.location.pathname);

    setProcessing(true);

    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke('validate-nova-token', {
          body: { token: authToken },
        });

        if (error) throw error;
        if (!data?.success || !data?.hashed_token) {
          throw new Error(data?.error || 'Invalid token');
        }

        // Use the magic link token to create a session
        const { error: otpError } = await supabase.auth.verifyOtp({
          token_hash: data.hashed_token,
          type: 'magiclink',
        });

        if (otpError) throw otpError;

        toast.success(`Welcome from Nova Wealth, ${data.display_name || 'Pro user'}!`);
      } catch (err: any) {
        console.error('Nova Wealth auth failed:', err);
        toast.error('Nova Wealth login failed. Please try again.');
      } finally {
        setProcessing(false);
      }
    })();
  }, []);

  return { processing };
}
