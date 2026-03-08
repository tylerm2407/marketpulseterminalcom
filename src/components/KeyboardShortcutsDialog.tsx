import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Keyboard } from 'lucide-react';

const shortcuts = [
  { keys: ['/', ''], label: 'Focus search bar' },
  { keys: ['g', 'h'], label: 'Go to Home' },
  { keys: ['g', 'w'], label: 'Go to Watchlist' },
  { keys: ['g', 'p'], label: 'Go to Portfolio' },
  { keys: ['g', 'a'], label: 'Go to Alerts' },
  { keys: ['g', 'n'], label: 'Go to News' },
  { keys: ['g', 'c'], label: 'Go to Compare' },
  { keys: ['g', 's'], label: 'Go to Screener' },
  { keys: ['g', 'x'], label: 'Go to Analytics' },
  { keys: ['g', ','], label: 'Go to Settings' },
  { keys: ['Shift', '?'], label: 'Show shortcuts' },
];

export function KeyboardShortcutsDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener('show-shortcuts', handler);
    return () => window.removeEventListener('show-shortcuts', handler);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-card border-border max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Keyboard className="h-4 w-4 text-accent" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-2 mt-2">
          {shortcuts.map(({ keys, label }) => (
            <div key={label} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{label}</span>
              <div className="flex items-center gap-1">
                {keys.filter(Boolean).map((k, i) => (
                  <span key={i}>
                    {i > 0 && <span className="text-muted-foreground mx-0.5">+</span>}
                    <kbd className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded bg-muted border border-border text-xs font-mono text-foreground">
                      {k}
                    </kbd>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
