import { useCallback, useSyncExternalStore } from 'react';

const STORAGE_KEY = 'marketpulse-recently-viewed';
const MAX_ITEMS = 8;

interface RecentStock {
  ticker: string;
  name: string;
  viewedAt: number;
}

let listeners: Array<() => void> = [];
function emitChange() {
  listeners.forEach((l) => l());
}

function getSnapshot(): RecentStock[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function subscribe(cb: () => void) {
  listeners.push(cb);
  return () => {
    listeners = listeners.filter((l) => l !== cb);
  };
}

export function addRecentlyViewed(ticker: string, name: string) {
  const current = getSnapshot();
  const updated = [
    { ticker, name, viewedAt: Date.now() },
    ...current.filter((s) => s.ticker !== ticker),
  ].slice(0, MAX_ITEMS);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  emitChange();
}

export function useRecentlyViewed() {
  const items = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const add = useCallback((ticker: string, name: string) => {
    addRecentlyViewed(ticker, name);
  }, []);
  return { items, add };
}
