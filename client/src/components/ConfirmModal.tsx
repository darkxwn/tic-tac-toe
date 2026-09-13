import React, { useEffect } from 'react';
import { AlertTriangle, LogOut } from 'lucide-react';

interface ConfirmModalProps {
  title: string;
  desc: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  title,
  desc,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-pop"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-xs sm:max-w-sm p-5 sm:p-6 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl sm:rounded-3xl shadow-2xl text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-black text-[var(--text-primary)] mb-1">
          {title}
        </h3>
        <p className="text-xs text-[var(--text-secondary)] mb-5 leading-relaxed">
          {desc}
        </p>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={onConfirm}
            className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-rose-600/25 active:scale-95 whitespace-nowrap"
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            <span className="whitespace-nowrap">{confirmText}</span>
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="w-full py-2.5 px-4 bg-[var(--bg-surface)] hover:bg-slate-800 text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color)] rounded-xl text-xs font-semibold transition-all flex items-center justify-center cursor-pointer active:scale-95"
          >
            <span>{cancelText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
