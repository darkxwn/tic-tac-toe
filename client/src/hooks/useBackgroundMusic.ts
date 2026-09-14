import { useState, useEffect, useRef, useCallback } from 'react';

const STORAGE_KEY = 'infinity_music_enabled';
const VOLUME_KEY = 'infinity_music_volume';

export function useBackgroundMusic() {
  const [musicEnabled, setMusicEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const [musicVolume, setMusicVolumeState] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(VOLUME_KEY);
      return saved !== null ? Math.max(0, Math.min(1, parseFloat(saved))) : 0.35;
    } catch {
      return 0.35;
    }
  });

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const musicVolumeRef = useRef(musicVolume);
  musicVolumeRef.current = musicVolume;
  const musicEnabledRef = useRef(musicEnabled);
  musicEnabledRef.current = musicEnabled;

  // Инициализация HTML5 Audio
  useEffect(() => {
    const audio = new Audio('/sounds/ambient.mp3');
    audio.loop = true;
    audio.volume = Math.min(1, musicVolumeRef.current * 0.4);
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

    if (musicEnabled && musicVolumeRef.current > 0) {
      audio.volume = Math.min(1, musicVolumeRef.current * 0.4);
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          const unlock = () => {
            if (audioRef.current && musicEnabledRef.current && !document.hidden && musicVolumeRef.current > 0) {
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

  // Приостановка музыки при блокировке экрана / сворачивании приложения
  useEffect(() => {
    const handleVisibilityChange = () => {
      const audio = audioRef.current;
      if (!audio) return;

      if (document.hidden || document.visibilityState === 'hidden') {
        audio.pause();
      } else if (musicEnabledRef.current && musicVolumeRef.current > 0) {
        audio.play().catch(() => {});
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handleVisibilityChange);
    window.addEventListener('pageshow', handleVisibilityChange);
    window.addEventListener('blur', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handleVisibilityChange);
      window.removeEventListener('pageshow', handleVisibilityChange);
      window.removeEventListener('blur', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, []);

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setMusicVolume = useCallback((newVol: number) => {
    const clamped = Math.max(0, Math.min(1, newVol));
    setMusicVolumeState(clamped);
    musicVolumeRef.current = clamped;

    if (clamped > 0 && !musicEnabledRef.current) {
      setMusicEnabled(true);
      musicEnabledRef.current = true;
      try {
        localStorage.setItem(STORAGE_KEY, 'true');
      } catch {
        // ignore
      }
    }

    // Дебаунс сохранения в localStorage, чтобы не блокировать поток на мобильных при перетаскивании
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(VOLUME_KEY, String(clamped));
      } catch {
        // ignore
      }
    }, 250);

    if (audioRef.current) {
      audioRef.current.volume = Math.min(1, clamped * 0.4);
      if (clamped === 0) {
        audioRef.current.pause();
      } else if (musicEnabledRef.current && audioRef.current.paused) {
        audioRef.current.play().catch(() => {});
      }
    }
  }, []);

  const toggleMusic = useCallback(() => {
    setMusicEnabled((prev) => {
      const next = !prev;
      musicEnabledRef.current = next;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        // ignore
      }
      if (next && musicVolumeRef.current === 0) {
        setMusicVolume(0.35);
      }
      return next;
    });
  }, [setMusicVolume]);

  return {
    musicEnabled,
    musicVolume,
    setMusicVolume,
    toggleMusic,
    isPlaying,
  };
}
