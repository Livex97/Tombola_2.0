const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(server);

  let gameState = {
    drawnNumbers: [],
    claimedGoals: [], // { goal: 'ambo', winner: 'Mario', cardId: 42 }
    tomboloneId: null,
    gameStarted: false,
    players: [] // { id: 'socketId', name: 'Mario', numCards: 3 }
  };

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    // Invia lo stato iniziale
    socket.emit('init-state', {
      ...gameState,
      tomboloneOccupied: !!gameState.tomboloneId
    });

    socket.on('take-tombolone', () => {
      if (!gameState.tomboloneId) {
        gameState.tomboloneId = socket.id;
        io.emit('tombolone-status', { occupied: true });
      }
    });

    socket.on('join-as-player', ({ name, numCards }) => {
      const existingPlayerIndex = gameState.players.findIndex(p => p.name === name);
      
      if (existingPlayerIndex !== -1) {
        // Riconnessione: aggiorna il socket ID
        gameState.players[existingPlayerIndex].id = socket.id;
        if (numCards) gameState.players[existingPlayerIndex].numCards = numCards;
      } else {
        // Nuovo giocatore: permetti solo se il gioco non è iniziato
        if (gameState.gameStarted) return;
        gameState.players.push({ id: socket.id, name, numCards });
      }

      io.emit('update-stats', {
        totalPlayers: gameState.players.length,
        totalCards: gameState.players.reduce((acc, p) => acc + (parseInt(p.numCards) || 0), 0)
      });
    });

    socket.on('player-left', ({ name }) => {
      gameState.players = gameState.players.filter(p => p.name !== name);
      io.emit('update-stats', {
        totalPlayers: gameState.players.length,
        totalCards: gameState.players.reduce((acc, p) => acc + (parseInt(p.numCards) || 0), 0)
      });
      io.emit('player-left', { name });
    });

    socket.on('draw-number', (number) => {
      if (gameState.drawnNumbers.length === 0) {
        gameState.gameStarted = true;
        io.emit('game-started');
      }
      gameState.drawnNumbers.push(number);
      io.emit('number-drawn', number);
    });

    socket.on('claim-goal', ({ goal, name, numbers, cardId, isTombolone }) => {
      const goalNames = ['ambo', 'terna', 'quaterna', 'cinquina', 'tombola'];
      const nextGoal = goalNames[gameState.claimedGoals.length];
      
      if (goal === nextGoal) {
        const winData = { 
          goal, 
          winner: name, 
          numbers: numbers || [],
          cardId,
          isTombolone: !!isTombolone
        };
        gameState.claimedGoals.push(winData);
        io.emit('goal-claimed', winData);
        //console.log('Vincitore è Tombolone: ' + isTombolone + ' Nome vincitore:' + name + 'Card ID vincente:' + cardId);
      }
    });

    socket.on('reset-game', () => {
      gameState.drawnNumbers = [];
      gameState.claimedGoals = [];
      gameState.gameStarted = false;
      gameState.players = [];
      io.emit('game-reset');
    });

    socket.on('tombolone-abandoned', () => {
      gameState.drawnNumbers = [];
      gameState.claimedGoals = [];
      gameState.gameStarted = false;
      gameState.players = [];
      gameState.tomboloneId = null;
      io.emit('tombolone-abandoned');
      io.emit('tombolone-status', { occupied: false });
      io.emit('update-stats', {
        totalPlayers: 0,
        totalCards: 0
      });
    });

    socket.on('disconnect', () => {
      if (gameState.tomboloneId === socket.id) {
        gameState.tomboloneId = null;
        io.emit('tombolone-status', { occupied: false });
      }
      // Non rimuoviamo i giocatori per permettere la riconnessione
      // gameState.players = gameState.players.filter(p => p.id !== socket.id);
      io.emit('update-stats', {
        totalPlayers: gameState.players.length,
        totalCards: gameState.players.reduce((acc, p) => acc + (parseInt(p.numCards) || 0), 0)
      });
    });
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});
