import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  compact?: boolean;
}

export function ErrorState({
  title = 'Data temporarily unavailable',
  message = 'We couldn\'t load this data right now. Please try again in a moment.',
  onRetry,
  compact = false,
}: ErrorStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${compact ? 'py-4' : 'py-8'}`}>
      <AlertCircle className={`text-destructive/50 ${compact ? 'h-5 w-5' : 'h-8 w-8'}`} />
      <div className="text-center">
        <p className={`font-medium text-foreground ${compact ? 'text-xs' : 'text-sm'}`}>{title}</p>
        <p className={`text-muted-foreground mt-1 max-w-xs ${compact ? 'text-[10px]' : 'text-xs'}`}>{message}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="gap-2 h-8 text-xs">
          <RefreshCw className="h-3 w-3" />
          Try Again
        </Button>
      )}
    </div>
  );
}
