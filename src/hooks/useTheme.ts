import { useCallback } from 'react';

type Theme = 'dark';

export function useTheme() {
  const theme: Theme = 'dark';

  const toggleTheme = useCallback(() => {
    // Dark-only design — no toggle needed
  }, []);

  const setTheme = useCallback((_t: string) => {
    // Dark-only design
  }, []);

  return { theme, toggleTheme, setTheme };
}
