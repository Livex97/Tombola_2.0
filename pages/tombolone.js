import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import io from 'socket.io-client';
import { getSmorfia } from '../utils/smorfia';
import {Home, RotateCcw, Radio, Trophy, Users, CreditCard as CardIcon } from 'lucide-react';
import confetti from 'canvas-confetti';
import MuteButton from '../components/MuteButton';

let socket;

export default function Tombolone() {
  const router = useRouter();
  const [drawnNumbers, setDrawnNumbers] = useState([]);
  const [lastDrawn, setLastDrawn] = useState(null);
  const [claimedGoals, setClaimedGoals] = useState([]);
  const [stats, setStats] = useState({ totalPlayers: 0, totalCards: 0 });
  const [announcement, setAnnouncement] = useState(null);
  const [winningNumbers, setWinningNumbers] = useState([]);
  const [winningCardId, setWinningCardId] = useState(null);

  const goalOrder = ['ambo', 'terna', 'quaterna', 'cinquina', 'tombola'];

  const checkGoals = (card) => {
    let cardResults = [];
    card.rows.forEach(row => {
      const matchedInRow = row.filter(n => n && drawnNumbers.includes(n)).length;
      cardResults.push(matchedInRow);
    });
    const maxInARow = Math.max(...cardResults);
    const totalMatched = cardResults.reduce((a, b) => a + b, 0);

    return {
      ambo: maxInARow >= 2,
      terna: maxInARow >= 3,
      quaterna: maxInARow >= 4,
      cinquina: maxInARow >= 5,
      tombola: totalMatched === 15
    };
  };

  const handleAutoClaim = useCallback(() => {
    const nextGoalIndex = claimedGoals.length;
    if (nextGoalIndex >= goalOrder.length) return;

    const currentTargetGoal = goalOrder[nextGoalIndex];
    let goalReachedByAnyCard = false;
    let winNums = [];
    let winCardId = null;

    for (let i = 0; i < 6; i++) {
      const cardId = i + 1;
      const startNum = i * 15 + 1;
      const cartellaNums = Array.from({ length: 15 }, (_, j) => startNum + j);
      const rows = [
        cartellaNums.slice(0, 5),
        cartellaNums.slice(5, 10),
        cartellaNums.slice(10, 15)
      ];
      
      let cardResults = [];
      rows.forEach(row => {
        const matchedInRow = row.filter(n => n && drawnNumbers.includes(n));
        cardResults.push(matchedInRow);
      });

      const maxInARow = Math.max(...cardResults.map(r => r.length));
      const totalMatched = cardResults.flat().length;

      const results = {
        ambo: maxInARow >= 2,
        terna: maxInARow >= 3,
        quaterna: maxInARow >= 4,
        cinquina: maxInARow >= 5,
        tombola: totalMatched === 15
      };

      if (results[currentTargetGoal]) {
        goalReachedByAnyCard = true;
        winCardId = cardId;
        if (currentTargetGoal === 'tombola') {
          winNums = cardResults.flat();
        } else {
          const winningRow = cardResults.find(r => r.length >= (goalOrder.indexOf(currentTargetGoal) + 2));
          winNums = winningRow || [];
        }
        break;
      }
    }

    if (goalReachedByAnyCard) {
      socket.emit('claim-goal', { 
        goal: currentTargetGoal, 
        name: 'Tombolone', 
        numbers: winNums,
        cardId: winCardId,
        isTombolone: true
      });
    }
  }, [drawnNumbers, claimedGoals]);

  useEffect(() => {
    handleAutoClaim();
  }, [drawnNumbers, handleAutoClaim]);

  const playWinSound = (type) => {
    const isMuted = localStorage.getItem('tombola_muted') === 'true';
    if (isMuted) return;

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    const frequencies = {
      ambo: [440, 554], terna: [440, 554, 659], quaterna: [523, 659, 783, 1046],
      cinquina: [523, 659, 783, 1046, 1318], tombola: [523, 659, 783, 1046, 1318, 1567]
    };
    const freqs = frequencies[type] || [440];
    const now = ctx.currentTime;
    freqs.forEach((f, i) => {
      osc.frequency.setValueAtTime(f, now + i * 0.1);
    });
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1);
    osc.start(now);
    osc.stop(now + 1);
  };

  const triggerCelebration = (goalType, winner, winNums, cardId) => {
    playWinSound(goalType);
    setAnnouncement({ goal: goalType, winner });
    setWinningNumbers(winNums || []);
    setWinningCardId(cardId);
    setTimeout(() => setAnnouncement(null), 5000);
    confetti({
      particleCount: 200,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#ff0000', '#00ff00', '#ffffff', '#ffd700']
    });
  };

  const socketInitializer = async () => {
    socket = io({ transports: ['websocket'] });
    socket.emit('take-tombolone');
    localStorage.setItem('tombola_role', 'tombolone');

    socket.on('init-state', (state) => {
      setDrawnNumbers(state.drawnNumbers);
      setClaimedGoals(state.claimedGoals.map(g => g.goal));
      if (state.claimedGoals.length > 0) {
        const lastGoal = state.claimedGoals[state.claimedGoals.length - 1];
        if (lastGoal.isTombolone) {
          setWinningNumbers(lastGoal.numbers || []);
          setWinningCardId(lastGoal.cardId);
        }
      }
      setStats({
        totalPlayers: state.players.length,
        totalCards: state.players.reduce((acc, p) => acc + (parseInt(p.numCards) || 0), 0)
      });
    });

    socket.on('update-stats', (newStats) => {
      setStats(newStats);
    });

    socket.on('number-drawn', (num) => {
      setDrawnNumbers((prev) => [...new Set([...prev, num])]);
      setLastDrawn(num);
    });

    socket.on('goal-claimed', (winData) => {
      setClaimedGoals(prev => [...prev, winData.goal]);
      if (winData.isTombolone) {
        triggerCelebration(winData.goal, winData.winner, winData.numbers, winData.cardId);
      } else {
        triggerCelebration(winData.goal, winData.winner, [], null);
      }
    });

    socket.on('game-reset', () => {
      setDrawnNumbers([]);
      setLastDrawn(null);
      setClaimedGoals([]);
      setWinningNumbers([]);
      setWinningCardId(null);
      localStorage.removeItem('tombola_role');
      localStorage.removeItem('tombola_name');
      localStorage.removeItem('tombola_cards');
    });
  };

  useEffect(() => {
    socketInitializer();
    return () => socket && socket.disconnect();
  }, []);

  const drawNumber = () => {
    if (drawnNumbers.length >= 90) return;
    let num;
    do {
      num = Math.floor(Math.random() * 90) + 1;
    } while (drawnNumbers.includes(num));
    socket.emit('draw-number', num);
  };

  const resetGame = () => {
    if (confirm('Sei sicuro di voler resettare il gioco per tutti?')) {
      socket.emit('reset-game');
      localStorage.removeItem('tombola_role');
      localStorage.removeItem('tombola_name');
      localStorage.removeItem('tombola_cards');
    }
  };

  const renderTomboloneCartelle = () => {
    const cartelle = [];
    for (let i = 0; i < 6; i++) {
      const startNum = i * 15 + 1;
      const cartellaNums = Array.from({ length: 15 }, (_, j) => startNum + j);
      cartelle.push({
        id: i + 1,
        rows: [
          cartellaNums.slice(0, 5),
          cartellaNums.slice(5, 10),
          cartellaNums.slice(10, 15)
        ]
      });
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-40">
        {cartelle.map((cartella) => (
          <div key={cartella.id} className="bg-white bg-opacity-10 backdrop-blur-md p-6 rounded-[2.5rem] border-2 border-white border-opacity-20 shadow-2xl relative">
            <div className="absolute -top-4 left-8 bg-yellow-400 text-red-900 px-4 py-1 rounded-full font-black text-sm uppercase tracking-widest shadow-lg">
              Cartella {cartella.id}
            </div>
            <div className="grid grid-rows-3 gap-3 mt-4">
              {cartella.rows.map((row, rIdx) => (
                <div key={rIdx} className="grid grid-cols-5 gap-3">
                  {row.map(num => (
                    <div
                      key={num}
                      className={`aspect-square flex items-center justify-center rounded-2xl border-2 text-2xl font-black transition-all duration-500 ${drawnNumbers.includes(num)
                          ? (winningCardId === cartella.id && winningNumbers.includes(num))
                            ? 'bg-green-500 text-white border-green-200 scale-110 shadow-[0_0_20px_rgba(34,197,94,0.6)] rotate-3'
                            : 'bg-yellow-400 text-red-900 border-yellow-200 scale-105 shadow-[0_0_15px_rgba(250,204,21,0.5)] rotate-2'
                          : 'bg-white bg-opacity-5 text-white border-white border-opacity-10'
                        }`}
                    >
                      {num}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col p-4 bg-gradient-to-br from-red-900 via-green-900 to-red-900 relative pb-12">
      {announcement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 animate-in fade-in duration-300 backdrop-blur-sm">
          <div className="bg-yellow-400 p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border-8 border-white shadow-2xl text-center transform animate-in zoom-in duration-500 w-full max-w-md md:max-w-2xl">
            <Trophy className="w-16 h-16 md:w-24 md:h-24 text-red-600 mx-auto mb-4 md:mb-6 animate-bounce" />
            <h2 className="text-3xl md:text-5xl font-black text-red-900 uppercase italic mb-2">{announcement.goal}!</h2>
            <p className="text-lg md:text-2xl font-bold text-red-800">Il vincitore è:</p>
            <p className="text-4xl md:text-6xl font-black text-green-700 mt-2 md:mt-4 drop-shadow-sm break-words">{announcement.winner}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-center mb-10 bg-white bg-opacity-10 backdrop-blur-md p-3 md:p-5 rounded-3xl border border-white border-opacity-20 sticky top-4 z-30 gap-2 md:gap-4">
       <div className="flex items-center gap-2 md:gap-3">
         <Trophy className="text-yellow-400 w-6 h-6 md:w-8 md:h-8 animate-bounce" />
         <h1 className="text-xl md:text-4xl font-black text-yellow-400 italic tracking-tighter">TOMBOLONE <span className="hidden md:inline">REALE</span></h1>
       </div>
        
       <div className="flex gap-2 md:gap-4 items-center flex-wrap justify-center md:justify-start">
         <div className="bg-blue-600 bg-opacity-30 p-2 md:px-4 md:py-2 rounded-xl md:rounded-2xl border border-blue-400 border-opacity-30 flex items-center gap-1 md:gap-2">
           <Users className="w-4 h-4 md:w-5 md:h-5 text-blue-300" />
           <span className="text-white font-bold text-sm md:text-base">{stats.totalPlayers} <span className="hidden md:inline">Partecipanti</span></span>
         </div>
         <div className="bg-purple-600 bg-opacity-30 p-2 md:px-4 md:py-2 rounded-xl md:rounded-2xl border border-purple-400 border-opacity-30 flex items-center gap-1 md:gap-2">
           <CardIcon className="w-4 h-4 md:w-5 md:h-5 text-purple-300" />
           <span className="text-white font-bold text-sm md:text-base">{stats.totalCards} <span className="hidden md:inline">Cartelle</span></span>
         </div>
         <div className="bg-red-600 bg-opacity-30 p-2 md:px-4 md:py-2 rounded-xl md:rounded-2xl border border-red-400 border-opacity-30 flex items-center gap-1 md:gap-2 md:hidden">
           <span className="text-white font-bold text-sm">{drawnNumbers.length}/90</span>
         </div>
         <MuteButton />
         <button
           onClick={resetGame}
           className="bg-red-600 hover:bg-red-500 text-white p-2 md:px-6 md:py-3 rounded-xl md:rounded-2xl font-bold transition-all flex items-center gap-1 md:gap-2 shadow-xl active:scale-95"
         >
           <RotateCcw className="w-4 h-4 md:w-5 md:h-5" />
           <span className="hidden md:block">Reset Gara</span>
         </button>
         <button onClick={() => {
           if (confirm('Sei sicuro di voler resettare la partita e tornare alla home?')) {
             localStorage.removeItem('tombola_role');
             localStorage.removeItem('tombola_name');
             localStorage.removeItem('tombola_cards');
             socket.emit('reset-game');
             router.push('/');
           }
         }} className="bg-white bg-opacity-10 hover:bg-opacity-20 text-white p-2 md:px-6 md:py-3 rounded-xl md:rounded-2xl font-bold transition-all flex items-center gap-1 md:gap-2 shadow-xl active:scale-95">
          <Home className="w-4 h-4 md:w-5 md:h-5" />
        </button>
       </div>
     </div>

      <div className="max-w-7xl mx-auto w-full z-20">
        {renderTomboloneCartelle()}
      </div>

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[95%] max-w-4xl z-40">
       <div className="bg-white p-4 md:p-6 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col md:flex-row items-center gap-3 md:gap-6 border-8 border-red-600 relative">
         <div className="absolute -top-4 -left-4 md:-top-6 md:-left-6 text-2xl md:text-4xl">🎄</div>
         <div className="absolute -top-4 -right-4 md:-top-6 md:-right-6 text-2xl md:text-4xl">🎁</div>

          <div className="flex-grow text-center md:text-left">
            {lastDrawn ? (
              <div className="animate-in zoom-in duration-300">
                <div className="flex items-center justify-center md:justify-start gap-2 md:gap-4 flex-wrap">
                  <span className="text-4xl md:text-6xl font-black text-red-600 drop-shadow-sm">{lastDrawn}</span>
                  <span className="text-sm md:text-xl font-bold text-gray-800 italic md:hidden">"{getSmorfia()[lastDrawn]}"</span>
                </div>
                <span className="hidden md:block text-xl md:text-2xl font-bold text-gray-800 italic leading-tight">
                  "{getSmorfia()[lastDrawn]}"
                </span>
              </div>
            ) : (
              <span className="text-gray-400 text-sm md:text-lg font-medium animate-pulse">In attesa...</span>
            )}
          </div>

          <button
            onClick={drawNumber}
            disabled={drawnNumbers.length >= 90}
            className="w-full md:w-auto bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white px-4 py-3 md:px-10 md:py-5 rounded-2xl font-black text-lg md:text-2xl shadow-xl transition-all active:scale-95 disabled:grayscale flex items-center justify-center gap-2 md:gap-3"
          >
            <Radio className="w-5 h-5 md:w-6 md:h-6" />
            <span>ESTRAI</span>
          </button>

          <div className="hidden md:block bg-red-50 p-3 rounded-2xl text-center min-w-[100px] border border-red-100">
            <span className="text-gray-400 text-xs font-bold uppercase block mb-1">Obiettivo</span>
            <span className="text-xl font-black text-red-600 uppercase italic">
              {goalOrder[claimedGoals.length] || 'Fine!'}
            </span>
          </div>

          <div className="hidden md:block bg-red-50 p-3 rounded-2xl text-center min-w-[100px] border border-red-100">
            <span className="text-gray-400 text-xs font-bold uppercase block mb-1">Estratti</span>
            <span className="text-3xl font-black text-red-600">{drawnNumbers.length}</span>
            <span className="text-gray-400 text-xs font-bold"> / 90</span>
          </div>
        </div>
      </div>
    </div>
  );
}
