import { useCallback, useEffect, useRef } from 'react';

type SoundType = 'move' | 'click';

export function useSound() {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioBuffersRef = useRef<Record<string, AudioBuffer>>({});

  // Инициализация AudioContext и предзагрузка WAV-файлов для мгновенного воспроизведения (0ms задержки)
  useEffect(() => {
    let isCancelled = false;

    const initAudio = async () => {
      try {
        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioContextClass) return;

        if (!audioCtxRef.current) {
          audioCtxRef.current = new AudioContextClass();
        }
        const ctx = audioCtxRef.current;

        const sounds = ['move', 'click'] as const;
        for (const name of sounds) {
          if (isCancelled) break;
          try {
            const res = await fetch(`/sounds/${name}.wav`);
            if (res.ok) {
              const arrayBuffer = await res.arrayBuffer();
              const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
              if (!isCancelled) {
                audioBuffersRef.current[name] = audioBuffer;
              }
            }
          } catch {
            // Файл будет воспроизведен через fallback
          }
        }
      } catch {
        // Игнорируем ограничения автоплея
      }
    };

    initAudio();

    // Разблокировка AudioContext при первом жесте на мобильных устройствах
    const unlockAudio = () => {
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume().catch(() => {});
      }
    };
    window.addEventListener('pointerdown', unlockAudio, { once: true });
    window.addEventListener('touchstart', unlockAudio, { once: true });

    return () => {
      isCancelled = true;
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  const playSound = useCallback((type: SoundType) => {
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;

      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContextClass();
      }
      const ctx = audioCtxRef.current;

      // Возобновление контекста при вызове (требование браузеров)
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      const buffer = audioBuffersRef.current[type];
      if (buffer) {
        // Воспроизведение предзагруженного WAV-сэмпла
        const source = ctx.createBufferSource();
        const gainNode = ctx.createGain();
        source.buffer = buffer;

        // Высокая громкость для четкой слышимости поверх музыки
        gainNode.gain.value = type === 'move' ? 1.15 : 0.45;
        source.connect(gainNode);
        gainNode.connect(ctx.destination);
        source.start(0);
      } else {
        // Fallback: процедурный синтез звука на лету
        playSynthesizedFallback(ctx, type);
      }

      // Тактильный виброотклик для смартфонов (только при установке фигуры)
      if ('vibrate' in navigator && type === 'move') {
        navigator.vibrate(25);
      }
    } catch {
      // Игнорируем ошибки автовоспроизведения
    }
  }, []);

  return { playSound };
}

function playSynthesizedFallback(ctx: AudioContext, type: 'move' | 'click') {
  if (type === 'move') {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(780, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(240, ctx.currentTime + 0.11);
    gain.gain.setValueAtTime(0.85, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.11);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.11);
  } else if (type === 'click') {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.04);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  }
}
