import React from 'react';
import type { BoardState, PlayerQueues } from '../types/game';
import { getCellAgeInfo } from '../logic/gameLogic';
import { Cell } from './Cell';

interface BoardProps {
  board: BoardState;
  queues: PlayerQueues;
  winningLine: number[] | null;
  disabled: boolean;
  onCellClick: (index: number) => void;
}

export const Board: React.FC<BoardProps> = ({
  board,
  queues,
  winningLine,
  disabled,
  onCellClick,
}) => {
  // Вычисление координат прочерчивания линии
  const lineCoords = React.useMemo(() => {
    if (!winningLine || winningLine.length < 3) return null;

    const start = winningLine[0];
    const end = winningLine[winningLine.length - 1];

    const col1 = start % 3;
    const row1 = Math.floor(start / 3);
    const col2 = end % 3;
    const row2 = Math.floor(end / 3);

    const cx1 = (col1 + 0.5) * (100 / 3);
    const cy1 = (row1 + 0.5) * (100 / 3);
    const cx2 = (col2 + 0.5) * (100 / 3);
    const cy2 = (row2 + 0.5) * (100 / 3);

    const dx = cx2 - cx1;
    const dy = cy2 - cy1;
    const len = Math.sqrt(dx * dx + dy * dy);
    const ext = 8; // легкий вылет за пределы центров клеток

    const x1 = cx1 - (dx / len) * ext;
    const y1 = cy1 - (dy / len) * ext;
    const x2 = cx2 + (dx / len) * ext;
    const y2 = cy2 + (dy / len) * ext;

    return { x1: `${x1}%`, y1: `${y1}%`, x2: `${x2}%`, y2: `${y2}%` };
  }, [winningLine]);

  return (
    <div className="relative w-full max-w-[360px] sm:max-w-[420px] aspect-square mx-auto p-3.5 bg-[var(--bg-card)] rounded-3xl border border-[var(--border-color)] shadow-2xl backdrop-blur-md transition-colors duration-300">
      <div className="grid grid-cols-3 grid-rows-3 gap-2.5 h-full w-full">
        {board.map((cellValue, idx) => {
          const ageInfo = getCellAgeInfo(idx, queues);
          const isWinning = winningLine?.includes(idx) ?? false;

          return (
            <Cell
              key={idx}
              index={idx}
              value={cellValue}
              ageInfo={ageInfo}
              isWinningCell={isWinning}
              disabled={disabled}
              onClick={() => onCellClick(idx)}
            />
          );
        })}
      </div>

      {/* Анимированная победная линия */}
      {lineCoords && (
        <svg
          className="absolute inset-0 pointer-events-none z-30 w-full h-full p-3.5 overflow-visible"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <line
            x1={lineCoords.x1}
            y1={lineCoords.y1}
            x2={lineCoords.x2}
            y2={lineCoords.y2}
            stroke="var(--line-color, #38bdf8)"
            strokeWidth="3.5"
            strokeLinecap="round"
            filter="url(#glow)"
            className="animate-strike-line"
          />
        </svg>
      )}
    </div>
  );
};
