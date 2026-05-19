
import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, RotateCcw, UserX, ArrowLeft, Search, Volume2, Mic2 } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface PantallaResultadoProps {
  nombreVotado: string;
  esImpostorCorrecto: boolean;
  nombresImpostores: string[];
  palabraSecreta: string;
  onNuevaPartida: () => void;
  intentosRestantes: number;
  onSeguirVotando: () => void;
  impostoresEncontradosCount: number;
  totalImpostores: number;
}

const PantallaResultado: React.FC<PantallaResultadoProps> = ({ 
  nombreVotado, 
  esImpostorCorrecto, 
  nombresImpostores, 
  palabraSecreta,
  onNuevaPartida,
  intentosRestantes,
  onSeguirVotando,
  impostoresEncontradosCount,
  totalImpostores
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Lógica de finalización:
  const todosEncontrados = impostoresEncontradosCount >= totalImpostores;
  const sinIntentos = intentosRestantes <= 0;
  
  const juegoTerminado = todosEncontrados || sinIntentos;
  const esVictoriaFinal = todosEncontrados;
  const faltantes = totalImpostores - impostoresEncontradosCount;

  const anunciarResultado = async () => {
    if (isSpeaking || !juegoTerminado) return;
    setIsSpeaking(true);
    try {
      await soundManager.announceGameResult(esVictoriaFinal, nombresImpostores);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSpeaking(false);
    }
  };

  useEffect(() => {
    if (juegoTerminado) {
      // Aumentamos a 1.5 segundos para que el efecto de sonido (Win/Loss) termine de sonar bien
      const timer = setTimeout(() => {
        anunciarResultado();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [juegoTerminado]);

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-sm px-6 text-center space-y-8 animate-[fadeIn_0.5s_ease-out] py-6">
      
      {/* Icono de Resultado */}
      <div className="relative">
        <div className={`absolute inset-0 blur-3xl rounded-full opacity-30 ${esImpostorCorrecto ? 'bg-green-600' : 'bg-red-600'}`}></div>
        {esImpostorCorrecto ? (
          <CheckCircle2 className="w-32 h-32 text-green-600 relative z-10 drop-shadow-xl" />
        ) : (
          <XCircle className="w-32 h-32 text-red-600 relative z-10 drop-shadow-xl" />
        )}
      </div>

      {/* Título y Mensajes */}
      <div className="space-y-3">
        <h1 className={`text-4xl font-black uppercase ${esImpostorCorrecto ? 'text-green-700 dark:text-green-500' : 'text-red-700 dark:text-red-500'}`}>
          {esImpostorCorrecto 
            ? (esVictoriaFinal ? '¡VICTORIA TOTAL!' : '¡ATRAPADO!') 
            : (juegoTerminado ? '¡DERROTA!' : '¡FALLASTE!')}
        </h1>

        <p className="text-slate-900 dark:text-white text-xl font-bold leading-relaxed">
          {esImpostorCorrecto 
            ? (esVictoriaFinal 
                ? `¡Genial! Has encontrado a todos. ${nombreVotado} era el último impostor.`
                : `¡Bien hecho! ${nombreVotado} es un impostor. Pero cuidado, aún quedan más.`)
            : `¡Oh no! ${nombreVotado} NO era impostor.`}
        </p>

        {/* Estado del juego (Impostores restantes / Intentos) */}
        {!juegoTerminado && (
           <div className="flex flex-col gap-2 pt-2 items-center">
              {esImpostorCorrecto && (
                <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-4 py-2 rounded-lg text-sm font-bold border border-blue-200 dark:border-blue-800 flex items-center gap-2">
                   <Search className="w-4 h-4" />
                   Faltan {faltantes} {faltantes === 1 ? 'impostor' : 'impostores'}
                </div>
              )}
              
              {!esImpostorCorrecto && (
                 <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 px-4 py-2 rounded-lg text-sm font-bold border border-yellow-300 dark:border-yellow-700">
                    Te quedan {intentosRestantes} {intentosRestantes === 1 ? 'intento' : 'intentos'}
                 </div>
              )}
           </div>
        )}
      </div>

      {/* Revelación Final (Solo si acaba el juego) */}
      {juegoTerminado && (
        <div className="w-full bg-white dark:bg-slate-800/80 p-6 rounded-2xl border-2 border-slate-300 dark:border-slate-700 space-y-4 shadow-xl relative overflow-hidden group">
          
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-500 font-black">Palabra Secreta</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-700 py-2 rounded-lg border border-slate-200 dark:border-transparent">
              {palabraSecreta}
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t-2 border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-red-700 dark:text-brand-danger font-black flex items-center gap-1">
                <UserX className="w-4 h-4" />
                Los Impostores eran
              </span>
              <button 
                onClick={anunciarResultado}
                disabled={isSpeaking}
                className={`p-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg transition-all active:scale-90 ${isSpeaking ? 'animate-pulse text-blue-600' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'}`}
                title="Repetir anuncio final"
              >
                {isSpeaking ? <Mic2 className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {nombresImpostores.map((imp, idx) => (
                <span key={idx} className="bg-red-100 dark:bg-brand-danger/20 text-red-800 dark:text-brand-danger border border-red-200 dark:border-brand-danger/30 px-3 py-1 rounded-full font-bold">
                  {imp}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Botones */}
      <div className="w-full space-y-3">
        {!juegoTerminado ? (
          <button
            onClick={onSeguirVotando}
            className="w-full py-4 bg-blue-700 hover:bg-blue-800 dark:bg-brand-primary dark:hover:bg-blue-600 text-white font-bold text-lg rounded-xl shadow-xl transform transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-6 h-6" />
            SEGUIR BUSCANDO
          </button>
        ) : (
          <button
            onClick={onNuevaPartida}
            className={`w-full py-4 font-bold text-lg rounded-xl shadow-xl transform transition-all active:scale-95 flex items-center justify-center gap-2 ${
               esVictoriaFinal 
               ? 'bg-green-600 hover:bg-green-700 text-white' 
               : 'bg-slate-800 hover:bg-slate-900 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900'
            }`}
          >
            <RotateCcw className="w-6 h-6" />
            JUGAR OTRA VEZ
          </button>
        )}
      </div>
    </div>
  );
};

export default PantallaResultado;
