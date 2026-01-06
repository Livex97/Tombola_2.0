const express = require('express');
const compression = require('compression');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Abilita compressione Gzip per ridurre il carico di rete
app.use(compression());

// Serve frontend statico con Cache HTTP (1 anno per i file immutabili di Next.js)
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '1y',
  immutable: true,
  setHeaders: (res, path) => {
    // I file HTML non devono essere memorizzati nella cache per permettere aggiornamenti rapidi
    if (path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));

// Stato del gioco
let gameState = {
  drawnNumbers: [],
  claimedGoals: [], // { goal: 'ambo', winner: 'Mario' }
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
    if (gameState.gameStarted) return;
    gameState.players.push({ id: socket.id, name, numCards });
    io.emit('update-stats', {
      totalPlayers: gameState.players.length,
      totalCards: gameState.players.reduce((acc, p) => acc + (parseInt(p.numCards) || 0), 0)
    });
  });

  socket.on('draw-number', (number) => {
    if (gameState.drawnNumbers.length === 0) {
      gameState.gameStarted = true;
      io.emit('game-started');
    }
    gameState.drawnNumbers.push(number);
    io.emit('number-drawn', number);
  });

  socket.on('claim-goal', ({ goal, name }) => {
    const goalNames = ['ambo', 'terna', 'quaterna', 'cinquina', 'tombola'];
    const nextGoal = goalNames[gameState.claimedGoals.length];
    
    if (goal === nextGoal) {
      const winData = { goal, winner: name };
      gameState.claimedGoals.push(winData);
      io.emit('goal-claimed', winData);
    }
  });

  socket.on('reset-game', () => {
    gameState.drawnNumbers = [];
    gameState.claimedGoals = [];
    gameState.gameStarted = false;
    io.emit('game-reset');
  });

  socket.on('disconnect', () => {
    if (gameState.tomboloneId === socket.id) {
      gameState.tomboloneId = null;
      io.emit('tombolone-status', { occupied: false });
    }
    gameState.players = gameState.players.filter(p => p.id !== socket.id);
    io.emit('update-stats', {
      totalPlayers: gameState.players.length,
      totalCards: gameState.players.reduce((acc, p) => acc + (parseInt(p.numCards) || 0), 0)
    });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Tombola RPi server avviato su porta ${PORT}`);
});
