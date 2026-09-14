import React from 'react';
import type { SideChoice } from '../types/game';
import type { Translations } from '../i18n/translations';
import { X as XIcon, Circle as OIcon, Sparkles } from 'lucide-react';

interface SideSelectorProps {
  value: SideChoice;
  onChange: (side: SideChoice) => void;
  label?: string;
  t: Translations;
}

export const SideSelector: React.FC<SideSelectorProps> = ({
  value,
  onChange,
  label,
  t,
}) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
        {label || t.chooseSide}
      </span>
      <div className="grid grid-cols-3 gap-2">
        {/* Кнопка X */}
        <button
          type="button"
          onClick={() => onChange('X')}
          className={`py-2 px-2 rounded-2xl border transition-all flex flex-col items-center justify-center gap-1 cursor-pointer active:scale-95 ${
            value === 'X'
              ? 'bg-cyan-500/15 border-cyan-500/60 text-cyan-400 shadow-sm shadow-cyan-500/20 font-black'
              : 'bg-[var(--bg-surface)] border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-cyan-500/30'
          }`}
        >
          <div className="flex items-center gap-1">
            <XIcon className="w-4 h-4 stroke-[2.5]"/>
            <span className="text-xs font-extrabold"></span>
          </div>
          <span className="text-[10px] font-medium opacity-80 whitespace-nowrap">
            {t.sideFirstTurn}
          </span>
        </button>

        {/* Кнопка Случайно */}
        <button
          type="button" 
          onClick={() => onChange('random')}
          className={`py-2 px-2 rounded-2xl border transition-all flex flex-col items-center justify-center gap-1 cursor-pointer active:scale-95 ${
            value === 'random'
              ? 'bg-purple-500/15 border-purple-500/60 text-purple-400 shadow-sm shadow-purple-500/20 font-black'
              : 'bg-[var(--bg-surface)] border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-purple-500/30'
          }`}
        >
          <div className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="text-xs font-extrabold">{t.sideRandom}</span>
          </div>
          <span className="text-[10px] font-medium opacity-80 whitespace-nowrap">
            {t.sideRandomDesc}
          </span>
        </button>

        {/* Кнопка O */}
        <button
          type="button"
          onClick={() => onChange('O')}
          className={`py-2 px-2 rounded-2xl border transition-all flex flex-col items-center justify-center gap-1 cursor-pointer active:scale-95 ${
            value === 'O'
              ? 'bg-rose-500/15 border-rose-500/60 text-rose-400 shadow-sm shadow-rose-500/20 font-black'
              : 'bg-[var(--bg-surface)] border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-rose-500/30'
          }`}
        >
          <div className="flex items-center gap-1">
            <OIcon className="w-4 h-4 stroke-[2.5]" />
            <span className="text-xs font-extrabold"></span>
          </div>
          <span className="text-[10px] font-medium opacity-80 whitespace-nowrap">
            {t.sideSecondTurn}
          </span>
        </button>
      </div>
    </div>
  );
};
