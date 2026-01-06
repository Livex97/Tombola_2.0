import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { User, Layout, CreditCard, Play, Lock, Settings } from 'lucide-react';
import io from 'socket.io-client';

let socket;

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [mode, setMode] = useState(null);
  const [numCartelle, setNumCartelle] = useState(1);
  const [tomboloneOccupied, setTomboloneOccupied] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    socket = io({ transports: ['websocket'] });
    socket.on('init-state', (state) => {
      setTomboloneOccupied(state.tomboloneOccupied);
      setGameStarted(state.gameStarted);
    });
    socket.on('tombolone-status', (status) => {
      setTomboloneOccupied(status.occupied);
    });
    socket.on('game-started', () => {
      setGameStarted(true);
    });
    socket.on('game-reset', () => {
      setGameStarted(false);
    });
    return () => socket.disconnect();
  }, []);

  const handleStart = () => {
    if (mode === 'tombolone') {
      router.push('/tombolone');
    } else if (mode === 'cartelle') {
      if (!name.trim()) return alert('Inserisci il tuo nome!');
      router.push(`/cartelle?num=${numCartelle}&name=${encodeURIComponent(name)}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-red-900 to-green-900 relative">
      <div className="text-center z-10">
        <h1 className="text-7xl md:text-9xl font-black text-yellow-400 mb-4 drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)] tracking-tighter italic">
          TOMBOLA
        </h1>
        <p className="text-white text-xl md:text-2xl font-light tracking-widest mb-12 uppercase opacity-80">
          Edizione Natalizia 🎄
        </p>
      </div>

      <div className="bg-white bg-opacity-10 backdrop-blur-xl p-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] w-full max-w-md border border-white border-opacity-20 z-10">
        
        <div className="absolute top-4 right-4 z-20">
        <button
          onClick={() => router.push('/impostazioni')}
          className="p-3 rounded-full hover:bg-opacity-30 transition-all"
        >
          <Settings className="w-6 h-6 text-yellow-400" />
        </button>
      </div>
        
        <div className="mb-8">
          <label className="flex items-center text-white text-sm font-bold mb-3 uppercase tracking-wider">
            <User className="w-4 h-4 mr-2 text-yellow-400" />
            Il Tuo Nome
          </label>
          <input
            type="text"
            placeholder="Esempio: Mario"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-4 rounded-2xl bg-white bg-opacity-20 text-white border border-white border-opacity-10 focus:outline-none focus:ring-4 focus:ring-yellow-400/50 text-xl font-bold transition-all placeholder-white placeholder-opacity-30"
          />
        </div>

        <div className="flex gap-4 mb-8">
          <button
            onClick={() => !tomboloneOccupied && setMode('tombolone')}
            disabled={tomboloneOccupied}
            className={`flex-1 p-6 rounded-2xl font-bold transition-all flex flex-col items-center gap-3 border-2 relative ${
              tomboloneOccupied ? 'opacity-50 cursor-not-allowed bg-gray-800' :
              mode === 'tombolone' 
                ? 'bg-yellow-400 text-red-900 border-yellow-300 scale-105 shadow-xl' 
                : 'bg-white bg-opacity-10 text-white border-transparent hover:bg-opacity-20'
            }`}
          >
            {tomboloneOccupied ? <Lock className="w-8 h-8 text-red-500" /> : <Layout className={`w-8 h-8 ${mode === 'tombolone' ? 'text-red-900' : 'text-yellow-400'}`} />}
            <span>Tombolone</span>
            {tomboloneOccupied && <span className="text-[10px] uppercase text-red-400">Già in uso</span>}
          </button>
          
          <button
            onClick={() => setMode('cartelle')}
            className={`flex-1 p-6 rounded-2xl font-bold transition-all flex flex-col items-center gap-3 border-2 ${
              mode === 'cartelle' 
                ? 'bg-yellow-400 text-red-900 border-yellow-300 scale-105 shadow-xl' 
                : 'bg-white bg-opacity-10 text-white border-transparent hover:bg-opacity-20'
            }`}
          >
            <CreditCard className={`w-8 h-8 ${mode === 'cartelle' ? 'text-red-900' : 'text-yellow-400'}`} />
            Cartelle
          </button>
        </div>

        {mode === 'cartelle' && (
          <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <label className="block text-white text-sm font-bold mb-3 uppercase tracking-wider">Quante cartelle vuoi?</label>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {[1, 2, 3, 4, 6].map(n => (
                <button
                  key={n}
                  onClick={() => setNumCartelle(n)}
                  className={`flex-shrink-0 w-12 h-12 rounded-xl font-bold transition-all ${
                    numCartelle == n ? 'bg-green-500 text-white shadow-lg' : 'bg-white bg-opacity-10 text-white'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={handleStart}
          disabled={!mode || (mode === 'cartelle' && !name) || gameStarted}
          className={`w-full p-5 rounded-2xl font-black text-2xl transition-all flex items-center justify-center gap-3 ${
            !gameStarted && mode && (mode !== 'cartelle' || name)
              ? 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white shadow-[0_10px_20px_rgba(34,197,94,0.3)] cursor-pointer active:scale-95' 
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
          }`}
        >
          {gameStarted ? (
            <>
              <Lock className="w-6 h-6" />
              GARA INIZIATA
            </>
          ) : (
            <>
              <Play className="w-6 h-6 fill-current" />
              ENTRA IN GARA
            </>
          )}
        </button>
      </div>
    </div>
  );
}
