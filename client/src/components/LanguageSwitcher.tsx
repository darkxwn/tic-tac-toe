import React from 'react';
import type { Language } from '../i18n/translations';
import { Globe } from 'lucide-react';

interface LanguageSwitcherProps {
  currentLang: Language;
  onToggle: () => void;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ currentLang, onToggle }) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      title={currentLang === 'ru' ? 'Switch to English' : 'Переключить на русский'}
      className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-sm"
    >
      <Globe className="w-3.5 h-3.5 text-cyan-400" />
      <span className="uppercase text-[11px] tracking-wider">{currentLang}</span>
    </button>
  );
};
