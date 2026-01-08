import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import io from 'socket.io-client';
import { generateCard } from '../utils/tombola';
import { Home, Trophy, Star } from 'lucide-react';
import confetti from 'canvas-confetti';
import GameAbandonedModal from '../components/GameAbandonedModal';

let socket;

export default function Cartelle() {
  const router = useRouter();
  const { num, name } = router.query;
  const [cards, setCards] = useState([]);
  const [drawnNumbers, setDrawnNumbers] = useState([]);
  const [claimedGoals, setClaimedGoals] = useState([]);
  const [announcement, setAnnouncement] = useState(null);
  const [showAbandonedModal, setShowAbandonedModal] = useState(false);
  
  const goalOrder = ['ambo', 'terna', 'quaterna', 'cinquina', 'tombola'];

  const playWinSound = (type) => {
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

  const triggerCelebration = (goal, winner) => {
    playWinSound(goal);
    setAnnouncement({ goal, winner });
    setTimeout(() => setAnnouncement(null), 5000);
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ff0000', '#00ff00', '#ffffff', '#ffd700']
    });
  };

  const checkGoals = (card) => {
    let cardResults = [];
    card.nums.forEach(row => {
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

    cards.forEach(card => {
      const results = checkGoals(card);
      if (results[currentTargetGoal]) goalReachedByAnyCard = true;
    });

    if (goalReachedByAnyCard) {
      socket.emit('claim-goal', { goal: currentTargetGoal, name });
    }
  }, [cards, drawnNumbers, claimedGoals, name]);

  useEffect(() => {
    handleAutoClaim();
  }, [drawnNumbers, handleAutoClaim]);

  const [playerName, setPlayerName] = useState(name || '');

  useEffect(() => {
    // Carica cards dal localStorage se presenti
    const savedCards = localStorage.getItem('tombola_cards');
    const savedName = localStorage.getItem('tombola_name');
    
    if (savedCards && (!name || name === savedName)) {
      setCards(JSON.parse(savedCards));
      if (savedName) {
        setPlayerName(savedName);
      }
    } else if (num) {
      const count = parseInt(num) || 1;
      const usedIds = new Set();
      const newCards = [];
      for (let i = 0; i < count; i++) {
        let uniqueId;
        do {
          uniqueId = Math.floor(Math.random() * 10000);
        } while (usedIds.has(uniqueId));
        usedIds.add(uniqueId);
        newCards.push({
          id: uniqueId,
          nums: generateCard()
        });
      }
      setCards(newCards);
      localStorage.setItem('tombola_cards', JSON.stringify(newCards));
      localStorage.setItem('tombola_name', name);
      localStorage.setItem('tombola_role', 'player');
      setPlayerName(name);
    }
  }, [num, name]);

  useEffect(() => {
    socket = io({ transports: ['websocket'] });
    
    const currentPlayerName = name || localStorage.getItem('tombola_name');
    const currentPlayerNum = num || (JSON.parse(localStorage.getItem('tombola_cards') || '[]')).length;

    if (!currentPlayerName) return;
    
    socket.on('init-state', (state) => {
      setDrawnNumbers(state.drawnNumbers);
      setClaimedGoals(state.claimedGoals.map(g => g.goal));
      socket.emit('join-as-player', { name: currentPlayerName, numCards: currentPlayerNum });
    });

    socket.on('number-drawn', (num) => {
      setDrawnNumbers((prev) => [...new Set([...prev, num])]);
    });

    socket.on('goal-claimed', (winData) => {
      setClaimedGoals(prev => [...prev, winData.goal]);
      triggerCelebration(winData.goal, winData.winner);
    });

    socket.on('game-reset', () => {
      setDrawnNumbers([]);
      setClaimedGoals([]);
      localStorage.removeItem('tombola_cards');
      localStorage.removeItem('tombola_name');
      localStorage.removeItem('tombola_role');
    });

    socket.on('tombolone-abandoned', () => {
      setShowAbandonedModal(true);
      localStorage.removeItem('tombola_cards');
      localStorage.removeItem('tombola_name');
      localStorage.removeItem('tombola_role');
    });

    socket.on('player-left', ({ name }) => {
      if (name === playerName) {
        router.push('/');
      }
    });

    return () => socket.disconnect();
  }, [name, num]);

  return (
    <div className="min-h-screen p-4 bg-gradient-to-b from-green-900 to-red-900 flex flex-col items-center relative md:pb-20 pb-[2rem]">
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

      <div className="w-full max-w-4xl flex justify-between items-center mb-10 bg-white bg-opacity-10 backdrop-blur-md p-4 rounded-3xl border border-white border-opacity-10">
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <Star className="text-yellow-400 fill-current w-6 h-6 animate-pulse" />
            <h1 className="text-2xl md:text-4xl font-black text-yellow-400 italic tracking-tighter uppercase">Gara di {playerName}</h1>
          </div>
        </div>
        <button onClick={() => router.push('/')} className="bg-white bg-opacity-10 hover:bg-opacity-20 text-white p-3 rounded-2xl transition-all active:scale-95">
          <Home className="w-6 h-6" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 w-full max-w-4xl mb-20 z-20">
        {cards.map((card) => (
          <div key={card.id} className="bg-white rounded-[2rem] md:rounded-[3rem] shadow-xl relative overflow-hidden group transform transition-all">
            <div className="bg-gradient-to-r from-red-600 to-red-700 h-12 md:h-16 flex items-center px-5 md:px-8 justify-between shadow-xl border-b-4 border-red-800">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-3 h-3 md:w-4 md:h-4 bg-yellow-400 rounded-full shadow-[0_0_10px_rgba(250,204,21,0.8)]" />
                <span className="text-white font-black text-lg md:text-xl italic uppercase tracking-tighter">Tabella Fortunata</span>
              </div>
              <div className="bg-white text-red-600 px-2 py-1 md:px-6 md:py-1.5 rounded-[1rem] md:rounded-[1.5rem] font-black text-lg md:text-xl shadow-[0_4px_0_rgba(0,0,0,0.1)] flex items-center gap-1 md:gap-2 border-2 border-red-100">
                #{card.id}
              </div>
            </div>
            
            <div className="p-4 md:p-8">
              <div className="grid grid-rows-3 gap-2 md:gap-4">
                {card.nums.map((row, rIdx) => (
                  <div key={rIdx} className="grid grid-cols-9 gap-1 md:gap-2">
                    {row.map((num, cIdx) => (
                      <div key={cIdx} className={`aspect-square flex items-center justify-center border-b-2 md:border-b-4 border-r-2 text-base md:text-xl font-black rounded-lg md:rounded-2xl transition-all duration-300 ${
                        num === null
                          ? 'bg-gray-50 border-gray-200'
                          : drawnNumbers.includes(num)
                            ? 'bg-red-600 text-white border-red-800 scale-105 shadow-xl rotate-2 -translate-y-1'
                            : 'bg-white text-gray-800 border-gray-200 hover:border-red-300 hover:bg-red-50'
                      }`}>
                        {num}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-4 w-[95%] max-w-4xl z-30">
       <div className="bg-yellow-400 p-3 md:p-6 rounded-[2rem] md:rounded-[2.5rem] shadow-[0_15px_30px_rgba(0,0,0,0.3)] border-4 border-white flex flex-col md:flex-row items-center justify-between gap-3 md:gap-6">
         <div className="flex items-center gap-2 md:gap-4">
           <div className="bg-red-600 text-white w-10 h-10 md:w-16 md:h-16 rounded-xl md:rounded-3xl flex items-center justify-center text-xl md:text-4xl font-black shadow-lg animate-bounce">
             {drawnNumbers[drawnNumbers.length - 1] || '0'}
           </div>
           <div className="flex flex-col md:hidden">
             <span className="text-red-900 text-xs font-black uppercase tracking-tighter">Prossimo Premio:</span>
             <span className="text-red-900 text-sm font-bold italic uppercase">
               {goalOrder[claimedGoals.length] || 'GARA FINITA!'}
             </span>
           </div>
           <span className="hidden md:block text-red-900 text-xl font-bold italic uppercase">
             {goalOrder[claimedGoals.length] || 'GARA FINITA!'}
           </span>
         </div>

         <div className="hidden md:flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
           {goalOrder.map((g) => {
             const isAchieved = claimedGoals.includes(g);
             const isNext = goalOrder[claimedGoals.length] === g;
             return (
               <div key={g} className={`flex flex-col items-center justify-center min-w-[70px] md:min-w-[80px] p-2 rounded-xl md:rounded-2xl border-2 transition-all ${
                 isAchieved ? 'bg-green-600 border-green-400 text-white shadow-lg' : isNext ? 'bg-white border-red-600 text-red-600 animate-pulse' : 'bg-white bg-opacity-20 border-red-900 border-opacity-10 text-red-900 opacity-40'
               }`}>
                 {isAchieved && <Trophy className="w-4 h-4 mb-1" />}
                 <span className="text-[10px] font-black uppercase tracking-tighter">{g}</span>
               </div>
             );
           })}
         </div>
        </div>
      </div>
      <GameAbandonedModal
        isOpen={showAbandonedModal}
        onClose={() => setShowAbandonedModal(false)}
      />
    </div>
  );
}
