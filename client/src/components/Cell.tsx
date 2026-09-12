import React from 'react';
import type { CellAgeInfo, CellValue } from '../types/game';
import { X, Circle } from 'lucide-react';

interface CellProps {
  index: number;
  value: CellValue;
  ageInfo: CellAgeInfo | null;
  isWinningCell: boolean;
  disabled: boolean;
  onClick: () => void;
}

export const Cell: React.FC<CellProps> = ({
  value,
  ageInfo,
  isWinningCell,
  disabled,
  onClick,
}) => {
  const isX = value === 'X';
  const isOldest = ageInfo?.isOldest ?? false;
  const opacity = ageInfo ? ageInfo.opacity : 1;

  return (
    <button
      onClick={onClick}
      disabled={disabled || value !== null}
      aria-label={`Клетка`}
      className={`
        relative flex items-center justify-center aspect-square rounded-2xl
        transition-all duration-200 select-none
        border-2
        ${
          isWinningCell
            ? 'bg-amber-500/20 border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.5)] scale-105 z-10'
            : value
            ? 'bg-[var(--bg-surface)] border-[var(--border-color)]'
            : 'bg-[var(--bg-surface)]/50 border-[var(--border-color)]/70 hover:border-slate-500 hover:scale-[1.02] active:scale-95 cursor-pointer'
        }
        ${disabled ? 'cursor-not-allowed opacity-80' : ''}
      `}
    >
      {/* Отрисовка символа (прозрачность и мягкая пульсация для исчезающей фигуры) */}
      {value && (
        <div
          style={{ opacity }}
          className={`
            transition-all duration-300 transform flex items-center justify-center
            ${isOldest ? 'animate-critical' : 'animate-pop'}
          `}
        >
          {isX ? (
            <X
              style={{ color: isWinningCell ? undefined : 'var(--color-x)' }}
              className={`w-16 h-16 sm:w-20 sm:h-20 stroke-[3] drop-shadow-md ${
                isWinningCell ? 'text-amber-300' : ''
              }`}
            />
          ) : (
            <Circle
              style={{ color: isWinningCell ? undefined : 'var(--color-o)' }}
              className={`w-14 h-14 sm:w-18 sm:h-18 stroke-[3.5] drop-shadow-md ${
                isWinningCell ? 'text-amber-300' : ''
              }`}
            />
          )}
        </div>
      )}
    </button>
  );
};
