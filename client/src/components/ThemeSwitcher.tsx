import React from 'react';
import { useTheme } from '../hooks/useTheme';
import type { ThemeType } from '../hooks/useTheme';
import { Sun, Moon, Sparkles } from 'lucide-react';

interface ThemeSwitcherProps {
  labels?: {
    neon: string;
    dark: string;
    light: string;
  };
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ labels }) => {
  const { theme, setTheme } = useTheme();

  const themes: { id: ThemeType; label: string; icon: React.ReactNode }[] = [
    {
      id: 'neon',
      label: labels?.neon || 'Неон',
      icon: <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />,
    },
    {
      id: 'dark',
      label: labels?.dark || 'Тёмная',
      icon: <Moon className="w-3.5 h-3.5 text-blue-400 shrink-0" />,
    },
    {
      id: 'light',
      label: labels?.light || 'Светлая',
      icon: <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />,
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-1 p-1 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl shadow-sm">
      {themes.map((t) => {
        const isActive = theme === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => setTheme(t.id)}
            title={t.label}
            className={`min-w-[36px] sm:min-w-[84px] px-2 sm:px-3 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              isActive
                ? 'bg-slate-800 text-white shadow-sm ring-1 ring-slate-700'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {t.icon}
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        );
      })}
    </div>
  );
};
