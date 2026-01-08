import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function GameAbandonedModal({ isOpen, onClose }) {
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
        router.push('/');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose, router]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 animate-in fade-in duration-300 backdrop-blur-sm">
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] w-full max-w-md border border-white border-opacity-20 z-10 text-center">
        <h2 className="text-2xl md:text-3xl font-black text-red-900 uppercase italic mb-4">Partita Abbandonata</h2>
        <p className="text-lg md:text-xl font-bold text-red-800 mb-6">Il Tombolone ha abbandonato la partita. Verrai reindirizzato alla pagina iniziale.</p>
        <button
          onClick={() => {
            onClose();
            router.push('/');
          }}
          className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-xl active:scale-95"
        >
          OK
        </button>
      </div>
    </div>
  );
}