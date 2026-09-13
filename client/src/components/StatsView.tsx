import React, { useState } from 'react';
import type { GameStats } from '../hooks/useGameStats';
import {
  ArrowLeft,
  BarChart3,
  Bot,
  Users,
  Globe,
  Smartphone,
  RotateCcw,
  SignalLow,
  SignalMedium,
  SignalHigh,
} from 'lucide-react';

interface StatsViewProps {
  stats: GameStats;
  t: {
    back: string;
    statsTitle: string;
    yourStats: string;
    statsDesc: string;
    wins: string;
    losses: string;
    winrate: string;
    singleplayer: string;
    diffEasy: string;
    diffMedium: string;
    diffHard: string;
    multiplayer: string;
    online: string;
    onOneDevice: string;
    gamesPlayed: string;
    resetStats: string;
    confirmResetTitle: string;
    yes: string;
    cancel: string;
  };
  onBack: () => void;
  onReset: () => void;
}

export const StatsView: React.FC<StatsViewProps> = ({ stats, t, onBack, onReset }) => {
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  // Расчет общих показателей
  const totalBotWins =
    stats.bot.easy.wins + stats.bot.medium.wins + stats.bot.hard.wins;
  const totalBotLosses =
    stats.bot.easy.losses + stats.bot.medium.losses + stats.bot.hard.losses;

  const totalOnlineWins = stats.multiplayer.online.wins;
  const totalOnlineLosses = stats.multiplayer.online.losses;

  const totalWins = totalBotWins + totalOnlineWins;
  const totalLosses = totalBotLosses + totalOnlineLosses;
  const totalCompetitiveGames = totalWins + totalLosses;

  const winRate =
    totalCompetitiveGames > 0
      ? Math.round((totalWins / totalCompetitiveGames) * 100)
      : 0;

  const calcRate = (w: number, l: number) => {
    const total = w + l;
    return total > 0 ? `${Math.round((w / total) * 100)}%` : '—';
  };

  return (
    <div className="w-full p-4 sm:p-6 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl sm:rounded-3xl shadow-2xl animate-pop">
      {/* Шапка с кнопкой назад */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer py-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.back}</span>
        </button>
        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
          <BarChart3 className="w-4 h-4" />
          <span>{t.statsTitle}</span>
        </div>
      </div>

      <h2 className="text-xl font-black text-[var(--text-primary)] mb-1 min-h-[28px] flex items-center">
        {t.yourStats}
      </h2>
      <p className="text-xs text-[var(--text-secondary)] mb-5 min-h-[16px] sm:min-h-[18px]">
        {t.statsDesc}
      </p>

      {/* Общие карточки */}
      <div className="grid grid-cols-3 gap-2.5 mb-5 text-center">
        <div className="p-3 rounded-2xl bg-[var(--bg-surface)] border border-emerald-500/30 min-h-[74px] flex flex-col justify-center">
          <div className="text-[11px] font-bold text-[var(--text-secondary)] uppercase mb-0.5 truncate">{t.wins}</div>
          <div className="text-xl sm:text-2xl font-black text-emerald-400">{totalWins}</div>
        </div>

        <div className="p-3 rounded-2xl bg-[var(--bg-surface)] border border-rose-500/30 min-h-[74px] flex flex-col justify-center">
          <div className="text-[11px] font-bold text-[var(--text-secondary)] uppercase mb-0.5 truncate">{t.losses}</div>
          <div className="text-xl sm:text-2xl font-black text-rose-400">{totalLosses}</div>
        </div>

        <div className="p-3 rounded-2xl bg-[var(--bg-surface)] border border-amber-500/30 min-h-[74px] flex flex-col justify-center">
          <div className="text-[11px] font-bold text-[var(--text-secondary)] uppercase mb-0.5 truncate">{t.winrate}</div>
          <div className="text-xl sm:text-2xl font-black text-amber-400">{winRate}%</div>
        </div>
      </div>

      {/* РАЗДЕЛ 1: Одиночная игра */}
      <div className="mb-5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-purple-400 uppercase tracking-wider mb-2.5">
          <Bot className="w-4 h-4" />
          <span>{t.singleplayer}</span>
        </div>

        <div className="flex flex-col gap-2">
          {/* Уровень: Новичок */}
          <div className="min-h-[48px] sm:min-h-[52px] p-2.5 sm:p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0">
                <SignalLow className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-[var(--text-primary)]">{t.diffEasy}</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold shrink-0">
              <span className="text-emerald-400 font-bold">{stats.bot.easy.wins}</span>
              <span className="text-slate-600">/</span>
              <span className="text-rose-400 font-bold">{stats.bot.easy.losses}</span>
              <span className="text-[11px] text-[var(--text-secondary)] w-10 text-right font-mono ml-1">
                {calcRate(stats.bot.easy.wins, stats.bot.easy.losses)}
              </span>
            </div>
          </div>

          {/* Уровень: Средний */}
          <div className="min-h-[48px] sm:min-h-[52px] p-2.5 sm:p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 shrink-0">
                <SignalMedium className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-[var(--text-primary)]">{t.diffMedium}</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold shrink-0">
              <span className="text-emerald-400 font-bold">{stats.bot.medium.wins}</span>
              <span className="text-slate-600">/</span>
              <span className="text-rose-400 font-bold">{stats.bot.medium.losses}</span>
              <span className="text-[11px] text-[var(--text-secondary)] w-10 text-right font-mono ml-1">
                {calcRate(stats.bot.medium.wins, stats.bot.medium.losses)}
              </span>
            </div>
          </div>

          {/* Уровень: Сложный */}
          <div className="min-h-[48px] sm:min-h-[52px] p-2.5 sm:p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400 shrink-0">
                <SignalHigh className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-[var(--text-primary)]">{t.diffHard}</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold shrink-0">
              <span className="text-emerald-400 font-bold">{stats.bot.hard.wins}</span>
              <span className="text-slate-600">/</span>
              <span className="text-rose-400 font-bold">{stats.bot.hard.losses}</span>
              <span className="text-[11px] text-[var(--text-secondary)] w-10 text-right font-mono ml-1">
                {calcRate(stats.bot.hard.wins, stats.bot.hard.losses)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* РАЗДЕЛ 2: Мультиплеер */}
      <div className="mb-6">
        <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2.5">
          <Users className="w-4 h-4" />
          <span>{t.multiplayer}</span>
        </div>

        <div className="flex flex-col gap-2">
          {/* По сети */}
          <div className="min-h-[48px] sm:min-h-[52px] p-2.5 sm:p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 shrink-0">
                <Globe className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-[var(--text-primary)]">{t.online}</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold shrink-0">
              <span className="text-emerald-400 font-bold">{stats.multiplayer.online.wins}</span>
              <span className="text-slate-600">/</span>
              <span className="text-rose-400 font-bold">{stats.multiplayer.online.losses}</span>
              <span className="text-[11px] text-[var(--text-secondary)] w-10 text-right font-mono ml-1">
                {calcRate(stats.multiplayer.online.wins, stats.multiplayer.online.losses)}
              </span>
            </div>
          </div>

          {/* На одном устройстве */}
          <div className="min-h-[48px] sm:min-h-[52px] p-2.5 sm:p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shrink-0">
                <Smartphone className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-[var(--text-primary)] truncate">{t.onOneDevice}</span>
            </div>
            <div className="text-xs font-semibold text-[var(--text-secondary)] shrink-0 ml-2 whitespace-nowrap">
              {stats.multiplayer.hotseat.games} {t.gamesPlayed}
            </div>
          </div>
        </div>
      </div>

      {/* Кнопка сброса статистики */}
      {!showConfirmReset ? (
        <button
          type="button"
          onClick={() => setShowConfirmReset(true)}
          className="w-full py-2.5 text-xs text-[var(--text-secondary)] hover:text-rose-400 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{t.resetStats}</span>
        </button>
      ) : (
        <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 flex items-center justify-between gap-2 animate-pop">
          <span className="text-xs text-rose-200">{t.confirmResetTitle}</span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                onReset();
                setShowConfirmReset(false);
              }}
              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
            >
              {t.yes}
            </button>
            <button
              onClick={() => setShowConfirmReset(false)}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-all cursor-pointer"
            >
              {t.cancel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
