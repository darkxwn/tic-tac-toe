import React, { useState, useEffect } from 'react';
import type { BotDifficulty } from '../types/game';
import type { GameStats } from '../hooks/useGameStats';
import type { Translations } from '../i18n/translations';
import { StatsView } from './StatsView';
import {
  Bot,
  Users,
  Globe,
  User,
  HelpCircle,
  Sparkles,
  Smartphone,
  Check,
  ArrowLeft,
  ChevronRight,
  Gamepad2,
  SignalLow,
  SignalMedium,
  SignalHigh,
  BarChart3,
  X,
  Clock,
  Eye,
  Trophy,
  Lightbulb,
} from 'lucide-react';

interface MenuProps {
  playerName: string;
  stats: GameStats;
  t: Translations;
  onResetStats: () => void;
  onSavePlayerName: (name: string) => void;
  onStartBotGame: (difficulty: BotDifficulty) => void;
  onStartHotseatGame: (player2Name: string) => void;
  onStartOnlineCreate: () => void;
  onStartOnlineJoin: () => void;
}

type MenuView = 'main' | 'bot_setup' | 'multiplayer_setup' | 'stats';

export const Menu: React.FC<MenuProps> = ({
  playerName,
  stats,
  t,
  onResetStats,
  onSavePlayerName,
  onStartBotGame,
  onStartHotseatGame,
  onStartOnlineCreate,
  onStartOnlineJoin,
}) => {
  const [view, setView] = useState<MenuView>('main');
  const [selectedDifficulty, setSelectedDifficulty] = useState<BotDifficulty>('medium');
  const [hotseatOpponentName, setHotseatOpponentName] = useState('');
  const [multiplayerTab, setMultiplayerTab] = useState<'hotseat' | 'online'>('hotseat');
  const [showRules, setShowRules] = useState(false);

  // Состояние поля ввода ника
  const [draftName, setDraftName] = useState(playerName);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    setDraftName(playerName);
  }, [playerName]);

  useEffect(() => {
    if (!showRules) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowRules(false);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [showRules]);

  const hasUnsavedChanges = draftName.trim() !== playerName && draftName.trim().length > 0;

  const handleSaveName = () => {
    if (!draftName.trim()) return;
    onSavePlayerName(draftName.trim());
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSaveName();
    }
  };

  // Экран статистики
  if (view === 'stats') {
    return (
      <div className="w-full max-w-sm sm:max-w-md mx-auto">
        <StatsView stats={stats} t={t} onBack={() => setView('main')} onReset={onResetStats} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm sm:max-w-xl mx-auto flex flex-col items-center">
      {/* Логотип и заголовок */}
      <div className="text-center mb-4 sm:mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-2 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t.infinityMode}</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-[var(--text-primary)]">
          {t.titleCross} <span style={{ color: 'var(--color-x)' }}>{t.titleNought}</span>
        </h1>
        <p className="text-xs text-[var(--text-secondary)] mt-1">
          {t.subtitle}
        </p>
      </div>

      {/* Верхний блок: Поле ввода ника и кнопка статистики */}
      <div className="w-full flex items-center gap-2 mb-4 sm:mb-6">
        {/* Поле ввода ника */}
        <div className="flex-1 p-2.5 sm:p-3 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-1 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span>{t.yourNickname}</span>
            </div>
            {justSaved && (
              <span className="text-[11px] font-bold text-emerald-400 animate-pop flex items-center gap-0.5">
                <Check className="w-3 h-3" /> {t.saved}
              </span>
            )}
          </div>

          <div className="relative flex items-center">
            <input
              type="text"
              maxLength={16}
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t.nicknamePlaceholder}
              className={`w-full py-2 pl-3 bg-[var(--bg-surface)] border border-[var(--border-color)] focus:border-cyan-500 rounded-xl outline-none text-xs sm:text-sm font-semibold text-[var(--text-primary)] placeholder:text-slate-600 transition-all ${
                hasUnsavedChanges || justSaved ? 'pr-9' : 'pr-3'
              }`}
            />

            {/* Галочка сохранения */}
            {hasUnsavedChanges && (
              <button
                type="button"
                onClick={handleSaveName}
                title={t.saveNickname}
                className="absolute right-1 p-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/30 cursor-pointer animate-pop active:scale-90"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </button>
            )}

            {justSaved && !hasUnsavedChanges && (
              <div className="absolute right-2.5 text-emerald-400 animate-pop">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            )}
          </div>
        </div>

        {/* Кнопка перехода в статистику */}
        <button
          type="button"
          onClick={() => setView('stats')}
          title={t.statsBtn}
          className="self-stretch px-3.5 sm:px-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-amber-500/50 text-[var(--text-secondary)] hover:text-amber-400 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer shadow-sm active:scale-95 group"
        >
          <BarChart3 className="w-5 h-5 group-hover:scale-110 transition-transform text-amber-400" />
          <span className="text-[10px] font-bold tracking-tight">{t.statsBtn}</span>
        </button>
      </div>

      {/* 1. ГЛАВНЫЙ ЭКРАН: 2 карточки */}
      {view === 'main' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 w-full animate-pop">
          {/* КАРТОЧКА 1: Одиночная игра */}
          <button
            type="button"
            onClick={() => setView('bot_setup')}
            className="p-4 sm:p-6 bg-[var(--bg-card)] border-2 border-[var(--border-color)] hover:border-purple-500/70 hover:shadow-purple-500/10 rounded-2xl sm:rounded-3xl flex flex-col justify-between shadow-md sm:shadow-lg transition-all group text-left cursor-pointer active:scale-[0.98]"
          >
            <div>
              <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-105 transition-transform">
                <Bot className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <h2 className="font-extrabold text-base sm:text-xl text-[var(--text-primary)] mb-1">
                {t.singleplayer}
              </h2>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {t.singleplayerDesc}
              </p>
            </div>
            <div className="mt-4 sm:mt-6 flex items-center justify-between text-xs font-bold text-purple-400">
              <span>{t.chooseDifficulty}</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* КАРТОЧКА 2: Мультиплеер */}
          <button
            type="button"
            onClick={() => setView('multiplayer_setup')}
            className="p-4 sm:p-6 bg-[var(--bg-card)] border-2 border-[var(--border-color)] hover:border-cyan-500/70 hover:shadow-cyan-500/10 rounded-2xl sm:rounded-3xl flex flex-col justify-between shadow-md sm:shadow-lg transition-all group text-left cursor-pointer active:scale-[0.98]"
          >
            <div>
              <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-105 transition-transform">
                <Users className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <h2 className="font-extrabold text-base sm:text-xl text-[var(--text-primary)] mb-1">
                {t.multiplayer}
              </h2>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {t.multiplayerDesc}
              </p>
            </div>
            <div className="mt-4 sm:mt-6 flex items-center justify-between text-xs font-bold text-cyan-400">
              <span>{t.chooseMultiplayer}</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>
      )}

      {/* 2. ЭКРАН ПАРАМЕТРОВ: Одиночная игра */}
      {view === 'bot_setup' && (
        <div className="w-full p-4 sm:p-6 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl sm:rounded-3xl shadow-2xl animate-pop">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setView('main')}
              className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer py-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t.back}</span>
            </button>
            <div className="flex items-center gap-1.5 text-xs font-bold text-purple-400">
              <Bot className="w-4 h-4" />
              <span>{t.botSettings}</span>
            </div>
          </div>

          <h2 className="text-lg sm:text-xl font-black text-[var(--text-primary)] mb-1">
            {t.selectDifficulty}
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mb-4">
            {t.botCalculates}
          </p>

          <div className="flex flex-col gap-2.5 mb-5">
            {[
              {
                id: 'easy',
                title: t.diffEasy,
                desc: t.diffEasyDesc,
                icon: <SignalLow className="w-4 h-4 text-emerald-400" />,
                color: 'hover:border-emerald-500',
                activeColor: 'bg-emerald-600/15 border-emerald-500 text-emerald-400',
              },
              {
                id: 'medium',
                title: t.diffMedium,
                desc: t.diffMediumDesc,
                icon: <SignalMedium className="w-4 h-4 text-blue-400" />,
                color: 'hover:border-blue-500',
                activeColor: 'bg-blue-600/15 border-blue-500 text-blue-400',
              },
              {
                id: 'hard',
                title: t.diffHard,
                desc: t.diffHardDesc,
                icon: <SignalHigh className="w-4 h-4 text-purple-400" />,
                color: 'hover:border-purple-500',
                activeColor: 'bg-purple-600/15 border-purple-500 text-purple-400',
              },
            ].map((d) => {
              const isSelected = selectedDifficulty === d.id;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setSelectedDifficulty(d.id as BotDifficulty)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? `${d.activeColor} ring-1 ring-current shadow-sm`
                      : `bg-[var(--bg-surface)] border-[var(--border-color)] text-[var(--text-secondary)] ${d.color}`
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5 p-1.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] flex items-center justify-center shrink-0">
                      {d.icon}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-[var(--text-primary)] mb-0.5">
                        {d.title}
                      </div>
                      <div className="text-[11px] opacity-80 leading-snug">{d.desc}</div>
                    </div>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ml-3 ${
                      isSelected ? 'border-current' : 'border-slate-700'
                    }`}
                  >
                    {isSelected && <div className="w-2 h-2 rounded-full bg-current" />}
                  </div>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => onStartBotGame(selectedDifficulty)}
            className="w-full py-3.5 px-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-bold shadow-md shadow-purple-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            <Gamepad2 className="w-4 h-4" />
            <span>{t.startGame}</span>
          </button>
        </div>
      )}

      {/* 3. ЭКРАН ПАРАМЕТРОВ: Мультиплеер */}
      {view === 'multiplayer_setup' && (
        <div className="w-full p-4 sm:p-6 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl sm:rounded-3xl shadow-2xl animate-pop">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setView('main')}
              className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer py-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t.back}</span>
            </button>
            <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400">
              <Users className="w-4 h-4" />
              <span>{t.multiplayer}</span>
            </div>
          </div>

          {/* Переключатель вкладок */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-color)] mb-4">
            <button
              type="button"
              onClick={() => setMultiplayerTab('hotseat')}
              className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                multiplayerTab === 'hotseat'
                  ? 'bg-cyan-600 text-white shadow'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>{t.onOneDevice}</span>
            </button>
            <button
              type="button"
              onClick={() => setMultiplayerTab('online')}
              className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                multiplayerTab === 'online'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{t.online}</span>
            </button>
          </div>

          {multiplayerTab === 'hotseat' ? (
            <div className="space-y-3.5 animate-pop">
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                  {t.player2Label}
                </label>
                <input
                  type="text"
                  maxLength={16}
                  value={hotseatOpponentName}
                  onChange={(e) => setHotseatOpponentName(e.target.value)}
                  placeholder={t.player2Default}
                  className="w-full py-2.5 px-3.5 bg-[var(--bg-surface)] border border-[var(--border-color)] focus:border-cyan-500 rounded-xl outline-none text-sm font-semibold text-[var(--text-primary)]"
                />
              </div>
              <button
                onClick={() => onStartHotseatGame(hotseatOpponentName.trim() || t.player2Default)}
                className="w-full py-3.5 px-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-bold shadow-md shadow-cyan-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                <Gamepad2 className="w-4 h-4" />
                <span>{t.startHotseat}</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5 animate-pop pt-1">
              <button
                onClick={onStartOnlineCreate}
                className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                <Globe className="w-4 h-4" />
                <span>{t.createRoom}</span>
              </button>
              <button
                onClick={onStartOnlineJoin}
                className="w-full py-3 px-4 bg-[var(--bg-surface)] hover:bg-slate-800 text-[var(--text-primary)] border border-[var(--border-color)] rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
              >
                <span>{t.joinByCode}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Кнопка «Как работает исчезающий ход?» */}
      <button
        type="button"
        onClick={() => setShowRules(true)}
        className="mt-5 sm:mt-6 flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer py-1"
      >
        <HelpCircle className="w-4 h-4 text-cyan-400" />
        <span>{t.rulesBtn}</span>
      </button>

      {/* Модальное окно с подробным описанием механики игры */}
      {showRules && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-pop"
          onClick={() => setShowRules(false)}
        >
          <div
            className="w-full max-w-sm sm:max-w-md max-h-[85dvh] flex flex-col p-5 sm:p-6 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl sm:rounded-3xl shadow-2xl text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Шапка модалки */}
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)] shrink-0 mb-3.5">
              <div className="flex items-center gap-2 font-black text-base text-[var(--text-primary)]">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>{t.rulesTitle}</span>
              </div>
              <button
                type="button"
                onClick={() => setShowRules(false)}
                className="p-1.5 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Пункты механики со скроллом при необходимости */}
            <div className="overflow-y-auto pr-1 space-y-3 text-xs text-[var(--text-secondary)] leading-relaxed">
              <div className="p-3 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)]">
                <div className="flex items-center gap-2 font-bold text-sm text-[var(--text-primary)] mb-1">
                  <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>{t.rule1Title}</span>
                </div>
                <p className="opacity-90">{t.rule1Desc}</p>
              </div>

              <div className="p-3 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)]">
                <div className="flex items-center gap-2 font-bold text-sm text-[var(--text-primary)] mb-1">
                  <Eye className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>{t.rule2Title}</span>
                </div>
                <p className="opacity-90">{t.rule2Desc}</p>
              </div>

              <div className="p-3 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)]">
                <div className="flex items-center gap-2 font-bold text-sm text-[var(--text-primary)] mb-1">
                  <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{t.rule3Title}</span>
                </div>
                <p className="opacity-90">{t.rule3Desc}</p>
              </div>

              <div className="p-3 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)]">
                <div className="flex items-center gap-2 font-bold text-sm text-[var(--text-primary)] mb-1">
                  <Lightbulb className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{t.rule4Title}</span>
                </div>
                <p className="opacity-90">{t.rule4Desc}</p>
              </div>
            </div>

            {/* Кнопка закрытия */}
            <button
              type="button"
              onClick={() => setShowRules(false)}
              className="mt-4 w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-cyan-600/25 active:scale-95 text-center shrink-0"
            >
              {t.rulesGotIt}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
