import type { BoardState, Player, PlayerQueues, CellAgeInfo, WinningState } from '../types/game';

export const WINNING_LINES: number[][] = [
  // Горизонтали
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  // Вертикали
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  // Диагонали
  [0, 4, 8],
  [2, 4, 6],
];

export const INITIAL_BOARD: BoardState = Array(9).fill(null);

export const INITIAL_QUEUES: PlayerQueues = {
  X: [],
  O: [],
};

/**
 * Проверка наличия победной линии на доске.
 */
export function checkWinner(board: BoardState, playerProfiles?: { X: string; O: string }): WinningState | null {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      const winner = board[a] as Player;
      const winnerName = playerProfiles ? playerProfiles[winner] : winner === 'X' ? 'Крестики' : 'Нолики';
      return { winner, winnerName, line };
    }
  }
  return null;
}

/**
 * Вычисляет информацию о возрасте фигуры в клетке (прозрачность, статус кандидата на исчезновение).
 */
export function getCellAgeInfo(cellIndex: number, queues: PlayerQueues): CellAgeInfo | null {
  const checkQueue = (player: Player, queue: number[]): CellAgeInfo | null => {
    const idx = queue.indexOf(cellIndex);
    if (idx === -1) return null;

    const len = queue.length;
    // Если в очереди уже 3 фигуры, то элемент с индексом 0 исчезнет при следующем 4-м ходе этого игрока!
    const isOldest = len === 3 && idx === 0;

    let opacity = 1.0;
    if (len === 3) {
      if (idx === 0) opacity = 0.35;
      else if (idx === 1) opacity = 0.65;
      else opacity = 1.0;
    } else if (len === 2) {
      if (idx === 0) opacity = 0.7;
      else opacity = 1.0;
    }

    return {
      player,
      age: idx,
      isOldest,
      opacity,
    };
  };

  return checkQueue('X', queues.X) || checkQueue('O', queues.O);
}

/**
 * Выполняет ход с учётом FIFO-очереди из максимум 3-х фигур.
 */
export function executeMove(
  board: BoardState,
  queues: PlayerQueues,
  player: Player,
  cellIndex: number
): {
  nextBoard: BoardState;
  nextQueues: PlayerQueues;
  removedCell: number | null;
} {
  const currentQueue = queues[player];
  const nextBoard = [...board];
  const nextQueues: PlayerQueues = {
    X: [...queues.X],
    O: [...queues.O],
  };

  let removedCell: number | null = null;

  // Если у игрока уже 3 фигуры, самая первая (индекс 0) исчезает
  if (currentQueue.length === 3) {
    removedCell = currentQueue[0];
    nextBoard[removedCell] = null;
    nextQueues[player] = [currentQueue[1], currentQueue[2], cellIndex];
  } else {
    nextQueues[player] = [...currentQueue, cellIndex];
  }

  nextBoard[cellIndex] = player;

  return {
    nextBoard,
    nextQueues,
    removedCell,
  };
}
