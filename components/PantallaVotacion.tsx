
import React, { useState } from 'react';
import { User, Gavel, AlertCircle, Ban, Heart } from 'lucide-react';

interface PantallaVotacionProps {
  nombresJugadores: string[];
  onVotar: (indiceVotado: number) => void;
  jugadoresVotados: number[];
  intentosRestantes: number;
}

const PantallaVotacion: React.FC<PantallaVotacionProps> = ({ nombresJugadores, onVotar, jugadoresVotados, intentosRestantes }) => {
  const [seleccionado, setSeleccionado] = useState<number | null>(null);

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-sm px-4 space-y-6 animate-fade-in py-6">
      
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-blue-100 dark:bg-brand-primary/20 rounded-full flex items-center justify-center mx-auto mb-2 border border-blue-200 dark:border-transparent">
           <Gavel className="w-8 h-8 text-blue-700 dark:text-brand-primary" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Momento de Votar</h1>
        
        {/* Indicador de Vidas/Intentos */}
        <div className="inline-flex items-center gap-2 bg-red-100 dark:bg-red-900/30 px-3 py-1 rounded-full border border-red-200 dark:border-red-800/50">
           <Heart className="w-4 h-4 text-red-600 dark:text-red-400 fill-current" />
           <span className="text-sm font-bold text-red-800 dark:text-red-300">
             {intentosRestantes} {intentosRestantes === 1 ? 'Vida restante' : 'Vidas restantes'}
           </span>
        </div>

        <p className="text-slate-600 dark:text-slate-400 text-sm font-semibold pt-1">
          Decidan en grupo quién es el impostor.
        </p>
      </div>

      <div className="w-full grid grid-cols-2 gap-2 max-h-[55vh] overflow-y-auto pr-1 custom-scrollbar">
        {nombresJugadores.map((nombre, index) => {
          const yaVotado = jugadoresVotados.includes(index);
          
          return (
            <button
              key={index}
              disabled={yaVotado}
              onClick={() => !yaVotado && setSeleccionado(index)}
              className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1.5 relative shadow-sm min-h-[90px] ${
                yaVotado 
                  ? 'bg-slate-200 dark:bg-slate-900 border-slate-300 dark:border-slate-800 opacity-60 cursor-not-allowed grayscale'
                  : seleccionado === index
                    ? 'bg-blue-50 dark:bg-brand-primary/20 border-blue-600 dark:border-brand-primary text-slate-900 dark:text-white shadow-md ring-1 ring-blue-600 dark:ring-brand-primary'
                    : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-400 dark:hover:border-slate-500'
              }`}
            >
              {yaVotado ? (
                <User className="w-6 h-6 text-slate-400 dark:text-slate-600" />
              ) : (
                <User className={`w-6 h-6 ${seleccionado === index ? 'text-blue-700 dark:text-brand-primary' : 'text-slate-400 dark:text-slate-500'}`} />
              )}
              
              <span className={`font-bold text-xs truncate w-full text-center ${yaVotado ? 'line-through text-slate-400 dark:text-slate-600' : ''}`}>
                {nombre}
              </span>
              
              {seleccionado === index && !yaVotado && (
                <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-blue-600 dark:bg-brand-primary rounded-full animate-pulse"></div>
              )}
              
              {yaVotado && (
                 <div className="absolute top-2 right-2">
                    <Ban className="w-4 h-4 text-slate-400 dark:text-slate-600" />
                 </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="w-full pt-2">
        {seleccionado !== null ? (
           <button
             onClick={() => onVotar(seleccionado)}
             className="w-full py-4 bg-red-600 hover:bg-red-700 dark:bg-brand-danger dark:hover:bg-red-600 text-white font-bold text-lg rounded-xl shadow-xl transform transition-all active:scale-95 flex items-center justify-center gap-2"
           >
             <Gavel className="w-6 h-6" />
             VOTAR A {nombresJugadores[seleccionado].toUpperCase()}
           </button>
        ) : (
          <div className="w-full py-4 bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-500 font-bold text-lg rounded-xl border border-slate-300 dark:border-slate-700 flex items-center justify-center gap-2 cursor-not-allowed opacity-80">
            <AlertCircle className="w-6 h-6" />
            Selecciona un jugador
          </div>
        )}
      </div>
    </div>
  );
};

export default PantallaVotacion;
