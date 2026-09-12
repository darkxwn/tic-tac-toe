import { useState, useEffect } from 'react';

const STORAGE_KEY = 'infinity_ttt_player_name';

export function usePlayerProfile() {
  const [playerName, setPlayerNameState] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && saved.trim()) return saved.trim();
    return `Игрок_${Math.floor(100 + Math.random() * 900)}`;
  });

  const savePlayerName = (name: string): string => {
    const trimmed = name.trim().slice(0, 16);
    const finalName = trimmed || `Игрок_${Math.floor(100 + Math.random() * 900)}`;
    setPlayerNameState(finalName);
    localStorage.setItem(STORAGE_KEY, finalName);
    return finalName;
  };

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY) && playerName.trim()) {
      localStorage.setItem(STORAGE_KEY, playerName.trim());
    }
  }, [playerName]);

  return { playerName, savePlayerName };
}
