
import React, { useState, useEffect } from 'react';
import PantallaInicio from './components/PantallaInicio';
import PantallaRol from './components/PantallaRol';
import PantallaFinal from './components/PantallaFinal';
import PantallaVotacion from './components/PantallaVotacion';
import PantallaResultado from './components/PantallaResultado';
import MenuAccesibilidad, { AccesibilidadSettings } from './components/MenuAccesibilidad';
import { FaseJuego } from './types';
import { soundManager } from './utils/audio';

function App() {
  // --- Accesibilidad ---
  const [settings, setSettings] = useState<AccesibilidadSettings>({
    modoOscuro: true,
    altoContraste: false,
    fuenteDislexia: false,
    textoGrande: false,
    sinAnimaciones: false,
  });
  const [showSettings, setShowSettings] = useState(false);

  // Aplicar clases globales según settings
  useEffect(() => {
    const root = document.documentElement;
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');

    if (settings.modoOscuro) {
      root.classList.add('dark');
      document.body.classList.add('bg-brand-dark', 'text-slate-100');
      document.body.classList.remove('bg-slate-100', 'text-slate-900');
      metaThemeColor?.setAttribute('content', '#0f172a'); 
    } else {
      root.classList.remove('dark');
      document.body.classList.add('bg-slate-100', 'text-slate-900');
      document.body.classList.remove('bg-brand-dark', 'text-slate-100');
      metaThemeColor?.setAttribute('content', '#f1f5f9');
    }

    if (settings.fuenteDislexia) document.body.style.fontFamily = '"Comic Sans MS", "Chalkboard SE", sans-serif';
    else document.body.style.fontFamily = '';

    if (settings.textoGrande) document.documentElement.style.fontSize = '18px';
    else document.documentElement.style.fontSize = '16px';

    if (settings.altoContraste) document.body.classList.add('contrast-125');
    else document.body.classList.remove('contrast-125');

  }, [settings]);

  // --- Estados del Juego ---
  const [fase, setFase] = useState<FaseJuego>(FaseJuego.INICIO);
  const [numJugadores, setNumJugadores] = useState<number>(3);
  const [nombresJugadores, setNombresJugadores] = useState<string[]>([]);
  const [palabraSecreta, setPalabraSecreta] = useState<string>('');
  
  const [impostoresIndices, setImpostoresIndices] = useState<number[]>([]);
  const [impostoresEncontrados, setImpostoresEncontrados] = useState<number[]>([]);

  const [jugadorActual, setJugadorActual] = useState<number>(0);
  const [jugadorQueEmpiezaIndex, setJugadorQueEmpiezaIndex] = useState<number>(0);
  const [jugadorVotadoIndex, setJugadorVotadoIndex] = useState<number | null>(null);
  const [intentosRestantes, setIntentosRestantes] = useState<number>(1);
  const [historialVotos, setHistorialVotos] = useState<number[]>([]);

  const [configGuardada, setConfigGuardada] = useState<{
    numJugadores: number;
    numImpostores: number;
    nombres: string[];
  } | undefined>(undefined);

  // --- Lógica del Juego ---

  const handleIniciarPartida = (nJugadores: number, nImpostores: number, palabra: string, nombres: string[]) => {
    const nombresParaJuego = nombres.length > 0 
        ? nombres.map((n, i) => n.trim() ? n.trim() : `Jugador ${i + 1}`) 
        : Array.from({length: nJugadores}, (_, i) => `Jugador ${i + 1}`);

    setConfigGuardada({
        numJugadores: nJugadores,
        numImpostores: nImpostores,
        nombres: nombres
    });

    setNumJugadores(nJugadores);
    setPalabraSecreta(palabra);
    setNombresJugadores(nombresParaJuego);
    setHistorialVotos([]);
    setImpostoresEncontrados([]);
    setIntentosRestantes(nImpostores);

    const indices = Array.from({ length: nJugadores }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    
    const nuevosImpostores = indices.slice(0, nImpostores);
    setImpostoresIndices(nuevosImpostores);
    setJugadorActual(0);
    // Ir directamente a ver el rol (la tarjeta oculta la info)
    setFase(FaseJuego.VIENDO_ROL);
  };

  const handleSiguiente = () => {
    soundManager.playClick();
    const siguienteIndex = jugadorActual + 1;

    if (siguienteIndex < numJugadores) {
      setJugadorActual(siguienteIndex);
      // Volvemos a la fase de ver rol para el siguiente jugador
      setFase(FaseJuego.VIENDO_ROL);
    } else {
      const randomIndex = Math.floor(Math.random() * numJugadores);
      setJugadorQueEmpiezaIndex(randomIndex);
      soundManager.playStart();
      setFase(FaseJuego.FINAL);
    }
  };

  const handleIrAVotacion = () => {
    soundManager.playClick();
    setFase(FaseJuego.VOTACION);
  };

  const handleVotar = (indiceVotado: number) => {
    setJugadorVotadoIndex(indiceVotado);
    setHistorialVotos(prev => [...prev, indiceVotado]);
    setFase(FaseJuego.RESULTADO);
    
    const esImpostor = impostoresIndices.includes(indiceVotado);
    setIntentosRestantes(prev => prev - 1);

    if (esImpostor) {
      soundManager.playWin();
      if (!impostoresEncontrados.includes(indiceVotado)) {
        setImpostoresEncontrados(prev => [...prev, indiceVotado]);
      }
    } else {
      soundManager.playLoss();
    }
  };

  const handleSeguirVotando = () => {
    setJugadorVotadoIndex(null);
    setFase(FaseJuego.VOTACION);
  };

  const handleNuevaPartida = () => {
    soundManager.playClick();
    setFase(FaseJuego.INICIO);
    setPalabraSecreta('');
    setImpostoresIndices([]);
    setImpostoresEncontrados([]);
    setJugadorActual(0);
    setJugadorVotadoIndex(null);
    setHistorialVotos([]);
  };

  return (
    <div className={`min-h-screen flex flex-col p-4 transition-colors duration-300 overflow-x-hidden`}>
      {!settings.sinAnimaciones && (
        <>
           <div className="fixed top-10 left-10 w-32 h-32 bg-blue-500/10 dark:bg-brand-primary/10 rounded-full blur-3xl pointer-events-none z-0"></div>
           <div className="fixed bottom-10 right-10 w-40 h-40 bg-violet-500/10 dark:bg-brand-accent/10 rounded-full blur-3xl pointer-events-none z-0"></div>
        </>
      )}

      <main className="flex-grow flex flex-col items-center justify-center w-full max-w-md mx-auto relative z-10 my-4">
        {fase === FaseJuego.INICIO && (
          <PantallaInicio 
            onIniciarPartida={handleIniciarPartida} 
            onOpenSettings={() => setShowSettings(true)}
            initialConfig={configGuardada}
          />
        )}

        {fase === FaseJuego.VIENDO_ROL && (
          <PantallaRol
            key={jugadorActual} // Forzar re-render para resetear el estado de la tarjeta al cambiar de jugador
            nombreJugador={nombresJugadores[jugadorActual]}
            esImpostor={impostoresIndices.includes(jugadorActual)}
            palabraSecreta={palabraSecreta}
            onSiguiente={handleSiguiente}
          />
        )}

        {fase === FaseJuego.FINAL && (
          <PantallaFinal 
            nombreJugadorQueEmpieza={nombresJugadores[jugadorQueEmpiezaIndex]}
            onIrAVotacion={handleIrAVotacion}
            onNuevaPartida={handleNuevaPartida} 
          />
        )}

        {fase === FaseJuego.VOTACION && (
          <PantallaVotacion
            nombresJugadores={nombresJugadores}
            onVotar={handleVotar}
            jugadoresVotados={historialVotos}
            intentosRestantes={intentosRestantes}
          />
        )}

        {fase === FaseJuego.RESULTADO && jugadorVotadoIndex !== null && (
          <PantallaResultado
            nombreVotado={nombresJugadores[jugadorVotadoIndex]}
            esImpostorCorrecto={impostoresIndices.includes(jugadorVotadoIndex)}
            nombresImpostores={impostoresIndices.map(i => nombresJugadores[i])}
            palabraSecreta={palabraSecreta}
            onNuevaPartida={handleNuevaPartida}
            intentosRestantes={intentosRestantes}
            onSeguirVotando={handleSeguirVotando}
            impostoresEncontradosCount={impostoresEncontrados.length}
            totalImpostores={impostoresIndices.length}
          />
        )}
      </main>
      
      {showSettings && (
        <MenuAccesibilidad 
          settings={settings} 
          setSettings={setSettings} 
          onClose={() => setShowSettings(false)} 
        />
      )}

      <footer className="w-full py-4 text-center z-10 mt-auto opacity-70">
        <p className="text-slate-500 dark:text-slate-500 text-xs font-semibold">
          © {new Date().getFullYear()} El Impostor
        </p>
      </footer>
    </div>
  );
}

export default App;
