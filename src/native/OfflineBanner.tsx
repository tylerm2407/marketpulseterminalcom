import { forwardRef } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const OfflineBanner = forwardRef<HTMLDivElement>(function OfflineBanner(_props, ref) {
  return (
    <div ref={ref} className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-6">
        <WifiOff className="h-8 w-8 text-muted-foreground" />
      </div>
      <h2 className="text-xl font-bold text-foreground mb-2">No Internet Connection</h2>
      <p className="text-sm text-muted-foreground mb-8 max-w-xs leading-relaxed">
        MarketPulse requires an internet connection to load live market data. Please check your connection and try again.
      </p>
      <Button
        onClick={() => window.location.reload()}
        className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
      >
        <RefreshCw className="h-4 w-4" />
        Try Again
      </Button>
    </div>
  );
});

