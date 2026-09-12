import type { BoardState, BotDifficulty, Player, PlayerQueues } from '../types/game';
import { checkWinner, executeMove, WINNING_LINES } from './gameLogic';

/**
 * Получает доступные для хода клетки на доске.
 */
function getAvailableMoves(board: BoardState): number[] {
  const moves: number[] = [];
  for (let i = 0; i < board.length; i++) {
    if (board[i] === null) {
      moves.push(i);
    }
  }
  return moves;
}

/**
 * Лёгкий бот («Новичок»):
 * 80% случайные ходы, 20% шанс заметить очевидную победу.
 */
function getEasyMove(board: BoardState, queues: PlayerQueues, botPlayer: Player): number {
  const available = getAvailableMoves(board);
  if (available.length === 0) return 0;

  if (Math.random() < 0.2) {
    for (const move of available) {
      const { nextBoard } = executeMove(board, queues, botPlayer, move);
      if (checkWinner(nextBoard)) {
        return move;
      }
    }
  }

  return available[Math.floor(Math.random() * available.length)];
}

/**
 * Средний бот («Тактик»):
 * 1. Ищет немедленную победу.
 * 2. Блокирует угрозу победы соперника.
 * 3. Занимает центр, затем углы, затем стороны.
 */
function getMediumMove(board: BoardState, queues: PlayerQueues, botPlayer: Player): number {
  const available = getAvailableMoves(board);
  if (available.length === 0) return 0;

  const opponent: Player = botPlayer === 'X' ? 'O' : 'X';

  // 1. Можем ли победить прямо сейчас?
  for (const move of available) {
    const { nextBoard } = executeMove(board, queues, botPlayer, move);
    if (checkWinner(nextBoard)) {
      return move;
    }
  }

  // 2. Может ли победить соперник своим следующим ходом? Блокируем!
  for (const move of available) {
    const { nextBoard } = executeMove(board, queues, opponent, move);
    if (checkWinner(nextBoard)) {
      return move;
    }
  }

  // 3. Захват центра
  if (available.includes(4)) {
    return 4;
  }

  // 4. Захват углов
  const corners = [0, 2, 6, 8].filter((c) => available.includes(c));
  if (corners.length > 0) {
    return corners[Math.floor(Math.random() * corners.length)];
  }

  return available[Math.floor(Math.random() * available.length)];
}

/**
 * Оценочная функция состояния для алгоритма Minimax с исчезающими фигурами.
 */
function evaluateBoard(board: BoardState, botPlayer: Player): number {
  const opponent: Player = botPlayer === 'X' ? 'O' : 'X';
  let score = 0;

  for (const line of WINNING_LINES) {
    const cells = [board[line[0]], board[line[1]], board[line[2]]];
    const botCount = cells.filter((c) => c === botPlayer).length;
    const oppCount = cells.filter((c) => c === opponent).length;

    if (botCount === 3) return 1000;
    if (oppCount === 3) return -1000;

    if (botCount === 2 && oppCount === 0) score += 15;
    if (oppCount === 2 && botCount === 0) score -= 18;
    if (botCount === 1 && oppCount === 0) score += 2;
    if (oppCount === 1 && botCount === 0) score -= 2;
  }

  // Бонус за контроль центра
  if (board[4] === botPlayer) score += 4;
  if (board[4] === opponent) score -= 4;

  return score;
}

/**
 * Minimax с ограничением глубины (Depth-Limited) и Alpha-Beta отсечением.
 */
function minimax(
  board: BoardState,
  queues: PlayerQueues,
  depth: number,
  isMaximizing: boolean,
  botPlayer: Player,
  alpha: number,
  beta: number
): number {
  const winner = checkWinner(board);
  if (winner) {
    return winner.winner === botPlayer ? 1000 - depth : -1000 + depth;
  }

  if (depth >= 5) {
    return evaluateBoard(board, botPlayer);
  }

  const available = getAvailableMoves(board);
  if (available.length === 0) return 0;

  const currentPlayer: Player = isMaximizing ? botPlayer : botPlayer === 'X' ? 'O' : 'X';

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of available) {
      const { nextBoard, nextQueues } = executeMove(board, queues, currentPlayer, move);
      const evaluation = minimax(nextBoard, nextQueues, depth + 1, false, botPlayer, alpha, beta);
      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of available) {
      const { nextBoard, nextQueues } = executeMove(board, queues, currentPlayer, move);
      const evaluation = minimax(nextBoard, nextQueues, depth + 1, true, botPlayer, alpha, beta);
      minEval = Math.min(minEval, evaluation);
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

/**
 * Сложный бот («Гроссмейстер»):
 * Использует Minimax для глубокого расчёта вариантов с учётом выбывания фигур.
 */
function getHardMove(board: BoardState, queues: PlayerQueues, botPlayer: Player): number {
  const available = getAvailableMoves(board);
  if (available.length === 0) return 0;

  // Немедленный выигрыш
  for (const move of available) {
    const { nextBoard } = executeMove(board, queues, botPlayer, move);
    if (checkWinner(nextBoard)) {
      return move;
    }
  }

  let bestMove = available[0];
  let bestScore = -Infinity;
  let alpha = -Infinity;
  const beta = Infinity;

  for (const move of available) {
    const { nextBoard, nextQueues } = executeMove(board, queues, botPlayer, move);
    const score = minimax(nextBoard, nextQueues, 1, false, botPlayer, alpha, beta);
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
    alpha = Math.max(alpha, bestScore);
  }

  return bestMove;
}

/**
 * Единая точка входа для выбора хода бота в зависимости от сложности.
 */
export function getBotMove(
  board: BoardState,
  queues: PlayerQueues,
  botPlayer: Player,
  difficulty: BotDifficulty
): number {
  switch (difficulty) {
    case 'easy':
      return getEasyMove(board, queues, botPlayer);
    case 'medium':
      return getMediumMove(board, queues, botPlayer);
    case 'hard':
      return getHardMove(board, queues, botPlayer);
    default:
      return getMediumMove(board, queues, botPlayer);
  }
}
