
import React, { useState, useEffect } from 'react';
import { Users, Lock, Dice5, Play, UserX, UserPen, ChevronDown, ChevronUp, AlertTriangle, Sparkles, Settings2, Grid2X2, BookOpen } from 'lucide-react';
import { TEMAS, MIN_JUGADORES, MAX_JUGADORES } from '../constants';
import { generarPalabraConIA, ValidacionIA } from '../utils/gemini';
import { soundManager } from '../utils/audio';
import { seleccionarPalabraInteligente } from '../utils/wordSelector';

interface PantallaInicioProps {
  onIniciarPartida: (numJugadores: number, numImpostores: number, palabra: string, nombres: string[]) => void;
  onOpenSettings: () => void;
  initialConfig?: {
    numJugadores: number;
    numImpostores: number;
    nombres: string[];
  };
}

const PantallaInicio: React.FC<PantallaInicioProps> = ({ onIniciarPartida, onOpenSettings, initialConfig }) => {
  // Configuración de Jugadores
  const [numJugadores, setNumJugadores] = useState<number>(initialConfig?.numJugadores || 3);
  const [numImpostores, setNumImpostores] = useState<number>(initialConfig?.numImpostores || 1);
  
  // Configuración de Nombres
  const hayNombresPrevios = initialConfig?.nombres && initialConfig.nombres.some(n => n.trim() !== '');
  const [usarNombres, setUsarNombres] = useState<boolean>(!!hayNombresPrevios);
  const [nombres, setNombres] = useState<string[]>(initialConfig?.nombres || Array(3).fill(''));

  // Configuración de Palabra
  const [modoPalabra, setModoPalabra] = useState<'manual' | 'oculta'>('oculta');
  const [palabraManual, setPalabraManual] = useState<string>('');
  
  // Configuración de Palabra Oculta (Temas/IA)
  const [tipoOculta, setTipoOculta] = useState<'azar' | 'tema' | 'ia'>('azar');
  const [temaSeleccionado, setTemaSeleccionado] = useState<string>('ANIMALES');
  const [inputTemaIA, setInputTemaIA] = useState<string>('');
  const [loadingIA, setLoadingIA] = useState<boolean>(false);
  
  const [error, setError] = useState<string>('');
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState<boolean>(false);
  const [mostrarReglas, setMostrarReglas] = useState<boolean>(false);
  
  // Estados para confirmación +18
  const [warningAdultosPaso1, setWarningAdultosPaso1] = useState(false);
  const [warningAdultosPaso2, setWarningAdultosPaso2] = useState(false);

  useEffect(() => {
    setNombres((prevNombres) => {
      if (prevNombres.length === numJugadores) return prevNombres;
      if (numJugadores > prevNombres.length) {
        const diferencia = numJugadores - prevNombres.length;
        return [...prevNombres, ...Array(diferencia).fill('')];
      } else {
        return prevNombres.slice(0, numJugadores);
      }
    });
    
    const maxImpostoresPosibles = Math.max(1, numJugadores - 2);
    if (numImpostores > maxImpostoresPosibles) {
      setNumImpostores(maxImpostoresPosibles);
    }
  }, [numJugadores, numImpostores]);

  const actualizarNombre = (index: number, valor: string) => {
    const nuevos = [...nombres];
    nuevos[index] = valor;
    setNombres(nuevos);
  };

  const manejarCambioTema = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nuevoTema = e.target.value;
    if (nuevoTema === 'ADULTOS') {
      setWarningAdultosPaso1(true);
    } else {
      setTemaSeleccionado(nuevoTema);
    }
  };

  const confirmarAdultos1 = () => {
    setWarningAdultosPaso1(false);
    setWarningAdultosPaso2(true);
  };

  const confirmarAdultos2 = () => {
    setWarningAdultosPaso2(false);
    setTemaSeleccionado('ADULTOS');
  };

  const cancelarAdultos = () => {
    setWarningAdultosPaso1(false);
    setWarningAdultosPaso2(false);
    if (temaSeleccionado === 'ADULTOS') {
      setTemaSeleccionado('ANIMALES');
    }
  };

  const generarPalabraAleatoriaManual = () => {
    soundManager.playClick();
    const palabra = seleccionarPalabraInteligente();
    setPalabraManual(palabra);
    setError('');
  };

  const manejarIntentoInicio = () => {
    soundManager.playClick();
    if (numJugadores < MIN_JUGADORES || numJugadores > MAX_JUGADORES) {
      setError(`El número de jugadores debe estar entre ${MIN_JUGADORES} y ${MAX_JUGADORES}.`);
      return;
    }

    if (modoPalabra === 'manual' && !palabraManual.trim()) {
      setError('Debes escribir una palabra secreta o generar una aleatoria.');
      return;
    }
    
    if (modoPalabra === 'oculta' && tipoOculta === 'ia' && !inputTemaIA.trim()) {
      setError('Debes escribir un tema para que la IA genere la palabra.');
      return;
    }

    setError('');
    setMostrarConfirmacion(true);
  };

  const confirmarInicio = async () => {
    let palabraFinal = '';

    if (modoPalabra === 'manual') {
      palabraFinal = palabraManual;
    } else {
      if (tipoOculta === 'azar') {
        palabraFinal = seleccionarPalabraInteligente();
      } else if (tipoOculta === 'tema') {
        palabraFinal = seleccionarPalabraInteligente(temaSeleccionado);
      } else if (tipoOculta === 'ia') {
        setLoadingIA(true);
        try {
          const resultado: ValidacionIA = await generarPalabraConIA(inputTemaIA);
          
          if (!resultado.esValida) {
            setError(resultado.mensajeError || "La IA no pudo validar este tema.");
            setLoadingIA(false);
            setMostrarConfirmacion(false);
            return;
          }
          
          palabraFinal = resultado.palabra;
        } catch (e) {
          setError("Error crítico al conectar con la IA.");
          setLoadingIA(false);
          setMostrarConfirmacion(false);
          return;
        }
        setLoadingIA(false);
      }
    }

    onIniciarPartida(numJugadores, numImpostores, palabraFinal, usarNombres ? nombres : []);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-sm px-4 space-y-6 py-6 relative">
      <div className="absolute top-0 right-4 z-20 flex gap-2">
        <button 
          onClick={() => { soundManager.playClick(); setMostrarReglas(true); }}
          className="p-2 text-slate-600 hover:text-blue-700 dark:text-slate-400 dark:hover:text-white transition-colors"
          title="Reglas"
        >
          <BookOpen className="w-7 h-7" />
        </button>
        <button 
          onClick={onOpenSettings}
          className="p-2 text-slate-600 hover:text-blue-700 dark:text-slate-400 dark:hover:text-white transition-colors"
          title="Configuración"
        >
          <Settings2 className="w-7 h-7" />
        </button>
      </div>

      <div className="text-center space-y-1">
        <h1 className="text-4xl font-black text-slate-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-brand-primary dark:to-brand-accent">
          EL IMPOSTOR
        </h1>
        <p className="text-slate-700 dark:text-slate-400 text-base font-semibold">Configuración de partida</p>
      </div>

      <div className="w-full space-y-5 bg-white dark:bg-slate-800/50 p-6 rounded-2xl border-2 border-slate-300 dark:border-slate-700/50 shadow-xl transition-colors duration-300">
        <div className="space-y-5 pb-5 border-b-2 border-slate-200 dark:border-slate-700">
          {/* Configuración de Jugadores */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-slate-300">
                <Users className="w-5 h-5 text-blue-700 dark:text-brand-primary" />
                Jugadores
              </label>
              <span className="text-xl font-bold bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-lg text-slate-900 dark:text-white border border-slate-300 dark:border-transparent">
                {numJugadores}
              </span>
            </div>
            <input
              type="range"
              min={MIN_JUGADORES}
              max={MAX_JUGADORES}
              value={numJugadores}
              onChange={(e) => setNumJugadores(parseInt(e.target.value))}
              className="w-full h-3 bg-slate-300 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-brand-primary border border-slate-300 dark:border-transparent"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-slate-300">
                <UserX className="w-5 h-5 text-red-600 dark:text-brand-danger" />
                Impostores
              </label>
              <span className="text-xl font-bold text-red-700 dark:text-brand-danger bg-red-100 dark:bg-brand-danger/10 px-3 py-1 rounded-lg border border-red-300 dark:border-brand-danger/20">
                {numImpostores}
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={Math.max(1, numJugadores - 2)}
              value={numImpostores}
              onChange={(e) => setNumImpostores(parseInt(e.target.value))}
              className="w-full h-3 bg-slate-300 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-red-600 dark:accent-brand-danger border border-slate-300 dark:border-transparent"
            />
          </div>

          <div className="pt-2">
            <button 
              onClick={() => {
                soundManager.playClick();
                setUsarNombres(!usarNombres);
              }}
              className="w-full flex items-center justify-between text-sm text-blue-800 dark:text-brand-primary hover:text-blue-600 font-bold py-3 bg-blue-50 dark:bg-transparent rounded-lg px-3 border border-blue-200 dark:border-transparent"
            >
              <span className="flex items-center gap-2">
                <UserPen className="w-5 h-5" />
                Personalizar nombres
              </span>
              {usarNombres ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>

            {usarNombres && (
              <div className="mt-3 grid grid-cols-2 gap-2 animate-[fadeIn_0.3s_ease-out] max-h-64 overflow-y-auto pr-2 custom-scrollbar border-t border-slate-200 dark:border-slate-700 pt-3">
                {nombres.map((nombre, i) => (
                  <input
                    key={i}
                    type="text"
                    placeholder={`Jugador ${i + 1}`}
                    value={nombre}
                    onChange={(e) => actualizarNombre(i, e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border-2 border-slate-400 dark:border-slate-600 rounded-lg text-sm focus:border-blue-600 dark:focus:border-brand-primary focus:ring-1 focus:ring-blue-600 outline-none placeholder-slate-500 dark:placeholder-slate-600 text-slate-900 dark:text-white font-semibold"
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <label className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-slate-300">
            <Lock className="w-5 h-5 text-violet-700 dark:text-brand-accent" />
            Palabra Secreta
          </label>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => { soundManager.playClick(); setModoPalabra('manual'); }}
              className={`py-3 px-2 rounded-xl text-sm font-bold transition-all flex flex-col items-center gap-1 border-2 ${
                modoPalabra === 'manual'
                  ? 'bg-blue-600 dark:bg-brand-primary text-white shadow-md border-blue-600 dark:border-brand-primary'
                  : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-400 border-slate-300 dark:border-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="flex items-center gap-1"><UserPen className="w-4 h-4" /> Manual</span>
            </button>
            <button
              onClick={() => { soundManager.playClick(); setModoPalabra('oculta'); setError(''); }}
              className={`py-3 px-2 rounded-xl text-sm font-bold transition-all flex flex-col items-center gap-1 border-2 ${
                modoPalabra === 'oculta'
                  ? 'bg-violet-700 dark:bg-brand-accent text-white shadow-md border-violet-700 dark:border-brand-accent'
                  : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-400 border-slate-300 dark:border-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="flex items-center gap-1"><Dice5 className="w-4 h-4" /> Oculta</span>
            </button>
          </div>

          {modoPalabra === 'manual' ? (
            <div className="flex gap-2 animate-[fadeIn_0.3s_ease-out]">
              <input
                type="text"
                value={palabraManual}
                onChange={(e) => { setPalabraManual(e.target.value); setError(''); }}
                placeholder="Escribe la palabra..."
                className="w-full px-4 py-3 bg-white dark:bg-slate-900 border-2 border-slate-400 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-600 dark:focus:ring-brand-primary focus:border-transparent outline-none placeholder-slate-500 dark:placeholder-slate-500 text-slate-900 dark:text-white transition-all font-bold"
              />
              <button
                onClick={generarPalabraAleatoriaManual}
                className="p-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl transition-colors border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 shadow-sm"
                title="Sugerir palabra"
              >
                <Dice5 className="w-6 h-6" />
              </button>
            </div>
          ) : (
            <div className="space-y-3 animate-[fadeIn_0.3s_ease-out]">
              <div className="flex gap-1 bg-slate-200 dark:bg-slate-900 p-1.5 rounded-lg border border-slate-300 dark:border-slate-700">
                <button 
                   onClick={() => setTipoOculta('azar')}
                   className={`flex-1 py-1.5 text-xs rounded transition-all font-bold ${tipoOculta === 'azar' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-transparent' : 'text-slate-600 dark:text-slate-50'}`}
                >Azar</button>
                <button 
                   onClick={() => setTipoOculta('tema')}
                   className={`flex-1 py-1.5 text-xs rounded transition-all font-bold ${tipoOculta === 'tema' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-transparent' : 'text-slate-600 dark:text-slate-50'}`}
                >Tema</button>
                <button 
                   onClick={() => setTipoOculta('ia')}
                   className={`flex-1 py-1.5 text-xs rounded transition-all font-bold ${tipoOculta === 'ia' ? 'bg-white dark:bg-slate-700 text-violet-700 dark:text-brand-accent shadow-sm ring-1 ring-slate-200 dark:ring-transparent' : 'text-slate-600 dark:text-slate-50'}`}
                >IA</button>
              </div>

              {tipoOculta === 'azar' && (
                 <div className="p-4 bg-white dark:bg-slate-900/50 rounded-lg text-center text-sm text-slate-800 dark:text-slate-400 border border-slate-300 dark:border-slate-700 font-semibold shadow-sm">
                    Se elegirá una palabra inteligente evitando repeticiones.
                 </div>
              )}

              {tipoOculta === 'tema' && (
                <div className="relative">
                  <Grid2X2 className="absolute left-3 top-3.5 w-5 h-5 text-slate-700 dark:text-slate-500" />
                  <select 
                    value={temaSeleccionado}
                    onChange={manejarCambioTema}
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border-2 border-slate-400 dark:border-slate-600 rounded-xl appearance-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-brand-primary outline-none text-sm text-slate-900 dark:text-white font-bold shadow-sm"
                  >
                    {Object.keys(TEMAS).map(tema => (
                      <option key={tema} value={tema}>{tema.charAt(0) + tema.slice(1).toLowerCase()}</option>
                    ))}
                  </select>
                </div>
              )}

              {tipoOculta === 'ia' && (
                <div className="relative">
                  <Sparkles className="absolute left-3 top-3.5 w-5 h-5 text-violet-700 dark:text-brand-accent" />
                  <input
                    type="text"
                    value={inputTemaIA}
                    onChange={(e) => { setInputTemaIA(e.target.value); setError(''); }}
                    placeholder="Ej: Dinosaurios, Star Wars..."
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border-2 border-violet-400 dark:border-brand-accent/30 rounded-xl focus:ring-2 focus:ring-violet-600 dark:focus:ring-brand-accent outline-none text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-500 transition-all font-bold shadow-sm"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="p-3 bg-red-100 dark:bg-red-500/10 border-l-4 border-red-600 dark:border-red-500 rounded text-red-800 dark:text-red-400 text-sm font-bold text-center animate-shake">
            {error}
          </div>
        )}
      </div>

      <button
        onClick={manejarIntentoInicio}
        className="w-full py-4 bg-blue-700 hover:bg-blue-800 dark:bg-gradient-to-r dark:from-brand-primary dark:to-brand-accent dark:hover:from-blue-500 dark:hover:to-violet-500 text-white font-bold text-lg rounded-xl shadow-xl transform transition-all active:scale-95 flex items-center justify-center gap-2"
      >
        <Play className="w-6 h-6 fill-current" />
        INICIAR PARTIDA
      </button>

      {mostrarConfirmacion && (
        <div className="absolute inset-0 z-50 flex items-center justify-center animate-[fadeIn_0.2s_ease-out]">
           <div 
             className="absolute inset-0 bg-slate-900/60 dark:bg-brand-dark/90 backdrop-blur-sm rounded-xl"
             onClick={() => !loadingIA && setMostrarConfirmacion(false)}
           ></div>
           
           <div className="relative w-full max-w-[95%] bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-2xl p-6 shadow-2xl space-y-6">
              {loadingIA ? (
                 <div className="flex flex-col items-center justify-center py-8 space-y-4">
                    <div className="w-12 h-12 border-4 border-violet-600 dark:border-brand-accent border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-violet-700 dark:text-brand-accent font-bold animate-pulse text-center">
                       Validando tema y generando palabra...
                    </p>
                 </div>
              ) : (
                <>
                  <div className="text-center space-y-2">
                     <div className="w-14 h-14 bg-blue-100 dark:bg-brand-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <AlertTriangle className="w-7 h-7 text-blue-700 dark:text-brand-primary" />
                     </div>
                     <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100">¿Confirmar partida?</h3>
                     <p className="text-sm text-slate-600 dark:text-slate-400 font-semibold">Revisa la configuración antes de empezar.</p>
                  </div>

                  <div className="space-y-3 text-sm bg-slate-100 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-300 dark:border-slate-700/50">
                     <div className="flex justify-between items-center pb-2 border-b border-slate-300 dark:border-slate-700/50">
                        <span className="text-slate-700 dark:text-slate-400 flex items-center gap-2 font-bold"><Users className="w-4 h-4" /> Jugadores:</span>
                        <span className="font-black text-slate-900 dark:text-slate-200 text-lg">{numJugadores}</span>
                     </div>
                     <div className="flex justify-between items-center pb-2 border-b border-slate-300 dark:border-slate-700/50">
                        <span className="text-slate-700 dark:text-slate-400 flex items-center gap-2 font-bold"><UserX className="w-4 h-4" /> Impostores:</span>
                        <span className="text-red-700 dark:text-brand-danger font-black text-lg">{numImpostores}</span>
                     </div>
                     <div className="flex justify-between items-start gap-4 pt-1">
                        <span className="text-slate-700 dark:text-slate-400 flex items-center gap-2 mt-0.5 font-bold"><Lock className="w-4 h-4" /> Palabra:</span>
                        <span className="font-bold text-right break-words max-w-[150px] leading-tight text-slate-900 dark:text-slate-200">
                          {modoPalabra === 'manual' ? palabraManual : (
                             <span className="text-violet-700 dark:text-brand-accent italic flex items-center gap-1 justify-end font-bold text-xs uppercase tracking-tighter">
                               {tipoOculta === 'ia' ? <Sparkles className="w-3 h-3"/> : null} 
                               {tipoOculta === 'ia' ? `IA: ${inputTemaIA}` : tipoOculta === 'tema' ? `Tema: ${temaSeleccionado}` : 'Aleatoria (Oculta)'}
                             </span>
                          )}
                        </span>
                     </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                     <button 
                        onClick={() => { soundManager.playClick(); setMostrarConfirmacion(false); }}
                        className="flex-1 py-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-bold rounded-xl transition-colors text-sm border border-slate-300 dark:border-transparent"
                     >
                        Cancelar
                     </button>
                     <button 
                        onClick={() => { soundManager.playStart(); confirmarInicio(); }}
                        className="flex-1 py-3 bg-blue-700 hover:bg-blue-800 dark:bg-brand-primary dark:hover:bg-brand-primary/90 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 text-sm flex items-center justify-center gap-2"
                     >
                        <Play className="w-4 h-4 fill-current" />
                        ¡A jugar!
                     </button>
                  </div>
                </>
              )}
           </div>
        </div>
      )}

      {/* Warning Adultos Paso 1 */}
      {warningAdultosPaso1 && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={cancelarAdultos}></div>
           <div className="relative bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-sm text-center border-4 border-red-600 shadow-[0_0_50px_rgba(239,68,68,0.3)] space-y-6">
              <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto ring-4 ring-red-500/20">
                 <AlertTriangle className="w-12 h-12 text-red-600" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-red-600 uppercase tracking-tighter">¡ALTO AHÍ!</h2>
                <p className="text-slate-900 dark:text-white font-bold text-lg leading-tight">
                  Has seleccionado el modo ADULTOS (+18).
                </p>
                <p className="text-slate-600 dark:text-slate-400 text-sm font-semibold">
                  Este modo contiene palabras explícitas y contenido sexual.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                 <button onClick={confirmarAdultos1} className="w-full py-4 bg-red-600 text-white font-black rounded-xl hover:bg-red-700 transition-colors">SOY MAYOR DE EDAD</button>
                 <button onClick={cancelarAdultos} className="w-full py-3 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white font-bold rounded-xl">CANCELAR</button>
              </div>
           </div>
        </div>
      )}

      {/* Warning Adultos Paso 2 */}
      {warningAdultosPaso2 && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={cancelarAdultos}></div>
           <div className="relative bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-sm text-center border-4 border-orange-500 shadow-[0_0_50px_rgba(249,115,22,0.3)] space-y-6">
              <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto">
                 <Lock className="w-10 h-10 text-orange-600" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-orange-600 uppercase tracking-tighter italic">¿ÚLTIMA PALABRA?</h2>
                <p className="text-slate-900 dark:text-white font-bold text-base">
                  No nos hacemos responsables de las caras de vergüenza de tus amigos.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                 <button onClick={confirmarAdultos2} className="w-full py-4 bg-orange-600 text-white font-black rounded-xl hover:bg-orange-700 transition-colors">CONFIRMAR MODO PICANTE</button>
                 <button onClick={cancelarAdultos} className="w-full py-3 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white font-bold rounded-xl">MEJOR NO...</button>
              </div>
           </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out infinite;
          animation-iteration-count: 2;
        }
      `}} />
    </div>
  );
};

export default PantallaInicio;
