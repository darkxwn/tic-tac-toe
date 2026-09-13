export type Language = 'ru' | 'en';
export type Translations = typeof translations.ru;

export const translations = {
  ru: {
    // Header
    menuBtn: 'В\u00A0меню',
    mute: 'Выключить звук',
    unmute: 'Включить звук',
    musicMute: 'Выключить музыку',
    musicUnmute: 'Включить музыку',

    // Settings Modal
    settingsTitle: 'Настройки',
    settingsBtn: 'Настройки',
    themeLabel: 'Тема оформления',
    languageLabel: 'Язык интерфейса',
    soundEffects: 'Звуковые эффекты',
    relaxingMusic: 'Фоновая музыка',
    dynamicBg: 'Динамический фон',
    dynamicBgDesc: 'Плавные парящие фигуры',
    dynamicBgDisable: 'Выключить динамический фон',
    dynamicBgEnable: 'Включить динамический фон',
    close: 'Закрыть',

    // Themes
    themeNeon: 'Неон',
    themeDark: 'Тёмная',
    themeLight: 'Светлая',

    // Menu
    infinityMode: 'Infinity Mode',
    titleCross: 'КРЕСТИКИ',
    titleNought: 'НОЛИКИ',
    subtitle: 'Механика исчезающего хода: максимум 3 фигуры на игрока',
    yourNickname: 'Ваш никнейм',
    nicknamePlaceholder: 'Введите ник...',
    saved: 'Сохранено!',
    saveNickname: 'Сохранить никнейм',
    statsBtn: 'Статистика',

    // Modes Cards
    singleplayer: 'Одиночная игра',
    singleplayerDesc: 'Сразитесь с локальным ботом на одном из 3 уровней сложности.',
    chooseDifficulty: 'Выбрать сложность',
    multiplayer: 'Мультиплеер',
    multiplayerDesc: 'Играйте вдвоем на одном устройстве или онлайн по коду.',
    chooseMultiplayer: 'Выбрать вариант игры',

    // Rules Modal
    rulesBtn: 'Как работает исчезающий ход?',
    rulesTitle: 'Механика «Исчезающий ход»',
    rule1Title: 'Очередь ходов',
    rule1Desc: 'У каждого игрока на поле может быть максимум 3 активные фигуры. При постановке 4-й фигуры ваша самая старая (первая) фигура мгновенно исчезает, а клетка освобождается.',
    rule2Title: 'Визуальный возраст фигур',
    rule2Desc: 'Фигуры стареют со временем: новая горит ярко (100%), вторая бледнеет (65%), а третья становится полупрозрачной (35%) и плавно пульсирует, предупреждая об исчезновении.',
    rule3Title: 'Условие победы и отсутствие ничьих',
    rule3Desc: 'Побеждает тот, кто соберет 3 свои активные фигуры в ряд. Ничьих не бывает — игра продолжается динамично до победного выстраивания линии!',
    rule4Title: 'Тактический расчет',
    rule4Desc: 'Следите не только за своими фигурами, но и за старением фигур соперника — его угроза может исчезнуть сама через ход!',
    rulesGotIt: 'Всё понятно',

    // Bot setup
    back: 'Назад',
    botSettings: 'Параметры бота',
    selectDifficulty: 'Выберите сложность',
    botCalculates: 'Бот рассчитывает ходы с учётом исчезновения фигур',
    diffEasy: 'Новичок',
    diffEasyDesc: 'Простые ходы, иногда ошибается. Для разминки.',
    diffMedium: 'Средний',
    diffMediumDesc: 'Блокирует линии и захватывает центр.',
    diffHard: 'Сложный',
    diffHardDesc: 'Глубокий расчет Minimax. Практически без ошибок.',
    startGame: 'Начать игру',
    botName: 'Бот',

    // Multiplayer setup
    onOneDevice: 'На одном устройстве',
    online: 'По сети (онлайн)',
    player2Label: 'Имя второго игрока (O):',
    player2Default: 'Игрок 2',
    startHotseat: 'Начать на одном экране',
    createRoom: 'Создать новую комнату',
    joinByCode: 'Войти по коду комнаты',

    // In-game
    turnBadge: 'Ходит',
    youBadge: '(Вы)',
    yourTurnHint: 'Ваш ход! Выберите свободную клетку',
    opponentTurnHint: 'Ход соперника...',
    botThinkingHint: 'Бот обдумывает ход...',
    playerTurnHint: 'Ход игрока',
    victory: 'Победа!',
    defeat: 'Поражение',
    wonLinedUp: 'собрал(а) 3 в ряд!',
    rematch: 'Сыграть снова',
    offerRematch: 'Предложить реванш',
    acceptRematch: 'Принять реванш',
    waitingOpponentRematch: 'Ожидание соперника...',
    opponentOfferedRematch: 'Соперник готов сыграть реванш!',

    // Exit Confirmation Modal
    confirmExitTitle: 'Выйти в меню?',
    confirmExitDesc: 'Текущая партия будет прервана. Вы уверены?',
    confirmExitYes: 'Выйти в\u00A0меню',
    confirmExitCancel: 'Продолжить игру',

    // Lobby Modal
    roomCreated: 'Комната создана!',
    roomCreatedDesc: 'Сообщите код другу или отправьте ссылку',
    shareLink: 'Поделиться ссылкой',
    waitingOpponentConnect: 'Ожидание подключения соперника...',
    joinTitle: 'Подключение к комнате',
    joinDesc: 'Введите 4-значный код комнаты',
    joinBtn: 'Присоединиться',
    codePlaceholder: 'КОД',

    // Statistics
    statsTitle: 'Статистика игр',
    yourStats: 'Ваша статистика',
    statsDesc: 'Учёт побед и поражений по всем игровым режимам',
    wins: 'Побед',
    losses: 'Поражений',
    winrate: 'Винрейт',
    gamesPlayed: 'партий сыграно',
    resetStats: 'Сбросить статистику',
    confirmResetTitle: 'Точно сбросить статистику?',
    yes: 'Да',
    cancel: 'Отмена',
  },
  en: {
    // Header
    menuBtn: 'Menu',
    mute: 'Mute',
    unmute: 'Unmute',
    musicMute: 'Mute Music',
    musicUnmute: 'Play Music',

    // Settings Modal
    settingsTitle: 'Settings',
    settingsBtn: 'Settings',
    themeLabel: 'Theme',
    languageLabel: 'Language',
    soundEffects: 'Sound Effects',
    relaxingMusic: 'Background Music',
    dynamicBg: 'Dynamic Background',
    dynamicBgDesc: 'Smooth floating shapes',
    dynamicBgDisable: 'Disable dynamic background',
    dynamicBgEnable: 'Enable dynamic background',
    close: 'Close',

    // Themes
    themeNeon: 'Neon',
    themeDark: 'Dark',
    themeLight: 'Light',

    // Menu
    infinityMode: 'Infinity Mode',
    titleCross: 'TIC',
    titleNought: 'TAC TOE',
    subtitle: 'Vanishing move mechanic: max 3 marks per player',
    yourNickname: 'Your nickname',
    nicknamePlaceholder: 'Enter nickname...',
    saved: 'Saved!',
    saveNickname: 'Save nickname',
    statsBtn: 'Stats',

    // Modes Cards
    singleplayer: 'Single Player',
    singleplayerDesc: 'Play against a local bot across 3 different difficulty levels.',
    chooseDifficulty: 'Select difficulty',
    multiplayer: 'Multiplayer',
    multiplayerDesc: 'Play 2-player on one device or online via 4-letter room code.',
    chooseMultiplayer: 'Select mode',

    // Rules Modal
    rulesBtn: 'How does vanishing move work?',
    rulesTitle: 'Vanishing Move Mechanics',
    rule1Title: 'Queue (Max 3 Marks)',
    rule1Desc: 'Each player can have at most 3 active marks on the board. When placing a 4th mark, your oldest mark vanishes immediately, freeing that cell for anyone to claim.',
    rule2Title: 'Visual Age Indicator',
    rule2Desc: 'Marks fade over time: newest is bright (100%), previous dims (65%), and the oldest turns semi-transparent (35%) and gently pulses before vanishing.',
    rule3Title: 'Winning & No Draws',
    rule3Desc: 'Win by lining up 3 of your active marks horizontally, vertically, or diagonally. Draws are impossible — the battle continues dynamically until someone wins!',
    rule4Title: 'Tactical Strategy',
    rule4Desc: 'Keep an eye on the age of your opponent’s marks — you can anticipate which cell will open up next and use it to your strategic advantage!',
    rulesGotIt: 'Got it',

    // Bot setup
    back: 'Back',
    botSettings: 'Bot Settings',
    selectDifficulty: 'Select Difficulty',
    botCalculates: 'Bot calculates moves taking vanishing marks into account',
    diffEasy: 'Novice',
    diffEasyDesc: 'Simple moves, makes mistakes. Great for warmup.',
    diffMedium: 'Medium',
    diffMediumDesc: 'Blocks winning lines and takes the center.',
    diffHard: 'Hard',
    diffHardDesc: 'Deep Minimax lookahead. Master level.',
    startGame: 'Start Game',
    botName: 'Bot',

    // Multiplayer setup
    onOneDevice: 'Pass & Play',
    online: 'Online',
    player2Label: 'Player 2 Name (O):',
    player2Default: 'Player 2',
    startHotseat: 'Start 2-Player Game',
    createRoom: 'Create New Room',
    joinByCode: 'Join by Room Code',

    // In-game
    turnBadge: 'Turn',
    youBadge: '(You)',
    yourTurnHint: 'Your turn! Choose an empty cell',
    opponentTurnHint: 'Opponent is thinking...',
    botThinkingHint: 'Bot is thinking...',
    playerTurnHint: "Player's turn",
    victory: 'Victory!',
    defeat: 'Defeat',
    wonLinedUp: 'lined up 3 in a row!',
    rematch: 'Play Again',
    offerRematch: 'Request Rematch',
    acceptRematch: 'Accept Rematch',
    waitingOpponentRematch: 'Waiting for opponent...',
    opponentOfferedRematch: 'Opponent wants a rematch!',

    // Exit Confirmation Modal
    confirmExitTitle: 'Exit to menu?',
    confirmExitDesc: 'The current match will be lost. Are you sure?',
    confirmExitYes: 'Exit to menu',
    confirmExitCancel: 'Continue playing',

    // Lobby Modal
    roomCreated: 'Room Created!',
    roomCreatedDesc: 'Share the code with a friend or send the link',
    shareLink: 'Share Link',
    waitingOpponentConnect: 'Waiting for opponent to connect...',
    joinTitle: 'Join Room',
    joinDesc: 'Enter 4-letter room code',
    joinBtn: 'Join',
    codePlaceholder: 'CODE',

    // Statistics
    statsTitle: 'Game Statistics',
    yourStats: 'Your Statistics',
    statsDesc: 'Win and loss tracking across all game modes',
    wins: 'Wins',
    losses: 'Losses',
    winrate: 'Win Rate',
    gamesPlayed: 'games played',
    resetStats: 'Reset Statistics',
    confirmResetTitle: 'Are you sure you want to reset stats?',
    yes: 'Yes',
    cancel: 'Cancel',
  },
};
