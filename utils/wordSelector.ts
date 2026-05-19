
import { PALABRAS_ALEATORIAS, TEMAS } from '../constants';

const STORAGE_KEY = 'el_impostor_historial_palabras';
const MAX_HISTORIAL = 100; // No repetir las últimas 100 palabras

/**
 * Obtiene el historial de palabras usadas desde localStorage
 */
const getHistorial = (): string[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

/**
 * Guarda una nueva palabra en el historial
 */
const guardarEnHistorial = (palabra: string) => {
  const historial = getHistorial();
  const nuevoHistorial = [palabra, ...historial.filter(p => p !== palabra)].slice(0, MAX_HISTORIAL);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nuevoHistorial));
};

/**
 * Selecciona una palabra inteligente evitando las usadas recientemente
 */
export const seleccionarPalabraInteligente = (tema?: string): string => {
  let pool: string[] = [];

  if (tema && (TEMAS as any)[tema]) {
    pool = [...(TEMAS as any)[tema]];
  } else {
    // Solo usamos la lista base de PALABRAS_ALEATORIAS sin inyectar las de otros temas
    pool = [...PALABRAS_ALEATORIAS];
  }

  const historial = getHistorial();
  
  // Intentamos filtrar las palabras que ya salieron recientemente
  let opcionesDisponibles = pool.filter(p => !historial.includes(p));

  // Si nos quedamos sin opciones (el pool es pequeño o el historial es muy grande), 
  // permitimos que se repitan las más antiguas usando el pool completo
  if (opcionesDisponibles.length === 0) {
    opcionesDisponibles = pool;
  }

  // Selección aleatoria sobre el pool filtrado
  const indice = Math.floor(Math.random() * opcionesDisponibles.length);
  const palabraElegida = opcionesDisponibles[indice];

  // Registrar en historial para la próxima vez
  guardarEnHistorial(palabraElegida);

  return palabraElegida;
};
