import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SHORTCUTS: Record<string, string> = {
  'g+h': '/',
  'g+w': '/watchlist',
  'g+p': '/portfolio',
  'g+a': '/alerts',
  'g+n': '/news',
  'g+c': '/compare',
  'g+s': '/screener',
  'g+x': '/analytics',
  'g+,': '/settings',
};

export function useKeyboardShortcuts() {
  const navigate = useNavigate();

  useEffect(() => {
    let pending: string | null = null;
    let timer: ReturnType<typeof setTimeout>;

    const handler = (e: KeyboardEvent) => {
      // Don't trigger in inputs
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if ((e.target as HTMLElement).isContentEditable) return;

      const key = e.key.toLowerCase();

      // "/" to focus search
      if (key === '/' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        const searchInput = document.querySelector<HTMLInputElement>('[data-search-input]');
        searchInput?.focus();
        return;
      }

      // "?" for shortcut help
      if (key === '?' && e.shiftKey) {
        window.dispatchEvent(new CustomEvent('show-shortcuts'));
        return;
      }

      // g+key combos
      if (pending === 'g') {
        clearTimeout(timer);
        pending = null;
        const combo = `g+${key}`;
        const route = SHORTCUTS[combo];
        if (route) {
          e.preventDefault();
          navigate(route);
        }
        return;
      }

      if (key === 'g') {
        pending = 'g';
        timer = setTimeout(() => { pending = null; }, 500);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [navigate]);
}
