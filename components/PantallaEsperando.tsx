
import React from 'react';
import { Eye, User } from 'lucide-react';

interface PantallaEsperandoProps {
  nombreJugador: string;
  onVerRol: () => void;
}

const PantallaEsperando: React.FC<PantallaEsperandoProps> = ({ nombreJugador, onVerRol }) => {
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-sm px-6 text-center space-y-8 animate-fade-in py-8">
      
      <div className="relative">
        <div className="absolute inset-0 bg-blue-600/20 dark:bg-brand-primary/20 blur-3xl rounded-full"></div>
        <div className="relative bg-white dark:bg-slate-800 p-6 rounded-full border-2 border-slate-300 dark:border-slate-700 shadow-2xl">
          <User className="w-16 h-16 text-slate-700 dark:text-slate-200" />
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-sm font-bold tracking-widest text-slate-600 dark:text-slate-400 uppercase">
          Turno de
        </h2>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white leading-tight break-words max-w-full">
          {nombreJugador}
        </h1>
      </div>

      <div className="p-6 bg-white dark:bg-slate-800/50 border-2 border-slate-300 dark:border-slate-700 rounded-2xl shadow-lg">
        <p className="text-lg text-slate-800 dark:text-slate-300 leading-relaxed font-semibold">
          Toma el dispositivo y asegúrate de que nadie más esté mirando la pantalla.
        </p>
      </div>

      <button
        onClick={onVerRol}
        className="w-full py-4 bg-slate-900 hover:bg-black dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-bold text-lg rounded-xl shadow-xl transform transition-all active:scale-95 flex items-center justify-center gap-2 mt-8 border border-transparent"
      >
        <Eye className="w-6 h-6" />
        VER MI ROL
      </button>
    </div>
  );
};

export default PantallaEsperando;
