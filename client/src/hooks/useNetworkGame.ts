import { useState, useRef, useCallback, useEffect } from 'react';
import type {
  BoardState,
  Player,
  PlayerProfiles,
  PlayerQueues,
  WinningState,
  ClientMessage,
  ServerMessage,
} from '../types/game';
import { Capacitor } from '@capacitor/core';
import { INITIAL_BOARD, INITIAL_QUEUES } from '../logic/gameLogic';

const isNative = typeof window !== 'undefined' && Capacitor.isNativePlatform();

function getDefaultWsUrl(): string {
  if (import.meta.env.VITE_WS_URL) {
    return import.meta.env.VITE_WS_URL;
  }
  // In browser: dynamically connect to the same host (works on any Fly.io domain or custom domain)
  if (!isNative && typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' && window.location.port === '5173') {
      return 'ws://localhost:3001';
    }
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}`;
  }
  // Fallback for native Android APK
  return 'wss://inf-ttt.alwaysdata.net';
}

const DEFAULT_WS_URL = getDefaultWsUrl();

export function useNetworkGame() {
  const [status, setStatus] = useState<
    'idle' | 'connecting' | 'waiting_opponent' | 'playing' | 'game_over' | 'disconnected' | 'error'
  >('idle');
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [myRole, setMyRole] = useState<Player | null>(null);
  const [players, setPlayers] = useState<PlayerProfiles>({ X: 'Игрок 1', O: 'Игрок 2' });
  const [currentTurn, setCurrentTurn] = useState<Player>('X');
  const [board, setBoard] = useState<BoardState>(INITIAL_BOARD);
  const [queues, setQueues] = useState<PlayerQueues>(INITIAL_QUEUES);
  const [winningState, setWinningState] = useState<WinningState | null>(null);
  const [rematchRequestedByMe, setRematchRequestedByMe] = useState(false);
  const [rematchOfferedByOpponent, setRematchOfferedByOpponent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setErrorMessage(null);
  }, []);

  // Автоматическое скрытие ошибок и предупреждений через 12 секунд (10-15 сек)
  useEffect(() => {
    if (!errorMessage) return;
    const timer = setTimeout(() => {
      setErrorMessage(null);
    }, 12000);
    return () => clearTimeout(timer);
  }, [errorMessage]);

  const wsRef = useRef<WebSocket | null>(null);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setStatus('idle');
    setRoomCode(null);
    setMyRole(null);
    setWinningState(null);
    setRematchRequestedByMe(false);
    setRematchOfferedByOpponent(false);
  }, []);

  const handleServerMessage = useCallback((msg: ServerMessage) => {
    switch (msg.type) {
      case 'ROOM_CREATED':
        setRoomCode(msg.roomCode);
        setMyRole(msg.role);
        setPlayers((prev) => ({ ...prev, X: msg.playerName }));
        setStatus('waiting_opponent');
        break;

      case 'JOIN_SUCCESS':
        setRoomCode(msg.roomCode);
        setMyRole(msg.role);
        setPlayers((prev) => ({ ...prev, O: msg.playerName }));
        break;

      case 'GAME_START':
        setPlayers(msg.players);
        setCurrentTurn(msg.currentTurn);
        setBoard(INITIAL_BOARD);
        setQueues(INITIAL_QUEUES);
        setWinningState(null);
        setRematchRequestedByMe(false);
        setRematchOfferedByOpponent(false);
        setStatus('playing');
        break;

      case 'STATE_UPDATE':
        setBoard(msg.board);
        setQueues(msg.queues);
        setCurrentTurn(msg.currentTurn);
        break;

      case 'GAME_OVER':
        setWinningState({
          winner: msg.winner,
          winnerName: msg.winnerName,
          line: msg.winningLine,
        });
        setStatus('game_over');
        break;

      case 'REMATCH_OFFERED':
        setRematchOfferedByOpponent(true);
        break;

      case 'OPPONENT_DISCONNECTED':
        setErrorMessage('Соперник отключился от игры.');
        setStatus('disconnected');
        break;

      case 'ERROR':
        setErrorMessage(msg.message);
        setStatus('error');
        break;
    }
  }, []);

  const connect = useCallback((onOpenCallback: (ws: WebSocket) => void) => {
    disconnect();
    setStatus('connecting');
    setErrorMessage(null);

    const ws = new WebSocket(DEFAULT_WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      onOpenCallback(ws);
    };

    ws.onmessage = (event) => {
      try {
        const msg: ServerMessage = JSON.parse(event.data);
        handleServerMessage(msg);
      } catch (err) {
        console.error('Failed to parse WS message', err);
      }
    };

    ws.onerror = () => {
      setErrorMessage('Не удалось подключиться к серверу комнат.');
      setStatus('error');
    };

    ws.onclose = () => {
      setStatus((prev) => (prev === 'playing' || prev === 'waiting_opponent' ? 'disconnected' : prev));
    };
  }, [disconnect, handleServerMessage]);

  const createRoom = useCallback(
    (playerName: string) => {
      connect((ws) => {
        const msg: ClientMessage = { type: 'CREATE_ROOM', playerName };
        ws.send(JSON.stringify(msg));
      });
    },
    [connect]
  );

  const joinRoom = useCallback(
    (code: string, playerName: string) => {
      connect((ws) => {
        const msg: ClientMessage = { type: 'JOIN_ROOM', roomCode: code.toUpperCase(), playerName };
        ws.send(JSON.stringify(msg));
      });
    },
    [connect]
  );

  const sendMove = useCallback(
    (cellIndex: number) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        const msg: ClientMessage = { type: 'MAKE_MOVE', cellIndex };
        wsRef.current.send(JSON.stringify(msg));
      }
    },
    []
  );

  const requestRematch = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const msg: ClientMessage = { type: 'REQUEST_REMATCH' };
      wsRef.current.send(JSON.stringify(msg));
      setRematchRequestedByMe(true);
    }
  }, []);

  const leaveRoom = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const msg: ClientMessage = { type: 'LEAVE_ROOM' };
      wsRef.current.send(JSON.stringify(msg));
    }
    disconnect();
  }, [disconnect]);

  useEffect(() => {
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  return {
    status,
    roomCode,
    myRole,
    players,
    currentTurn,
    board,
    queues,
    winningState,
    rematchRequestedByMe,
    rematchOfferedByOpponent,
    errorMessage,
    clearError,
    createRoom,
    joinRoom,
    sendMove,
    requestRematch,
    leaveRoom,
  };
}
