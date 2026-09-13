import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  BoardState,
  BotDifficulty,
  GameMode,
  Player,
  PlayerProfiles,
  PlayerQueues,
  WinningState,
} from './types/game';
import {
  checkWinner,
  executeMove,
  INITIAL_BOARD,
  INITIAL_QUEUES,
} from './logic/gameLogic';
import { getBotMove } from './logic/botAi';
import { usePlayerProfile } from './hooks/usePlayerProfile';
import { useGameStats } from './hooks/useGameStats';
import { useSound } from './hooks/useSound';
import { useBackgroundMusic } from './hooks/useBackgroundMusic';
import { useLanguage } from './hooks/useLanguage';
import { useNetworkGame } from './hooks/useNetworkGame';
import { Board } from './components/Board';
import { ScoreBoard } from './components/ScoreBoard';
import { GameOverModal } from './components/GameOverModal';
import { LobbyModal } from './components/LobbyModal';
import { ConfirmModal } from './components/ConfirmModal';
import { Menu } from './components/Menu';
import { ThemeSwitcher } from './components/ThemeSwitcher';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { SettingsModal } from './components/SettingsModal';
import { ArrowLeft, Volume2, VolumeX, AlertCircle, Music, Settings } from 'lucide-react';
import { StatusBar } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

export function App() {
  const { lang, toggleLang, t } = useLanguage();
  const { playerName, savePlayerName } = usePlayerProfile();
  const { stats, recordResult, resetStats } = useGameStats();
  const { soundEnabled, soundVolume, setSoundVolume, toggleSound, playSound } = useSound();
  const { musicEnabled, musicVolume, setMusicVolume, toggleMusic } = useBackgroundMusic();
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const isNative = Capacitor.isNativePlatform();

  // Скрытие системного StatusBar для полноэкранного игрового режима
  useEffect(() => {
    StatusBar.hide().catch(() => {});
  }, []);

  // Режим экрана
  const [gameMode, setGameMode] = useState<GameMode | null>(null);
  const [botDifficulty, setBotDifficulty] = useState<BotDifficulty>('medium');

  // Локальное состояние (для Бот / Hotseat)
  const [board, setBoard] = useState<BoardState>(INITIAL_BOARD);
  const [queues, setQueues] = useState<PlayerQueues>(INITIAL_QUEUES);
  const [currentTurn, setCurrentTurn] = useState<Player>('X');
  const [scores, setScores] = useState<{ X: number; O: number }>({ X: 0, O: 0 });
  const [winningState, setWinningState] = useState<WinningState | null>(null);
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [players, setPlayers] = useState<PlayerProfiles>({ X: playerName, O: t.botName });

  // Рефы для стабильной работы хода бота без отмены таймера
  const boardRef = useRef(board);
  boardRef.current = board;
  const queuesRef = useRef(queues);
  queuesRef.current = queues;
  const botDiffRef = useRef(botDifficulty);
  botDiffRef.current = botDifficulty;
  const playersRef = useRef(players);
  playersRef.current = players;

  // Сетевое состояние
  const [showLobbyModal, setShowLobbyModal] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const network = useNetworkGame();

  const triggerSound = useCallback(
    (type: 'move' | 'click') => {
      playSound(type);
    },
    [playSound]
  );

  // Сброс локальной игры
  const resetLocalGame = useCallback((startingPlayer: Player = 'X') => {
    setBoard(INITIAL_BOARD);
    setQueues(INITIAL_QUEUES);
    setCurrentTurn(startingPlayer);
    setWinningState(null);
    setShowGameOverModal(false);
    setIsBotThinking(false);
  }, []);

  // Запуск победной последовательности (прочерчивание линии -> задержка -> модалка + запись в статистику)
  const handleLocalWinSequence = useCallback(
    (win: WinningState) => {
      setWinningState(win);
      setScores((prev) => ({ ...prev, [win.winner]: prev[win.winner] + 1 }));

      // Учёт статистики
      if (gameMode === 'bot') {
        const isHumanWin = win.winner === 'X';
        recordResult('bot', isHumanWin, botDiffRef.current);
      } else if (gameMode === 'hotseat') {
        recordResult('hotseat', true);
      }

      // Сначала видна прочерченная линия, модалка всплывает через 1.3 секунды
      setTimeout(() => {
        setShowGameOverModal(true);
      }, 1300);
    },
    [gameMode, recordResult, triggerSound]
  );

  // Старт игры с ботом (Сложности: Новичок, Средний, Сложный)
  const handleStartBotGame = (difficulty: BotDifficulty) => {
    setGameMode('bot');
    setBotDifficulty(difficulty);
    const diffLabel = difficulty === 'easy' ? t.diffEasy : difficulty === 'medium' ? t.diffMedium : t.diffHard;
    setPlayers({ X: playerName, O: `${t.botName} (${diffLabel})` });
    setScores({ X: 0, O: 0 });
    resetLocalGame('X');
    triggerSound('click');
  };

  // Старт Hotseat
  const handleStartHotseatGame = (player2Name: string) => {
    setGameMode('hotseat');
    setPlayers({ X: playerName, O: player2Name });
    setScores({ X: 0, O: 0 });
    resetLocalGame('X');
    triggerSound('click');
  };

  // Старт создания онлайн-комнаты
  const handleStartOnlineCreate = () => {
    setIsHost(true);
    setShowLobbyModal(true);
    network.createRoom(playerName);
    triggerSound('click');
  };

  // Старт подключения к онлайн-комнате
  const handleStartOnlineJoin = () => {
    setIsHost(false);
    setShowLobbyModal(true);
    triggerSound('click');
  };

  // Подключение по коду
  const handleJoinRoom = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    if (network.roomCode && cleanCode === network.roomCode.toUpperCase()) {
      return;
    }
    network.joinRoom(cleanCode, playerName);
    triggerSound('click');
  };

  // Ход игрока в локальных режимах (человек)
  const handleLocalCellClick = (cellIndex: number) => {
    if (winningState || board[cellIndex] !== null || isBotThinking) return;

    // Выполняем ход
    const { nextBoard, nextQueues } = executeMove(board, queues, currentTurn, cellIndex);
    triggerSound('move');

    setBoard(nextBoard);
    setQueues(nextQueues);

    // Проверка победы
    const win = checkWinner(nextBoard, players);
    if (win) {
      handleLocalWinSequence(win);
      return;
    }

    // Передача хода
    const nextTurn: Player = currentTurn === 'X' ? 'O' : 'X';
    setCurrentTurn(nextTurn);
  };

  // Ход бота
  useEffect(() => {
    if (gameMode !== 'bot' || currentTurn !== 'O' || winningState) {
      setIsBotThinking(false);
      return;
    }

    setIsBotThinking(true);
    const timer = setTimeout(() => {
      const currentB = boardRef.current;
      const currentQ = queuesRef.current;
      const diff = botDiffRef.current;

      const botMove = getBotMove(currentB, currentQ, 'O', diff);
      const { nextBoard, nextQueues } = executeMove(currentB, currentQ, 'O', botMove);
      triggerSound('move');

      setBoard(nextBoard);
      setQueues(nextQueues);

      const win = checkWinner(nextBoard, playersRef.current);
      if (win) {
        handleLocalWinSequence(win);
      } else {
        setCurrentTurn('X');
      }
      setIsBotThinking(false);
    }, 450);

    return () => clearTimeout(timer);
  }, [gameMode, currentTurn, winningState, handleLocalWinSequence, triggerSound]);

  // Обработка сетевого хода
  const handleOnlineCellClick = (cellIndex: number) => {
    if (network.status !== 'playing' || network.winningState || network.board[cellIndex] !== null) return;
    if (network.currentTurn !== network.myRole) return;

    network.sendMove(cellIndex);
    triggerSound('move');
  };

  // Проверка URL на наличие ?room=CODE
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam) {
      setIsHost(false);
      setShowLobbyModal(true);
    }
  }, []);

  // Если игра в онлайне началась, закрываем окно лобби
  useEffect(() => {
    if (network.status === 'playing') {
      setShowLobbyModal(false);
      setShowGameOverModal(false);
      setGameMode('online');
    }
  }, [network.status]);

  // Задержка окна и запись статистики при сетевой победе
  useEffect(() => {
    if (network.winningState) {
      const isMeWinner = network.winningState.winner === network.myRole;
      recordResult('online', isMeWinner);

      const timer = setTimeout(() => {
        setShowGameOverModal(true);
      }, 1300);
      return () => clearTimeout(timer);
    } else {
      setShowGameOverModal(false);
    }
  }, [network.winningState, network.myRole, recordResult, triggerSound]);

  // Реванш
  const handleRematch = () => {
    if (gameMode === 'online') {
      network.requestRematch();
    } else {
      // Смена первого хода для честности
      const nextStarter: Player = currentTurn === 'X' ? 'O' : 'X';
      resetLocalGame(nextStarter);
    }
    triggerSound('click');
  };

  // Возврат в меню
  const handleGoHome = () => {
    if (gameMode === 'online') {
      network.leaveRoom();
    }
    setGameMode(null);
    setShowLobbyModal(false);
    setShowGameOverModal(false);
    setShowExitConfirm(false);
    resetLocalGame('X');
    triggerSound('click');
  };

  // Запрос выхода в меню (с подтверждением при активной игре)
  const handleRequestGoHome = () => {
    if (gameMode && !activeWinning) {
      setShowExitConfirm(true);
      triggerSound('click');
    } else {
      handleGoHome();
    }
  };

  // Горячие клавиши на десктопе (Numpad)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (winningState || network.winningState) return;

      const numpadMap: Record<string, number> = {
        Numpad7: 0, Numpad8: 1, Numpad9: 2,
        Numpad4: 3, Numpad5: 4, Numpad6: 5,
        Numpad1: 6, Numpad2: 7, Numpad3: 8,
        Digit1: 0, Digit2: 1, Digit3: 2,
        Digit4: 3, Digit5: 4, Digit6: 5,
        Digit7: 6, Digit8: 7, Digit9: 8,
      };

      if (e.code in numpadMap) {
        const cell = numpadMap[e.code];
        if (gameMode === 'online') {
          handleOnlineCellClick(cell);
        } else if (gameMode === 'bot' || gameMode === 'hotseat') {
          handleLocalCellClick(cell);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const isOnlinePlaying = gameMode === 'online';
  const activeBoard = isOnlinePlaying ? network.board : board;
  const activeQueues = isOnlinePlaying ? network.queues : queues;
  const activeTurn = isOnlinePlaying ? network.currentTurn : currentTurn;
  const activePlayers = isOnlinePlaying ? network.players : players;
  const activeWinning = isOnlinePlaying ? network.winningState : winningState;

  return (
    <main className="min-h-[100dvh] w-full flex flex-col justify-between pt-14 pb-3 px-4 sm:p-6 max-w-xl mx-auto select-none">
      {/* Верхняя панель: Кнопка возврата, выбор темы, язык, звук, музыка или кнопка настроек */}
      <header className="flex items-center justify-between w-full mb-3 sm:mb-4 gap-2">
        {gameMode ? (
          <button
            onClick={handleRequestGoHome}
            className="h-9 sm:h-10 px-3 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer active:scale-95 whitespace-nowrap shrink-0"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline whitespace-nowrap">{t.menuBtn}</span>
          </button>
        ) : (
          <div />
        )}

        {/* На Android приложении: только кнопка настроек */}
        {isNative ? (
          <button
            type="button"
            onClick={() => setShowSettingsModal(true)}
            className="h-9 w-9 sm:h-10 sm:w-10 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-cyan-500/40 transition-all flex items-center justify-center cursor-pointer active:scale-95 shadow-sm"
            title={t.settingsBtn}
          >
            <Settings className="w-4 h-4 text-cyan-400" />
          </button>
        ) : (
          <>
            {/* Для мобильного веб-экрана (< sm): кнопка настроек */}
            <div className="flex sm:hidden items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowSettingsModal(true)}
                className="h-9 w-9 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-cyan-500/40 transition-all flex items-center justify-center cursor-pointer active:scale-95 shadow-sm"
                title={t.settingsBtn}
              >
                <Settings className="w-4 h-4 text-cyan-400" />
              </button>
            </div>

            {/* Для десктопного веб-экрана (sm+): Темы, Язык, Звук и Музыка с вертикальными слайдерами при наведении */}
            <div className="hidden sm:flex items-center gap-2">
              {/* Переключатель тем: Неон, Тёмная, Светлая */}
              <ThemeSwitcher
                labels={{
                  neon: t.themeNeon,
                  dark: t.themeDark,
                  light: t.themeLight,
                }}
              />

              {/* Переключатель языка: RU / EN */}
              <LanguageSwitcher currentLang={lang} onToggle={toggleLang} />

              {/* Звуковые эффекты с вертикальным слайдером при наведении */}
              <div className="relative group">
                <button
                  type="button"
                  onClick={toggleSound}
                  className={`h-9 w-9 sm:h-10 sm:w-10 rounded-2xl border transition-all cursor-pointer active:scale-95 flex items-center justify-center ${
                    soundEnabled && soundVolume > 0
                      ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-400 shadow-sm shadow-cyan-500/20'
                      : 'bg-[var(--bg-surface)] border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                  title={soundEnabled ? t.mute : t.unmute}
                >
                  {soundEnabled && soundVolume > 0 ? (
                    <Volume2 className="w-4 h-4 text-cyan-400" />
                  ) : (
                    <VolumeX className="w-4 h-4 opacity-60" />
                  )}
                </button>

                {/* Выпадающий вертикальный регулятор звука при наведении */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 hidden group-hover:flex flex-col items-center z-40">
                  <div className="p-3 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-2xl flex flex-col items-center gap-2 backdrop-blur-md min-w-[48px]">
                    <span className="text-[10px] font-mono font-bold text-[var(--text-primary)]">
                      {soundEnabled ? `${Math.round(soundVolume * 100)}%` : '0%'}
                    </span>
                    <div className="h-28 flex items-center justify-center">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={soundEnabled ? soundVolume : 0}
                        onChange={(e) => setSoundVolume(parseFloat(e.target.value))}
                        className="w-1.5 h-24 accent-cyan-400 cursor-pointer"
                        style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
                        aria-label="Sound volume"
                      />
                    </div>
                    <Volume2 className="w-3.5 h-3.5 text-cyan-400 opacity-75" />
                  </div>
                </div>
              </div>

              {/* Фоновая музыка с вертикальным слайдером при наведении */}
              <div className="relative group">
                <button
                  type="button"
                  onClick={toggleMusic}
                  className={`h-9 w-9 sm:h-10 sm:w-10 rounded-2xl border transition-all cursor-pointer active:scale-95 flex items-center justify-center ${
                    musicEnabled && musicVolume > 0
                      ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-400 shadow-sm shadow-cyan-500/20'
                      : 'bg-[var(--bg-surface)] border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                  title={musicEnabled ? t.musicMute : t.musicUnmute}
                >
                  <Music
                    className={`w-4 h-4 ${
                      musicEnabled && musicVolume > 0 ? 'animate-pulse text-cyan-400' : 'opacity-60'
                    }`}
                  />
                </button>

                {/* Выпадающий вертикальный регулятор музыки при наведении */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 hidden group-hover:flex flex-col items-center z-40">
                  <div className="p-3 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl shadow-2xl flex flex-col items-center gap-2 backdrop-blur-md min-w-[48px]">
                    <span className="text-[10px] font-mono font-bold text-[var(--text-primary)]">
                      {musicEnabled ? `${Math.round(musicVolume * 100)}%` : '0%'}
                    </span>
                    <div className="h-28 flex items-center justify-center">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={musicEnabled ? musicVolume : 0}
                        onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                        className="w-1.5 h-24 accent-cyan-400 cursor-pointer"
                        style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
                        aria-label="Music volume"
                      />
                    </div>
                    <Music className="w-3.5 h-3.5 text-cyan-400 opacity-75" />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </header>

      {/* Ошибки в онлайне */}
      {network.errorMessage && (
        <div className="mb-3 p-3 bg-rose-950/80 border border-rose-500/50 rounded-2xl text-xs text-rose-200 flex items-center justify-between gap-2 animate-pop">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{network.errorMessage}</span>
          </div>
          <button
            onClick={() => {
              network.clearError();
              if (gameMode === 'online') {
                handleGoHome();
              }
            }}
            className="px-3 py-1.5 bg-rose-900 hover:bg-rose-800 text-white rounded-xl font-bold text-xs cursor-pointer active:scale-95 transition-all shadow-sm"
          >
            OK
          </button>
        </div>
      )}

      {/* Основной контент */}
      <section className="flex-1 flex flex-col justify-center items-center w-full">
        {!gameMode ? (
          <Menu
            playerName={playerName}
            stats={stats}
            t={t}
            onResetStats={resetStats}
            onSavePlayerName={savePlayerName}
            onStartBotGame={handleStartBotGame}
            onStartHotseatGame={handleStartHotseatGame}
            onStartOnlineCreate={handleStartOnlineCreate}
            onStartOnlineJoin={handleStartOnlineJoin}
          />
        ) : (
          <div className="w-full flex flex-col items-center animate-pop">
            <ScoreBoard
              currentTurn={activeTurn}
              players={activePlayers}
              scores={scores}
              queues={activeQueues}
              myRole={isOnlinePlaying ? network.myRole : null}
              botDifficulty={gameMode === 'bot' ? botDifficulty : null}
              t={{
                turnBadge: t.turnBadge,
                youBadge: t.youBadge,
                diffEasy: t.diffEasy,
                diffMedium: t.diffMedium,
                diffHard: t.diffHard,
              }}
            />

            <Board
              board={activeBoard}
              queues={activeQueues}
              winningLine={activeWinning ? activeWinning.line : null}
              disabled={
                Boolean(activeWinning) ||
                (gameMode === 'bot' && (currentTurn === 'O' || isBotThinking)) ||
                (isOnlinePlaying && network.currentTurn !== network.myRole)
              }
              onCellClick={(idx) => {
                if (isOnlinePlaying) handleOnlineCellClick(idx);
                else handleLocalCellClick(idx);
              }}
            />

            {/* Подсказка чей сейчас ход */}
            <div className="mt-3.5 text-center text-xs font-semibold text-[var(--text-secondary)]">
              {isOnlinePlaying ? (
                network.currentTurn === network.myRole ? (
                  <span className="text-cyan-400">{t.yourTurnHint}</span>
                ) : (
                  <span>{t.opponentTurnHint}</span>
                )
              ) : gameMode === 'bot' && isBotThinking ? (
                <span className="text-purple-400 animate-pulse">{t.botThinkingHint}</span>
              ) : (
                <span>
                  {t.playerTurnHint}:{' '}
                  <strong className={activeTurn === 'X' ? 'text-cyan-400' : 'text-rose-400'}>
                    {activePlayers[activeTurn]} ({activeTurn})
                  </strong>
                </span>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Окно лобби для мультиплеера */}
      {showLobbyModal && (
        <LobbyModal
          roomCode={network.roomCode}
          isHost={isHost}
          t={{
            roomCreated: t.roomCreated,
            roomCreatedDesc: t.roomCreatedDesc,
            shareLink: t.shareLink,
            waitingOpponentConnect: t.waitingOpponentConnect,
            joinTitle: t.joinTitle,
            joinDesc: t.joinDesc,
            joinBtn: t.joinBtn,
            codePlaceholder: t.codePlaceholder,
            back: t.back,
          }}
          onJoinRoom={handleJoinRoom}
          onCancel={() => {
            setShowLobbyModal(false);
            network.leaveRoom();
            handleGoHome();
          }}
        />
      )}

      {/* Окно победы с кнопкой реванша (появляется после прочерчивания линии) */}
      {activeWinning && showGameOverModal && (
        <GameOverModal
          winner={activeWinning.winner}
          winnerName={activeWinning.winnerName}
          isOnline={isOnlinePlaying}
          rematchRequestedByMe={network.rematchRequestedByMe}
          rematchOfferedByOpponent={network.rematchOfferedByOpponent}
          t={{
            victory: t.victory,
            wonLinedUp: t.wonLinedUp,
            opponentOfferedRematch: t.opponentOfferedRematch,
            waitingOpponentRematch: t.waitingOpponentRematch,
            acceptRematch: t.acceptRematch,
            offerRematch: t.offerRematch,
            rematch: t.rematch,
            menuBtn: t.menuBtn,
          }}
          onRematch={handleRematch}
          onHome={handleGoHome}
        />
      )}

      {/* Модальное окно подтверждения выхода в меню */}
      {showExitConfirm && (
        <ConfirmModal
          title={t.confirmExitTitle}
          desc={t.confirmExitDesc}
          confirmText={t.confirmExitYes}
          cancelText={t.confirmExitCancel}
          onConfirm={handleGoHome}
          onCancel={() => setShowExitConfirm(false)}
        />
      )}

      {/* Модальное окно настроек (темы, язык, звук, музыка) */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        t={t}
        lang={lang}
        onToggleLang={toggleLang}
        soundEnabled={soundEnabled}
        soundVolume={soundVolume}
        onToggleSound={toggleSound}
        onSetSoundVolume={setSoundVolume}
        musicEnabled={musicEnabled}
        musicVolume={musicVolume}
        onToggleMusic={toggleMusic}
        onSetMusicVolume={setMusicVolume}
      />
    </main>
  );
}

export default App;
