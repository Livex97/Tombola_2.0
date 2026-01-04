import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Settings, ArrowLeft, Save } from 'lucide-react';
import { smorfiaNapoli, smorfiaItaliana } from '../utils/smorfia';

export default function Impostazioni() {
  const router = useRouter();
  const [lingua, setLingua] = useState('napoletano');
  const [smorfiaCorrente, setSmorfiaCorrente] = useState(smorfiaNapoli);

  useEffect(() => {
    const savedLingua = localStorage.getItem('linguaSmorfia');
    if (savedLingua) {
      setLingua(savedLingua);
      setSmorfiaCorrente(savedLingua === 'italiano' ? smorfiaItaliana : smorfiaNapoli);
    }
  }, []);

  const handleLinguaChange = (nuovaLingua) => {
    setLingua(nuovaLingua);
    setSmorfiaCorrente(nuovaLingua === 'italiano' ? smorfiaItaliana : smorfiaNapoli);
    localStorage.setItem('linguaSmorfia', nuovaLingua);
  };

  const handleSalva = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-red-900 to-green-900 relative">
      <div className="text-center z-10 mb-8">
        <h1 className="text-5xl md:text-6xl font-black text-yellow-400 mb-4 drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)] tracking-tighter italic">
          IMPOSTAZIONI
        </h1>
      </div>

      <div className="bg-white bg-opacity-10 backdrop-blur-xl p-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] w-full max-w-md border border-white border-opacity-20 z-10">
        <div className="mb-6">
          <label className="flex items-center text-white text-sm font-bold mb-3 uppercase tracking-wider">
            <Settings className="w-4 h-4 mr-2 text-yellow-400" />
            Lingua Smorfia
          </label>
          <div className="flex gap-4">
            <button
              onClick={() => handleLinguaChange('napoletano')}
              className={`flex-1 p-4 rounded-2xl font-bold transition-all ${
                lingua === 'napoletano'
                  ? 'bg-yellow-400 text-red-900 border-yellow-300 scale-105 shadow-xl'
                  : 'bg-white bg-opacity-10 text-white border-transparent hover:bg-opacity-20'
              }`}
            >
              Napoletano
            </button>
            <button
              onClick={() => handleLinguaChange('italiano')}
              className={`flex-1 p-4 rounded-2xl font-bold transition-all ${
                lingua === 'italiano'
                  ? 'bg-yellow-400 text-red-900 border-yellow-300 scale-105 shadow-xl'
                  : 'bg-white bg-opacity-10 text-white border-transparent hover:bg-opacity-20'
              }`}
            >
              Italiano
            </button>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-white text-sm font-bold mb-3 uppercase tracking-wider">
            Anteprima Smorfia
          </label>
          <div className="bg-white bg-opacity-20 p-4 rounded-xl max-h-40 overflow-y-auto">
            {Object.entries(smorfiaCorrente).slice(0, 10).map(([numero, descrizione]) => (
              <div key={numero} className="flex justify-between text-white text-sm mb-2">
                <span>{numero}:</span>
                <span>{descrizione}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleSalva}
          className="w-full p-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white shadow-[0_10px_20px_rgba(34,197,94,0.3)] cursor-pointer active:scale-95"
        >
          <Save className="w-5 h-5 fill-current" />
          SALVA E TORNA INDIETRO
        </button>
      </div>
    </div>
  );
}