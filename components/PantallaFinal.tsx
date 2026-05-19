
import React, { useEffect, useState } from 'react';
import { Gavel, PartyPopper, RefreshCw, Crown, Volume2, Mic2 } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface PantallaFinalProps {
  nombreJugadorQueEmpieza: string;
  onIrAVotacion: () => void;
  onNuevaPartida: () => void;
}

const PantallaFinal: React.FC<PantallaFinalProps> = ({ nombreJugadorQueEmpieza, onIrAVotacion, onNuevaPartida }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const anunciarTurno = async () => {
    if (isSpeaking) return;
    setIsSpeaking(true);
    try {
      await soundManager.announceStartingPlayer(nombreJugadorQueEmpieza);
    } catch (error) {
      console.error("Error al anunciar:", error);
    } finally {
      setIsSpeaking(false);
    }
  };

  useEffect(() => {
    // Pequeño delay para que la transición visual termine antes de hablar
    const timer = setTimeout(() => {
      anunciarTurno();
    }, 800);
    return () => clearTimeout(timer);
  }, [nombreJugadorQueEmpieza]);

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-sm px-6 text-center space-y-6 animate-fade-in">
      
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 opacity-20 blur-3xl rounded-full"></div>
        <PartyPopper className="w-16 h-16 text-yellow-400 relative z-10 animate-bounce" />
      </div>

      <div className="space-y-1">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white leading-tight">
          ¡Roles Asignados!
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 font-semibold">
          El juego comienza ahora en la vida real.
        </p>
      </div>

      {/* Tarjeta de Jugador Inicial */}
      <div className="w-full bg-gradient-to-br from-blue-600 to-violet-700 dark:from-brand-primary dark:to-brand-accent p-5 rounded-2xl shadow-xl border-b-4 border-black/20 animate-[fadeIn_0.5s_ease-out] relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-2 opacity-10">
          <Crown className="w-16 h-16 rotate-12" />
        </div>
        
        <span className="text-white/80 text-xs font-black uppercase tracking-widest mb-1 block">Empieza la ronda:</span>
        
        <div className="flex items-center justify-center gap-3">
          <Crown className="w-6 h-6 text-yellow-300 animate-pulse" />
          <h2 className="text-2xl font-black text-white drop-shadow-md truncate max-w-[200px]">
            {nombreJugadorQueEmpieza}
          </h2>
          <button 
            onClick={anunciarTurno}
            disabled={isSpeaking}
            className={`p-2 bg-white/20 hover:bg-white/30 rounded-full transition-all active:scale-90 ${isSpeaking ? 'animate-pulse' : ''}`}
            title="Repetir anuncio"
          >
            {isSpeaking ? <Mic2 className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
          </button>
        </div>
      </div>

      <div className="w-full bg-white dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm text-left">
        <h3 className="text-brand-primary font-bold mb-2 text-base flex items-center gap-2">
          <div className="w-2 h-2 bg-brand-primary rounded-full"></div>
          Cómo jugar esta ronda
        </h3>
        <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2 font-medium">
          <li>• <strong className="text-slate-800 dark:text-slate-200">{nombreJugadorQueEmpieza}</strong> dice la primera palabra.</li>
          <li>• Sigan el sentido del reloj (o el orden que prefieran).</li>
          <li>• Detecten quién parece confundido o duda mucho.</li>
          <li>• Cuando todos hayan hablado, pulsen "Ir a Votar".</li>
        </ul>
      </div>

      <div className="w-full space-y-3">
        <button
          onClick={onIrAVotacion}
          className="w-full py-4 bg-slate-900 hover:bg-black dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-black text-lg rounded-xl shadow-lg transform transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <Gavel className="w-5 h-5" />
          IR A VOTAR
        </button>

        <button
          onClick={onNuevaPartida}
          className="w-full py-2 bg-transparent text-slate-500 dark:text-slate-500 font-bold text-xs hover:text-slate-800 dark:hover:text-slate-300 transition-colors flex items-center justify-center gap-1"
        >
          <RefreshCw className="w-3 h-3" />
          Repartir roles de nuevo
        </button>
      </div>
    </div>
  );
};

export default PantallaFinal;
