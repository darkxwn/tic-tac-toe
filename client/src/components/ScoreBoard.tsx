import React from 'react';
import type { Player, PlayerProfiles, PlayerQueues, BotDifficulty } from '../types/game';
import { X, Circle, SignalLow, SignalMedium, SignalHigh } from 'lucide-react';

interface ScoreBoardProps {
  currentTurn: Player;
  players: PlayerProfiles;
  scores: { X: number; O: number };
  queues: PlayerQueues;
  myRole?: Player | null; // Для онлайн-игры (чтобы знать "Вы")
  botDifficulty?: BotDifficulty | null; // Для одиночной игры (иконка уровня)
  t?: {
    turnBadge: string;
    youBadge: string;
    diffEasy: string;
    diffMedium: string;
    diffHard: string;
  };
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  currentTurn,
  players,
  scores,
  queues,
  myRole,
  botDifficulty,
  t,
}) => {
  const turnBadge = t?.turnBadge || 'Ходит';
  const youBadge = t?.youBadge || '(Вы)';
  const diffLabels = {
    easy: t?.diffEasy || 'Новичок',
    medium: t?.diffMedium || 'Средний',
    hard: t?.diffHard || 'Сложный',
  };

  const renderDots = (count: number, player: Player) => {
    return (
      <div className="flex gap-1.5 mt-1.5 justify-center">
        {[0, 1, 2].map((i) => {
          const isFilled = i < count;
          const isOldest = isFilled && count === 3 && i === 0;
          return (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                isFilled
                  ? player === 'X'
                    ? isOldest
                      ? 'bg-cyan-500/40 animate-pulse border border-cyan-400'
                      : 'bg-[var(--color-x)] shadow-[0_0_8px_var(--color-x-glow)]'
                    : isOldest
                    ? 'bg-rose-500/40 animate-pulse border border-rose-400'
                    : 'bg-[var(--color-o)] shadow-[0_0_8px_var(--color-o-glow)]'
                  : 'bg-[var(--border-color)]/60'
              }`}
            />
          );
        })}
      </div>
    );
  };

  const renderBotDifficultyIcon = () => {
    if (!botDifficulty) return null;
    switch (botDifficulty) {
      case 'easy':
        return (
          <span title={`Difficulty: ${diffLabels.easy}`} className="flex items-center">
            <SignalLow className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          </span>
        );
      case 'medium':
        return (
          <span title={`Difficulty: ${diffLabels.medium}`} className="flex items-center">
            <SignalMedium className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          </span>
        );
      case 'hard':
        return (
          <span title={`Difficulty: ${diffLabels.hard}`} className="flex items-center">
            <SignalHigh className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          </span>
        );
      default:
        return null;
    }
  };

  const isXTurn = currentTurn === 'X';

  return (
    <div className="w-full max-w-[420px] mx-auto mb-4">
      <div className="grid grid-cols-2 gap-3">
        {/* Игрок X */}
        <div
          className={`relative p-3 rounded-2xl border transition-all duration-300 ${
            isXTurn
              ? 'bg-[var(--bg-surface)] border-cyan-500 shadow-[0_0_15px_var(--color-x-glow)] ring-1 ring-cyan-400'
              : 'bg-[var(--bg-card)] border-[var(--border-color)] opacity-75'
          }`}
        >
          {isXTurn && (
            <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-cyan-500 text-slate-950 font-black text-[9px] rounded-full uppercase tracking-wider">
              {turnBadge}
            </span>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 min-w-0">
              <X className="w-5 h-5 text-[var(--color-x)] shrink-0 stroke-[3]" />
              <div className="truncate font-semibold text-sm text-[var(--text-primary)]">
                {players.X}
                {myRole === 'X' && <span className="text-[11px] text-cyan-400 ml-1 font-normal">{youBadge}</span>}
              </div>
            </div>
            <div className="text-lg font-black text-[var(--color-x)] ml-2">{scores.X}</div>
          </div>
          {renderDots(queues.X.length, 'X')}
        </div>

        {/* Игрок O */}
        <div
          className={`relative p-3 rounded-2xl border transition-all duration-300 ${
            !isXTurn
              ? 'bg-[var(--bg-surface)] border-rose-500 shadow-[0_0_15px_var(--color-o-glow)] ring-1 ring-rose-400'
              : 'bg-[var(--bg-card)] border-[var(--border-color)] opacity-75'
          }`}
        >
          {!isXTurn && (
            <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-rose-500 text-slate-950 font-black text-[9px] rounded-full uppercase tracking-wider">
              {turnBadge}
            </span>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 min-w-0">
              <Circle className="w-4 h-4 text-[var(--color-o)] shrink-0 stroke-[3]" />
              <div className="flex items-center gap-1 truncate font-semibold text-sm text-[var(--text-primary)]">
                <span className="truncate">{players.O}</span>
                {renderBotDifficultyIcon()}
                {myRole === 'O' && <span className="text-[11px] text-rose-400 ml-1 font-normal">{youBadge}</span>}
              </div>
            </div>
            <div className="text-lg font-black text-[var(--color-o)] ml-2">{scores.O}</div>
          </div>
          {renderDots(queues.O.length, 'O')}
        </div>
      </div>
    </div>
  );
};
