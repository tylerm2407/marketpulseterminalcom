import { useState, useEffect, useCallback } from 'react';
import { X, Check, Search, Eye, FileText, Bell, Sparkles, ChevronDown, ChevronUp, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const STORAGE_KEY = 'marketpulse-checklist';
const DISMISSED_KEY = 'marketpulse-checklist-dismissed';

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  action?: string; // route to navigate to
}

const ITEMS: ChecklistItem[] = [
  { id: 'search', label: 'Search a stock', description: 'Look up any ticker or company name', icon: Search, action: '/' },
  { id: 'watchlist', label: 'Add to watchlist', description: 'Star a stock to track it', icon: Eye },
  { id: 'dossier', label: 'Read a dossier', description: 'View the full analysis for any stock', icon: FileText },
  { id: 'alert', label: 'Set a price alert', description: 'Get notified when a stock hits your target', icon: Bell, action: '/alerts' },
  { id: 'screener', label: 'Try the AI Screener', description: 'Find stocks using natural language', icon: Sparkles, action: '/screener' },
];

function getCompleted(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function markChecklistItem(id: string) {
  const completed = getCompleted();
  if (!completed.includes(id)) {
    completed.push(id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(completed));
    window.dispatchEvent(new CustomEvent('checklist-update'));
  }
}

export function OnboardingChecklist() {
  const [completed, setCompleted] = useState<string[]>(getCompleted);
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISSED_KEY) === 'true');
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const refresh = useCallback(() => setCompleted(getCompleted()), []);

  useEffect(() => {
    window.addEventListener('checklist-update', refresh);
    return () => window.removeEventListener('checklist-update', refresh);
  }, [refresh]);

  const progress = Math.round((completed.length / ITEMS.length) * 100);
  const allDone = completed.length === ITEMS.length;

  if (dismissed || allDone) return null;

  // Also hide if old tour was completed (migration)
  if (localStorage.getItem('marketpulse-tour-complete')) {
    // Migrate: mark as dismissed
    localStorage.setItem(DISMISSED_KEY, 'true');
    return null;
  }

  return (
    <div className="fixed bottom-16 sm:bottom-6 right-3 sm:right-6 z-40 w-[min(340px,calc(100vw-24px))] animate-in slide-in-from-bottom-4 fade-in-0 duration-300">
      <div className="bg-card border border-border rounded-xl shadow-xl overflow-hidden">
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors"
          onClick={() => setCollapsed(!collapsed)}
        >
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-accent" />
            <span className="text-sm font-semibold text-foreground">Getting Started</span>
            <span className="text-[10px] text-muted-foreground">{completed.length}/{ITEMS.length}</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); setDismissed(true); localStorage.setItem(DISMISSED_KEY, 'true'); }}
              className="p-1 rounded hover:bg-muted text-muted-foreground"
              aria-label="Dismiss checklist"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            {collapsed ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </div>
        </div>

        {/* Progress bar */}
        <div className="px-4 pb-1">
          <Progress value={progress} className="h-1.5" />
        </div>

        {/* Items */}
        {!collapsed && (
          <div className="px-3 pb-3 pt-1 space-y-1">
            {ITEMS.map(({ id, label, description, icon: Icon, action }) => {
              const done = completed.includes(id);
              return (
                <button
                  key={id}
                  onClick={() => {
                    if (!done && action) navigate(action);
                  }}
                  disabled={done}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all',
                    done
                      ? 'opacity-60'
                      : 'hover:bg-muted/40 cursor-pointer'
                  )}
                >
                  <div className={cn(
                    'h-6 w-6 rounded-full flex items-center justify-center shrink-0 border transition-colors',
                    done
                      ? 'bg-accent border-accent text-accent-foreground'
                      : 'border-border text-muted-foreground'
                  )}>
                    {done ? <Check className="h-3.5 w-3.5" /> : <Icon className="h-3 w-3" />}
                  </div>
                  <div className="min-w-0">
                    <p className={cn('text-xs font-medium', done ? 'line-through text-muted-foreground' : 'text-foreground')}>{label}</p>
                    {!done && <p className="text-[10px] text-muted-foreground">{description}</p>}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
