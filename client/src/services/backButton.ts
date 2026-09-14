import { useEffect, useRef } from 'react';

export type BackActionHandler = () => boolean | void;

interface HandlerEntry {
  id: number;
  priority: number;
  handler: BackActionHandler;
}

let nextId = 1;
const handlers: HandlerEntry[] = [];

/**
 * Регистрация обработчика нажатия кнопки «Назад».
 * Чем выше priority, тем раньше вызовется обработчик (например, модалка > игра > подменю).
 * Внутри одинакового priority работает LIFO (последний зарегистрированный — первый на вызов).
 */
export function registerBackHandler(handler: BackActionHandler, priority: number = 0): () => void {
  const entry: HandlerEntry = {
    id: nextId++,
    priority,
    handler,
  };
  handlers.push(entry);

  return () => {
    const idx = handlers.findIndex((h) => h.id === entry.id);
    if (idx !== -1) {
      handlers.splice(idx, 1);
    }
  };
}

/**
 * Вызывает верхний активный обработчик кнопки «Назад».
 * Возвращает true, если действие было обработано, и false, если стек пуст (пора закрывать приложение).
 */
export function triggerBack(): boolean {
  if (handlers.length === 0) return false;

  // Копия отсортированного стека: сначала больший priority, затем последний добавленный
  const sorted = [...handlers].sort((a, b) => {
    if (b.priority !== a.priority) {
      return b.priority - a.priority;
    }
    return b.id - a.id;
  });

  for (const entry of sorted) {
    const res = entry.handler();
    // Если обработчик вернул false, передаем управление следующему
    if (res !== false) {
      return true;
    }
  }

  return false;
}

/**
 * React-хук для связывания действия с жизненным циклом компонента или булевым флагом видимости.
 */
export function useBackButton(handler: BackActionHandler, active: boolean = true, priority: number = 0) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!active) return;
    return registerBackHandler(() => handlerRef.current(), priority);
  }, [active, priority]);
}
