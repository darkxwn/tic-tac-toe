import React, { useState } from 'react';
import { Copy, Check, Users, Loader2, ArrowLeft, Share2 } from 'lucide-react';

interface LobbyModalProps {
  roomCode: string | null;
  isHost: boolean;
  t: {
    roomCreated: string;
    roomCreatedDesc: string;
    shareLink: string;
    waitingOpponentConnect: string;
    joinTitle: string;
    joinDesc: string;
    joinBtn: string;
    codePlaceholder: string;
    back: string;
  };
  onJoinRoom: (code: string) => void;
  onCancel: () => void;
}

export const LobbyModal: React.FC<LobbyModalProps> = ({
  roomCode,
  isHost,
  t,
  onJoinRoom,
  onCancel,
}) => {
  const [inputCode, setInputCode] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!roomCode) return;
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (!roomCode) return;
    const url = `${window.location.origin}?room=${roomCode}`;
    if (navigator.share) {
      navigator.share({
        title: 'Infinity Tic-Tac-Toe',
        text: `Room Code: ${roomCode}`,
        url,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-pop">
      <div className="w-full max-w-sm p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-center">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center">
          <Users className="w-7 h-7" />
        </div>

        {isHost ? (
          <div>
            <h3 className="text-xl font-bold text-slate-100 mb-1">{t.roomCreated}</h3>
            <p className="text-xs text-slate-400 mb-5">
              {t.roomCreatedDesc}
            </p>

            <div className="flex items-center justify-center gap-2 p-4 mb-4 bg-slate-950 border border-slate-800 rounded-2xl">
              <span className="font-mono text-3xl font-black tracking-widest text-cyan-400">
                {roomCode || '....'}
              </span>
              <button
                onClick={handleCopy}
                title="Copy code"
                className="p-2 ml-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>

            <div className="flex gap-2 mb-6">
              <button
                onClick={handleShare}
                className="flex-1 py-2.5 px-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-slate-300 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>{t.shareLink}</span>
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-slate-400 mb-6 bg-slate-950/50 py-2.5 px-3 rounded-xl border border-slate-800/80">
              <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
              <span>{t.waitingOpponentConnect}</span>
            </div>
          </div>
        ) : (
          <div>
            <h3 className="text-xl font-bold text-slate-100 mb-1">{t.joinTitle}</h3>
            <p className="text-xs text-slate-400 mb-5">
              {t.joinDesc}
            </p>

            <input
              type="text"
              maxLength={6}
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              placeholder={t.codePlaceholder}
              className="w-full text-center font-mono text-2xl font-black tracking-widest py-3 px-4 mb-5 bg-slate-950 border-2 border-slate-800 focus:border-indigo-500 rounded-2xl outline-none text-cyan-400 placeholder:text-slate-700"
            />

            <button
              onClick={() => onJoinRoom(inputCode)}
              disabled={inputCode.trim().length < 3}
              className="w-full py-3 px-4 mb-3 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
            >
              {t.joinBtn}
            </button>
          </div>
        )}

        <button
          onClick={onCancel}
          className="w-full py-2.5 px-4 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t.back}</span>
        </button>
      </div>
    </div>
  );
};
