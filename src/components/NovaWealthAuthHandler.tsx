import { useNovaWealthAuth } from '@/hooks/useNovaWealthAuth';
import { Loader2 } from 'lucide-react';

export function NovaWealthAuthHandler() {
  const { processing } = useNovaWealthAuth();

  if (!processing) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
        <p className="text-lg font-medium">Signing in via Nova Wealth…</p>
        <p className="text-sm text-muted-foreground">Verifying your subscription</p>
      </div>
    </div>
  );
}
