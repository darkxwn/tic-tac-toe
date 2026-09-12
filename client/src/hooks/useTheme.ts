import { useState, useEffect } from 'react';

export type ThemeType = 'neon' | 'dark' | 'light';

const THEME_STORAGE_KEY = 'infinity_ttt_theme';

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeType>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'neon' || saved === 'dark' || saved === 'light') {
        return saved;
      }
    } catch {
      // Игнорируем ошибки доступа к localStorage
    }
    return 'dark';
  });

  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch {
      // Игнорируем
    }
    const root = document.documentElement;
    root.classList.remove('theme-neon', 'theme-dark', 'theme-light');
    root.classList.add(`theme-${newTheme}`);
  };

  useEffect(() => {
    const root = document.documentElement;
    if (!root.classList.contains(`theme-${theme}`)) {
      root.classList.remove('theme-neon', 'theme-dark', 'theme-light');
      root.classList.add(`theme-${theme}`);
    }
  }, [theme]);

  return { theme, setTheme };
}
