import { WifiOff } from 'lucide-react';

interface FallbackBannerProps {
  show: boolean;
  message?: string;
}

export function FallbackBanner({ show, message }: FallbackBannerProps) {
  if (!show) return null;

  return (
    <div className="bg-warning/10 border border-warning/30 rounded-md px-3 py-2 flex items-center gap-2 text-xs text-warning animate-fade-in">
      <WifiOff className="h-3.5 w-3.5 shrink-0" />
      <span>{message || 'Showing cached data — live data temporarily unavailable'}</span>
    </div>
  );
}
