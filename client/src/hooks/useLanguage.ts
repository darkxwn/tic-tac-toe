import { useState, useCallback } from 'react';
import { translations } from '../i18n/translations';
import type { Language } from '../i18n/translations';

const LANG_STORAGE_KEY = 'infinity_ttt_lang';

export function useLanguage() {
  const [lang, setLangState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(LANG_STORAGE_KEY);
      if (saved === 'ru' || saved === 'en') {
        return saved;
      }
    } catch {
      // Игнорируем
    }
    return 'ru';
  });

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem(LANG_STORAGE_KEY, newLang);
    } catch {
      // Игнорируем
    }
  }, []);

  const toggleLang = useCallback(() => {
    setLangState((prev) => {
      const next = prev === 'ru' ? 'en' : 'ru';
      try {
        localStorage.setItem(LANG_STORAGE_KEY, next);
      } catch {
        // Игнорируем
      }
      return next;
    });
  }, []);

  return { lang, setLang, toggleLang, t: translations[lang] };
}
