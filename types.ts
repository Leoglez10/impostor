// Definimos las fases del juego para controlar el flujo de la aplicación
export enum FaseJuego {
  INICIO = 'inicio',
  ESPERANDO_JUGADOR = 'esperandoJugador',
  VIENDO_ROL = 'viendoRol',
  FINAL = 'final',
  VOTACION = 'votacion',
  RESULTADO = 'resultado'
}

// Interfaz para las props comunes de las pantallas si fuera necesario
// (En este caso simple, pasaremos props directas)