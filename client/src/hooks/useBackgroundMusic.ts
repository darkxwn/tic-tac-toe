import { useState, useEffect, useRef, useCallback } from 'react';

const STORAGE_KEY = 'infinity_music_enabled';

export function useBackgroundMusic() {
  const [musicEnabled, setMusicEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      // По умолчанию включено, если не отключено пользователем
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Инициализация HTML5 Audio
  useEffect(() => {
    const audio = new Audio('/sounds/ambient.mp3');
    audio.loop = true;
    audio.volume = 0.10; // Мягкая, ненавязчивая фоновая громкость
    audioRef.current = audio;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  // Синхронизация воспроизведения с состоянием musicEnabled
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (musicEnabled) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Если браузер заблокировал автовоспроизведение до первого клика,
          // запускаем при первом взаимодействии пользователя с экраном
          const unlock = () => {
            if (audioRef.current && musicEnabled) {
              audioRef.current.play().catch(() => {});
            }
            window.removeEventListener('click', unlock);
            window.removeEventListener('touchstart', unlock);
          };
          window.addEventListener('click', unlock, { once: true });
          window.addEventListener('touchstart', unlock, { once: true });
        });
      }
    } else {
      audio.pause();
    }
  }, [musicEnabled]);

  const toggleMusic = useCallback(() => {
    setMusicEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        // Игнорируем ошибки localStorage
      }
      return next;
    });
  }, []);

  return { musicEnabled, toggleMusic, isPlaying };
}
