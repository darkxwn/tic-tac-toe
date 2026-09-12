import { WebSocketServer, WebSocket } from 'ws';

const PORT = process.env.PORT || 3001;
const wss = new WebSocketServer({ port: Number(PORT) });

console.log(`[Relay Server] WebSocket сервер запущен на порту ${PORT}`);

// Алфавит для генерации кодов (без похожих символов: 0, O, 1, I, L)
const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

function generateRoomCode() {
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}

const WINNING_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

function checkWinner(board) {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line };
    }
  }
  return null;
}

// Активные комнаты: Map<roomCode, RoomData>
const rooms = new Map();

function send(ws, data) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  }
}

function broadcastToRoom(room, data) {
  if (room.players.X?.ws) send(room.players.X.ws, data);
  if (room.players.O?.ws) send(room.players.O.ws, data);
}

wss.on('connection', (ws) => {
  ws.isAlive = true;
  ws.on('pong', () => { ws.isAlive = true; });

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      handleMessage(ws, data);
    } catch (err) {
      console.error('Ошибка парсинга сообщения:', err);
    }
  });

  ws.on('close', () => {
    handleDisconnect(ws);
  });
});

function handleMessage(ws, data) {
  switch (data.type) {
    case 'CREATE_ROOM': {
      let code = generateRoomCode();
      while (rooms.has(code)) {
        code = generateRoomCode();
      }

      const playerName = (data.playerName || 'Игрок 1').slice(0, 16);

      const room = {
        code,
        players: {
          X: { ws, name: playerName },
          O: null,
        },
        board: Array(9).fill(null),
        queues: { X: [], O: [] },
        currentTurn: 'X',
        rematchRequests: new Set(),
        lastActive: Date.now(),
      };

      rooms.set(code, room);
      ws.roomCode = code;
      ws.role = 'X';

      send(ws, {
        type: 'ROOM_CREATED',
        roomCode: code,
        role: 'X',
        playerName,
      });

      console.log(`[Room ${code}] Создана игроком ${playerName} (X)`);
      break;
    }

    case 'JOIN_ROOM': {
      const code = (data.roomCode || '').toUpperCase().trim();
      const playerName = (data.playerName || 'Игрок 2').slice(0, 16);
      const room = rooms.get(code);

      if (!room) {
        send(ws, { type: 'ERROR', message: `Комната с кодом "${code}" не найдена.` });
        return;
      }

      if (room.players.O !== null) {
        send(ws, { type: 'ERROR', message: `Комната "${code}" уже заполнена двумя игроками.` });
        return;
      }

      room.players.O = { ws, name: playerName };
      room.lastActive = Date.now();
      ws.roomCode = code;
      ws.role = 'O';

      send(ws, {
        type: 'JOIN_SUCCESS',
        roomCode: code,
        role: 'O',
        playerName,
      });

      // Старт игры для обоих участников
      broadcastToRoom(room, {
        type: 'GAME_START',
        currentTurn: 'X',
        players: {
          X: room.players.X.name,
          O: room.players.O.name,
        },
      });

      console.log(`[Room ${code}] Игрок ${playerName} (O) подключился. Игра началась!`);
      break;
    }

    case 'MAKE_MOVE': {
      const code = ws.roomCode;
      if (!code) return;
      const room = rooms.get(code);
      if (!room || !room.players.O) return;

      const role = ws.role;
      if (room.currentTurn !== role) return;

      const cell = data.cellIndex;
      if (typeof cell !== 'number' || cell < 0 || cell > 8) return;
      if (room.board[cell] !== null) return;

      // Применяем механику исчезающего хода
      const playerQueue = room.queues[role];
      if (playerQueue.length === 3) {
        const removed = playerQueue.shift();
        room.board[removed] = null;
      }
      playerQueue.push(cell);
      room.board[cell] = role;
      room.lastActive = Date.now();

      // Проверка победы
      const win = checkWinner(room.board);
      if (win) {
        const winnerName = room.players[win.winner]?.name || win.winner;
        broadcastToRoom(room, {
          type: 'STATE_UPDATE',
          board: room.board,
          queues: room.queues,
          currentTurn: room.currentTurn,
          lastMove: cell,
        });

        broadcastToRoom(room, {
          type: 'GAME_OVER',
          winner: win.winner,
          winnerName,
          winningLine: win.line,
        });

        console.log(`[Room ${code}] Победил ${winnerName} (${win.winner})!`);
        return;
      }

      // Передаем ход
      room.currentTurn = role === 'X' ? 'O' : 'X';

      broadcastToRoom(room, {
        type: 'STATE_UPDATE',
        board: room.board,
        queues: room.queues,
        currentTurn: room.currentTurn,
        lastMove: cell,
      });
      break;
    }

    case 'REQUEST_REMATCH': {
      const code = ws.roomCode;
      if (!code) return;
      const room = rooms.get(code);
      if (!room) return;

      const role = ws.role;
      room.rematchRequests.add(role);
      room.lastActive = Date.now();

      const otherRole = role === 'X' ? 'O' : 'X';
      const otherPlayer = room.players[otherRole];

      if (room.rematchRequests.size === 1) {
        // Уведомляем оппонента, что этот игрок согласен на реванш
        if (otherPlayer?.ws) {
          send(otherPlayer.ws, {
            type: 'REMATCH_OFFERED',
            fromPlayer: room.players[role]?.name || role,
          });
        }
      } else if (room.rematchRequests.size >= 2) {
        // ОБА согласны! Перезапуск игры в ТОЙ ЖЕ комнате
        console.log(`[Room ${code}] Реванш подтвержден обоими! Смена ролей и перезапуск.`);

        // Меняем роли местами (кто был O, теперь ходит первым X)
        const oldX = room.players.X;
        const oldO = room.players.O;

        room.players.X = oldO;
        room.players.O = oldX;

        if (room.players.X?.ws) room.players.X.ws.role = 'X';
        if (room.players.O?.ws) room.players.O.ws.role = 'O';

        room.board = Array(9).fill(null);
        room.queues = { X: [], O: [] };
        room.currentTurn = 'X';
        room.rematchRequests.clear();

        // Уведомляем каждого игрока о его новой роли
        if (room.players.X?.ws) {
          send(room.players.X.ws, {
            type: 'JOIN_SUCCESS',
            roomCode: code,
            role: 'X',
            playerName: room.players.X.name,
          });
        }

        if (room.players.O?.ws) {
          send(room.players.O.ws, {
            type: 'JOIN_SUCCESS',
            roomCode: code,
            role: 'O',
            playerName: room.players.O.name,
          });
        }

        broadcastToRoom(room, {
          type: 'GAME_START',
          currentTurn: 'X',
          players: {
            X: room.players.X.name,
            O: room.players.O.name,
          },
        });
      }
      break;
    }

    case 'LEAVE_ROOM': {
      handleDisconnect(ws);
      break;
    }
  }
}

function handleDisconnect(ws) {
  const code = ws.roomCode;
  if (!code) return;

  const room = rooms.get(code);
  if (!room) return;

  const role = ws.role;
  const otherRole = role === 'X' ? 'O' : 'X';
  const otherPlayer = room.players[otherRole];

  if (otherPlayer?.ws) {
    send(otherPlayer.ws, { type: 'OPPONENT_DISCONNECTED' });
  }

  rooms.delete(code);
  console.log(`[Room ${code}] Закрыта из-за отключения игрока (${role}).`);
}

// Пинг-понг каждые 30 секунд для поддержания активности через мобильные сети
const interval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) return ws.terminate();
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

// Автоматическая очистка заброшенных комнат (старше 15 минут)
setInterval(() => {
  const now = Date.now();
  for (const [code, room] of rooms.entries()) {
    if (now - room.lastActive > 15 * 60 * 1000) {
      rooms.delete(code);
      console.log(`[Room ${code}] Удалена по таймауту неактивности.`);
    }
  }
}, 60000);

wss.on('close', () => {
  clearInterval(interval);
});
