import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Home, Loader2, Check } from 'lucide-react';
import type { Player } from '../types/game';

interface GameOverModalProps {
  winner: Player;
  winnerName: string;
  isOnline: boolean;
  rematchRequestedByMe: boolean;
  rematchOfferedByOpponent: boolean;
  t: {
    victory: string;
    wonLinedUp: string;
    opponentOfferedRematch: string;
    waitingOpponentRematch: string;
    acceptRematch: string;
    offerRematch: string;
    rematch: string;
    menuBtn: string;
  };
  onRematch: () => void;
  onHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  winner,
  winnerName,
  isOnline,
  rematchRequestedByMe,
  rematchOfferedByOpponent,
  t,
  onRematch,
  onHome,
}) => {
  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: winner === 'X' ? ['#22d3ee', '#06b6d4', '#ffffff'] : ['#fb7185', '#f43f5e', '#ffffff'],
      });
    } catch {
      // Игнорируем
    }
  }, [winner]);

  const isX = winner === 'X';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-pop">
      <div className="w-full max-w-sm p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-center">
        <div
          className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
            isX ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
          }`}
        >
          <Trophy className="w-9 h-9 animate-bounce" />
        </div>

        <h2 className="text-2xl font-black text-slate-100 tracking-tight mb-1">
          {t.victory}
        </h2>
        <p className="text-slate-400 text-sm mb-6">
          <span className={`font-bold ${isX ? 'text-cyan-400' : 'text-rose-400'}`}>
            {winnerName}
          </span>{' '}
          {t.wonLinedUp}
        </p>

        {/* Уведомление о реванше от соперника */}
        {isOnline && rematchOfferedByOpponent && !rematchRequestedByMe && (
          <div className="mb-4 p-2.5 bg-indigo-950/60 border border-indigo-500/40 rounded-xl text-xs text-indigo-200 flex items-center justify-center gap-1.5 animate-pulse">
            <span>{t.opponentOfferedRematch}</span>
          </div>
        )}

        <div className="flex flex-col gap-2.5">
          <button
            onClick={onRematch}
            disabled={rematchRequestedByMe}
            className={`
              w-full py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all
              ${
                rematchRequestedByMe
                  ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
                  : isOnline && rematchOfferedByOpponent
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/25 active:scale-98'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 active:scale-98 cursor-pointer'
              }
            `}
          >
            {rematchRequestedByMe ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                <span>{t.waitingOpponentRematch}</span>
              </>
            ) : isOnline && rematchOfferedByOpponent ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>{t.acceptRematch}</span>
              </>
            ) : (
              <>
                <RotateCcw className="w-4 h-4 stroke-[2.5]" />
                <span>{isOnline ? t.offerRematch : t.rematch}</span>
              </>
            )}
          </button>

          <button
            onClick={onHome}
            className="w-full py-3 px-4 rounded-xl font-semibold text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
          >
            <Home className="w-4 h-4 shrink-0" />
            <span className="whitespace-nowrap">{t.menuBtn}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
