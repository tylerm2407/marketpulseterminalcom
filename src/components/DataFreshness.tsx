import { Clock } from 'lucide-react';

interface DataFreshnessProps {
  /** ISO timestamp or Date of when data was last fetched/updated */
  updatedAt: string | Date | number | undefined;
  className?: string;
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function DataFreshness({ updatedAt, className = '' }: DataFreshnessProps) {
  if (!updatedAt) return null;

  const date = updatedAt instanceof Date ? updatedAt : new Date(updatedAt);
  if (isNaN(date.getTime())) return null;

  return (
    <span className={`inline-flex items-center gap-1 text-[10px] text-muted-foreground ${className}`}>
      <Clock className="h-3 w-3" />
      Updated {formatTimeAgo(date)}
    </span>
  );
}
