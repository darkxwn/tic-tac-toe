import { useState, useCallback } from 'react';
import type { BotDifficulty, GameMode } from '../types/game';

const STATS_STORAGE_KEY = 'infinity_ttt_stats';

export interface GameStats {
  bot: {
    easy: { wins: number; losses: number };
    medium: { wins: number; losses: number };
    hard: { wins: number; losses: number };
  };
  multiplayer: {
    hotseat: { games: number };
    online: { wins: number; losses: number };
  };
}

const DEFAULT_STATS: GameStats = {
  bot: {
    easy: { wins: 0, losses: 0 },
    medium: { wins: 0, losses: 0 },
    hard: { wins: 0, losses: 0 },
  },
  multiplayer: {
    hotseat: { games: 0 },
    online: { wins: 0, losses: 0 },
  },
};

export function useGameStats() {
  const [stats, setStats] = useState<GameStats>(() => {
    try {
      const saved = localStorage.getItem(STATS_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Игнорируем ошибки парсинга
    }
    return DEFAULT_STATS;
  });

  const saveStats = (newStats: GameStats) => {
    setStats(newStats);
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(newStats));
  };

  const recordResult = useCallback(
    (mode: GameMode, isWin: boolean, difficulty?: BotDifficulty) => {
      setStats((prev) => {
        const next: GameStats = JSON.parse(JSON.stringify(prev));

        if (mode === 'bot' && difficulty) {
          if (isWin) {
            next.bot[difficulty].wins += 1;
          } else {
            next.bot[difficulty].losses += 1;
          }
        } else if (mode === 'online') {
          if (isWin) {
            next.multiplayer.online.wins += 1;
          } else {
            next.multiplayer.online.losses += 1;
          }
        } else if (mode === 'hotseat') {
          next.multiplayer.hotseat.games += 1;
        }

        localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    []
  );

  const resetStats = useCallback(() => {
    saveStats(DEFAULT_STATS);
  }, []);

  return { stats, recordResult, resetStats };
}
