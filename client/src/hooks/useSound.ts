import { useState, useCallback, useEffect, useRef } from 'react';

const SOUND_ENABLED_KEY = 'infinity_sound_enabled';
const SOUND_VOLUME_KEY = 'infinity_sound_volume';

type SoundType = 'move' | 'click';

export function useSound() {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(SOUND_ENABLED_KEY);
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const [soundVolume, setSoundVolumeState] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(SOUND_VOLUME_KEY);
      return saved !== null ? Math.max(0, Math.min(1, parseFloat(saved))) : 0.5;
    } catch {
      return 0.5;
    }
  });

  const movePoolRef = useRef<HTMLAudioElement[]>([]);
  const clickPoolRef = useRef<HTMLAudioElement[]>([]);
  const poolIndexRef = useRef<{ move: number; click: number }>({ move: 0, click: 0 });
  const soundVolumeRef = useRef(soundVolume);
  soundVolumeRef.current = soundVolume;
  const soundEnabledRef = useRef(soundEnabled);
  soundEnabledRef.current = soundEnabled;

  useEffect(() => {
    // Пул аудио-элементов для мгновенного воспроизведения без прерываний и задержек
    const POOL_SIZE = 4;
    const vol = soundVolumeRef.current;

    movePoolRef.current = Array.from({ length: POOL_SIZE }, () => {
      const a = new Audio('/sounds/move.wav');
      a.preload = 'auto';
      a.volume = Math.min(1, vol * 0.7);
      return a;
    });

    clickPoolRef.current = Array.from({ length: POOL_SIZE }, () => {
      const a = new Audio('/sounds/click.wav');
      a.preload = 'auto';
      a.volume = Math.min(1, vol * 0.4);
      return a;
    });

    return () => {
      movePoolRef.current.forEach((a) => a.pause());
      clickPoolRef.current.forEach((a) => a.pause());
      movePoolRef.current = [];
      clickPoolRef.current = [];
    };
  }, []);

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setSoundVolume = useCallback((newVol: number) => {
    const clamped = Math.max(0, Math.min(1, newVol));
    setSoundVolumeState(clamped);
    soundVolumeRef.current = clamped;

    if (clamped > 0 && !soundEnabledRef.current) {
      setSoundEnabled(true);
      soundEnabledRef.current = true;
      try {
        localStorage.setItem(SOUND_ENABLED_KEY, 'true');
      } catch {
        // ignore
      }
    }

    // Дебаунс сохранения в localStorage, чтобы не блокировать поток на мобильных при перетаскивании
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(SOUND_VOLUME_KEY, String(clamped));
      } catch {
        // ignore
      }
    }, 250);

    movePoolRef.current.forEach((a) => {
      a.volume = Math.min(1, clamped * 0.7);
    });
    clickPoolRef.current.forEach((a) => {
      a.volume = Math.min(1, clamped * 0.4);
    });
  }, []);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      soundEnabledRef.current = next;
      try {
        localStorage.setItem(SOUND_ENABLED_KEY, String(next));
      } catch {
        // ignore
      }
      if (next && soundVolumeRef.current === 0) {
        setSoundVolume(0.5);
      }
      return next;
    });
  }, [setSoundVolume]);

  const playSound = useCallback((type: SoundType) => {
    if (!soundEnabledRef.current || soundVolumeRef.current <= 0) return;

    try {
      const pool = type === 'move' ? movePoolRef.current : clickPoolRef.current;
      if (pool.length > 0) {
        const idx = poolIndexRef.current[type] % pool.length;
        poolIndexRef.current[type] = idx + 1;
        const audio = pool[idx];

        audio.currentTime = 0;
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            const unlock = () => {
              audio.play().catch(() => {});
              window.removeEventListener('pointerdown', unlock);
              window.removeEventListener('touchstart', unlock);
            };
            window.addEventListener('pointerdown', unlock, { once: true });
            window.addEventListener('touchstart', unlock, { once: true });
          });
        }
      }

      // Тактильный виброотклик для смартфонов при установке фигуры
      if ('vibrate' in navigator && type === 'move') {
        navigator.vibrate(25);
      }
    } catch {
      // Игнорируем ошибки воспроизведения
    }
  }, []);

  return {
    soundEnabled,
    soundVolume,
    setSoundVolume,
    toggleSound,
    playSound,
  };
}
