import { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export default function MuteButton() {
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const savedMuteState = localStorage.getItem('tombola_muted');
    if (savedMuteState !== null) {
      setIsMuted(savedMuteState === 'true');
    }
  }, []);

  const toggleMute = () => {
    const newMuteState = !isMuted;
    setIsMuted(newMuteState);
    localStorage.setItem('tombola_muted', newMuteState.toString());
  };

  return (
    <button
      onClick={toggleMute}
      className="bg-white bg-opacity-10 hover:bg-opacity-20 text-white p-2 md:px-4 md:py-2 rounded-xl md:rounded-2xl font-bold transition-all flex items-center gap-1 md:gap-2 shadow-xl active:scale-95"
      aria-label={isMuted ? 'Attiva suoni' : 'Disattiva suoni'}
    >
      {isMuted ? (
        <VolumeX className="w-4 h-4 md:w-5 md:h-5" />
      ) : (
        <Volume2 className="w-4 h-4 md:w-5 md:h-5" />
      )}
      <span className="hidden md:block">{isMuted ? 'Suoni Off' : 'Suoni On'}</span>
    </button>
  );
}