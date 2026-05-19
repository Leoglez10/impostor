
import React, { useState } from 'react';
import { CheckCircle2, UserX, UserCheck, ShieldQuestion, ArrowLeft, Fingerprint, Lock, Unlock } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface PantallaRolProps {
  nombreJugador: string;
  esImpostor: boolean;
  palabraSecreta: string;
  onSiguiente: () => void;
}

const PantallaRol: React.FC<PantallaRolProps> = ({ nombreJugador, esImpostor, palabraSecreta, onSiguiente }) => {
  const [abierto, setAbierto] = useState(false);
  const [haSidoRevelada, setHaSidoRevelada] = useState(false);

  const manejarClick = () => {
    soundManager.playReveal();
    const nuevoEstado = !abierto;
    setAbierto(nuevoEstado);
    if (nuevoEstado && !haSidoRevelada) {
      setHaSidoRevelada(true);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-sm px-4 text-center space-y-6 animate-fade-in py-4">
      
      <div className="space-y-1">
        <h2 className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.4em]">
          Protocolo de Identidad
        </h2>
        <p className="text-xs text-slate-400 dark:text-slate-500 font-bold">
          {abierto ? 'Toca para bloquear de nuevo' : 'Toca la tarjeta para escanear'}
        </p>
      </div>

      {/* Tarjeta con Efecto Corner Expansion Mejorado */}
      <div 
        className={`relative w-[300px] h-[400px] rounded-[2.5rem] shadow-2xl overflow-hidden cursor-pointer transition-all duration-500 transform active:scale-95 border-4 flex items-center justify-center
          ${abierto ? 'border-slate-800 dark:border-white/20' : 'bg-slate-100 dark:bg-slate-900 border-white dark:border-slate-800'}
        `}
        onClick={manejarClick}
      >
        {/* Contenido Base (Se oscurece al abrir) */}
        <div className={`flex flex-col items-center justify-center p-8 space-y-6 z-0 transition-all duration-500 ${abierto ? 'opacity-30 scale-95 blur-sm brightness-50' : 'opacity-100'}`}>
          <div className="w-24 h-24 bg-slate-200 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center shadow-inner border border-slate-300 dark:border-slate-700">
            <Lock className="w-12 h-12 text-slate-400" />
          </div>
          <div className="space-y-3">
            <span className="text-[10px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-[0.5em] block">Agente Autorizado</span>
            <div className="bg-white dark:bg-slate-950/50 px-6 py-4 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
               <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100 truncate max-w-[200px]">
                {nombreJugador}
              </h3>
            </div>
          </div>
          <div className="pt-4 flex flex-col items-center gap-2">
            <Fingerprint className="w-8 h-8 text-blue-500/40 dark:text-brand-primary/30 animate-pulse" />
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest italic">Toque para autenticar</span>
          </div>
        </div>

        {/* Capa de oscurecimiento total al abrir */}
        {abierto && <div className="absolute inset-0 bg-black/60 z-[5] animate-fade-in"></div>}

        {/* Panel Superior Derecho (Principal) */}
        <div 
          className={`absolute top-0 right-0 transition-all duration-700 cubic-bezier(0.4, 0, 0.2, 1) z-10 flex items-center justify-center
            ${abierto 
              ? 'w-full h-full rounded-none opacity-100' 
              : 'w-[20%] h-[15%] rounded-bl-[100%] opacity-0'
            }
            ${esImpostor ? 'bg-red-600' : 'bg-blue-600'}
          `}
        >
          {/* Contenido Secreto */}
          <div className={`transition-all duration-500 flex flex-col items-center gap-6 px-6 z-20 ${abierto ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-50 translate-y-10'}`}>
            {esImpostor ? (
              <>
                <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border-2 border-white/40 shadow-2xl">
                  <UserX className="w-14 h-14 text-white" />
                </div>
                <div className="space-y-2">
                   <h4 className="text-white font-black text-5xl uppercase tracking-tighter italic drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">IMPOSTOR</h4>
                   <div className="h-1.5 w-16 bg-white/40 mx-auto rounded-full"></div>
                   <p className="text-white/90 text-sm font-bold max-w-[220px] leading-tight drop-shadow-md">
                     Mézclate con los demás. Tu objetivo es descubrir la palabra secreta sin ser detectado.
                   </p>
                </div>
              </>
            ) : (
              <>
                <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border-2 border-white/40 shadow-2xl">
                  <UserCheck className="w-14 h-14 text-white" />
                </div>
                <div className="space-y-4">
                   <span className="text-white/80 text-[11px] font-black uppercase tracking-[0.4em] drop-shadow-md">Palabra Secreta</span>
                   <div className="bg-white text-slate-900 py-6 px-10 rounded-[2.5rem] shadow-2xl transform -rotate-1 ring-8 ring-white/10">
                      <h4 className="font-black text-4xl uppercase tracking-tight leading-none">
                        {palabraSecreta}
                      </h4>
                   </div>
                   <p className="text-white/90 text-[11px] font-bold italic leading-tight px-4 drop-shadow-md">
                     Describe la palabra con cuidado. Si el impostor la adivina, ¡habréis perdido!
                   </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Panel Inferior Izquierdo (Acento - Ahora más claro para efecto de luz) */}
        <div 
          className={`absolute bottom-0 left-0 transition-all duration-700 cubic-bezier(0.4, 0, 0.2, 1) z-[15] pointer-events-none
            ${abierto 
              ? 'w-full h-full rounded-none opacity-40' 
              : 'w-[20%] h-[15%] rounded-tr-[100%] opacity-0'
            }
            ${esImpostor ? 'bg-red-400' : 'bg-blue-400'}
          `}
        >
          {/* Gradiente sutil para dar volumen al color claro */}
          {abierto && (
            <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent"></div>
          )}
        </div>
      </div>

      {/* Botón de continuación */}
      <div className="w-full pt-2 min-h-[90px]">
        {haSidoRevelada ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSiguiente();
            }}
            className={`w-full py-5 font-black text-xl rounded-[2rem] shadow-2xl transform transition-all active:scale-95 flex items-center justify-center gap-3 border-b-4 animate-in slide-in-from-bottom-4 duration-300
              ${abierto 
                ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 border-black/20' 
                : 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-black/20'
              }
            `}
          >
            <CheckCircle2 className="w-7 h-7" />
            ENTENDIDO, SIGUIENTE
          </button>
        ) : (
          <div className="w-full py-5 bg-slate-200/50 dark:bg-slate-800/30 rounded-[2rem] text-slate-400 dark:text-slate-600 font-black text-lg border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center gap-2">
            <ArrowLeft className="w-5 h-5 animate-bounce-x" />
            Escanear para continuar
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out;
        }
        @keyframes bounce-x {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(-8px); }
        }
        .animate-bounce-x {
          animation: bounce-x 1.2s infinite;
        }
        .cubic-bezier(0.4, 0, 0.2, 1) {
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}} />
    </div>
  );
};

export default PantallaRol;
