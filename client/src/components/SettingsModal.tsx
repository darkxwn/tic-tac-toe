import React from 'react';
import { Settings, X, Volume2, VolumeX, Music } from 'lucide-react';
import { ThemeSwitcher } from './ThemeSwitcher';
import type { Language, Translations } from '../i18n/translations';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  t: Translations;
  lang: Language;
  onToggleLang: () => void;
  soundEnabled: boolean;
  soundVolume: number;
  onToggleSound: () => void;
  onSetSoundVolume: (vol: number) => void;
  musicEnabled: boolean;
  musicVolume: number;
  onToggleMusic: () => void;
  onSetMusicVolume: (vol: number) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  t,
  lang,
  onToggleLang,
  soundEnabled,
  soundVolume,
  onToggleSound,
  onSetSoundVolume,
  musicEnabled,
  musicVolume,
  onToggleMusic,
  onSetMusicVolume,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-pop"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm p-5 sm:p-6 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl shadow-2xl flex flex-col gap-4 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Шапка модального окна */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-2 font-black text-base text-[var(--text-primary)]">
            <Settings className="w-5 h-5 text-cyan-400" />
            <span>{t.settingsTitle}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1. Темы оформления */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
            {t.themeLabel}
          </span>
          <ThemeSwitcher
            labels={{
              neon: t.themeNeon,
              dark: t.themeDark,
              light: t.themeLight,
            }}
            alwaysShowLabels
          />
        </div>

        {/* 2. Язык интерфейса */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
            {t.languageLabel}
          </span>
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl">
            <button
              type="button"
              onClick={() => lang !== 'ru' && onToggleLang()}
              className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                lang === 'ru'
                  ? 'bg-cyan-500/15 border border-cyan-500/40 text-cyan-400 font-black shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <span>🇷🇺</span>
              <span>Русский</span>
            </button>
            <button
              type="button"
              onClick={() => lang !== 'en' && onToggleLang()}
              className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                lang === 'en'
                  ? 'bg-cyan-500/15 border border-cyan-500/40 text-cyan-400 font-black shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <span>🇬🇧</span>
              <span>English</span>
            </button>
          </div>
        </div>

        {/* 3. Звуковые эффекты */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
            {t.soundEffects}
          </span>
          <div className="flex items-center gap-3 p-2 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl">
            {/* Кнопка звука слева */}
            <button
              type="button"
              onClick={onToggleSound}
              className={`h-10 w-10 shrink-0 rounded-xl border transition-all flex items-center justify-center cursor-pointer active:scale-95 ${
                soundEnabled && soundVolume > 0
                  ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-400 shadow-sm'
                  : 'bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-secondary)]'
              }`}
              title={soundEnabled ? t.mute : t.unmute}
            >
              {soundEnabled && soundVolume > 0 ? (
                <Volume2 className="w-5 h-5 text-cyan-400" />
              ) : (
                <VolumeX className="w-5 h-5 opacity-60" />
              )}
            </button>

            {/* Горизонтальный слайдер всегда виден справа от кнопки */}
            <div className="flex-1 flex items-center gap-2.5 min-w-0">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={soundEnabled ? soundVolume : 0}
                onChange={(e) => onSetSoundVolume(parseFloat(e.target.value))}
                className="w-full h-2 rounded-lg accent-cyan-400 bg-slate-700/50 cursor-pointer"
                aria-label="Sound volume"
              />
              <span className="text-xs font-mono font-bold text-[var(--text-primary)] w-9 text-right shrink-0">
                {soundEnabled ? `${Math.round(soundVolume * 100)}%` : '0%'}
              </span>
            </div>
          </div>
        </div>

        {/* 4. Фоновая музыка */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
            {t.relaxingMusic}
          </span>
          <div className="flex items-center gap-3 p-2 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl">
            {/* Кнопка музыки слева */}
            <button
              type="button"
              onClick={onToggleMusic}
              className={`h-10 w-10 shrink-0 rounded-xl border transition-all flex items-center justify-center cursor-pointer active:scale-95 ${
                musicEnabled && musicVolume > 0
                  ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-400 shadow-sm'
                  : 'bg-[var(--bg-card)] border-[var(--border-color)] text-[var(--text-secondary)]'
              }`}
              title={musicEnabled ? t.musicMute : t.musicUnmute}
            >
              <Music
                className={`w-5 h-5 ${
                  musicEnabled && musicVolume > 0 ? 'text-cyan-400 animate-pulse' : 'opacity-60'
                }`}
              />
            </button>

            {/* Горизонтальный слайдер всегда виден справа от кнопки */}
            <div className="flex-1 flex items-center gap-2.5 min-w-0">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={musicEnabled ? musicVolume : 0}
                onChange={(e) => onSetMusicVolume(parseFloat(e.target.value))}
                className="w-full h-2 rounded-lg accent-cyan-400 bg-slate-700/50 cursor-pointer"
                aria-label="Music volume"
              />
              <span className="text-xs font-mono font-bold text-[var(--text-primary)] w-9 text-right shrink-0">
                {musicEnabled ? `${Math.round(musicVolume * 100)}%` : '0%'}
              </span>
            </div>
          </div>
        </div>

        {/* Кнопка закрытия */}
        <button
          type="button"
          onClick={onClose}
          className="mt-1 w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-cyan-600/25 active:scale-95 text-center shrink-0"
        >
          {t.close}
        </button>
      </div>
    </div>
  );
};
