export type Player = 'X' | 'O';
export type CellValue = Player | null;
export type BoardState = CellValue[];

export interface PlayerQueues {
  X: number[];
  O: number[];
}

export type GameMode = 'bot' | 'hotseat' | 'online';
export type BotDifficulty = 'easy' | 'medium' | 'hard';

export interface PlayerProfiles {
  X: string;
  O: string;
}

export interface WinningState {
  winner: Player;
  winnerName: string;
  line: number[];
}

export interface CellAgeInfo {
  player: Player;
  age: number; // 0: oldest (3rd turn ago, vanishing next!), 1: middle, 2: newest
  isOldest: boolean;
  opacity: number;
}

export type SideChoice = 'X' | 'O' | 'random';

// WebSocket Protocols
export type ClientMessage =
  | { type: 'CREATE_ROOM'; playerName: string; preferredSide?: SideChoice }
  | { type: 'JOIN_ROOM'; roomCode: string; playerName: string }
  | { type: 'MAKE_MOVE'; cellIndex: number }
  | { type: 'REQUEST_REMATCH' }
  | { type: 'LEAVE_ROOM' };

export type ServerMessage =
  | { type: 'ROOM_CREATED'; roomCode: string; role: Player; playerName: string }
  | { type: 'JOIN_SUCCESS'; roomCode: string; role: Player; playerName: string }
  | { type: 'GAME_START'; currentTurn: Player; players: PlayerProfiles }
  | { type: 'STATE_UPDATE'; board: BoardState; queues: PlayerQueues; currentTurn: Player; lastMove?: number }
  | { type: 'GAME_OVER'; winner: Player; winnerName: string; winningLine: number[] }
  | { type: 'REMATCH_OFFERED'; fromPlayer: string }
  | { type: 'OPPONENT_DISCONNECTED' }
  | { type: 'ERROR'; message: string };
