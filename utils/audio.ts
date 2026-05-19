
// Audio TTS is now proxied through a serverless endpoint to keep the API key secret.

// Funciones de decodificación requeridas por la guía
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

class SoundManager {
  private context: AudioContext | null = null;
  private volume: number = 0.3;
  private activeSource: AudioBufferSourceNode | null = null;

  private initContext() {
    if (!this.context) {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.context.state === 'suspended') {
      this.context.resume();
    }
    return this.context;
  }

  /**
   * Detiene cualquier audio de voz (TTS) que se esté reproduciendo actualmente
   */
  private stopActiveVoice() {
    if (this.activeSource) {
      try {
        this.activeSource.stop();
      } catch (e) {
        // Ya estaba detenido
      }
      this.activeSource = null;
    }
  }

  private playTone(freq: number, type: OscillatorType, duration: number, startTime: number = 0) {
    const ctx = this.initContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);

    gain.gain.setValueAtTime(this.volume, ctx.currentTime + startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime + startTime);
    osc.stop(ctx.currentTime + startTime + duration);
  }

  playClick() {
    this.playTone(600, 'sine', 0.1);
  }

  playStart() {
    this.playTone(400, 'triangle', 0.1, 0);
    this.playTone(600, 'triangle', 0.1, 0.1);
    this.playTone(800, 'triangle', 0.3, 0.2);
  }

  playReveal() {
    this.playTone(300, 'sine', 0.5);
  }

  playVote() {
    this.playTone(200, 'square', 0.1);
    this.playTone(150, 'square', 0.3, 0.1);
  }

  playWin() {
    this.playTone(523.25, 'sine', 0.1, 0);
    this.playTone(659.25, 'sine', 0.1, 0.1);
    this.playTone(783.99, 'sine', 0.1, 0.2);
    this.playTone(1046.50, 'sine', 0.4, 0.3);
  }

  playLoss() {
    this.playTone(440, 'sawtooth', 0.2, 0);
    this.playTone(415, 'sawtooth', 0.2, 0.2);
    this.playTone(392, 'sawtooth', 0.6, 0.4);
  }

  /**
   * Anuncia al jugador inicial usando Gemini TTS
   */
  async announceStartingPlayer(nombre: string) {
    this.stopActiveVoice();
    const prompt = `Di rápido: ¡Debate iniciado! Empieza ${nombre}.`;
    try {
      const resp = await fetch('/.netlify/functions/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'tts', texto: prompt }),
      });
      if (!resp.ok) {
        console.error('TTS server error', resp.status);
        return;
      }
      const data = await resp.json();
      const base64Audio = data.audio;
      if (!base64Audio) return;
      const ctx = this.initContext();
      const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
      const source = ctx.createBufferSource();
      const gainNode = ctx.createGain();
      gainNode.gain.value = 0.8;
      source.buffer = audioBuffer;
      source.connect(gainNode);
      gainNode.connect(ctx.destination);
      this.activeSource = source;
      source.start();
      return new Promise((resolve) => {
        source.onended = () => {
          if (this.activeSource === source) this.activeSource = null;
          resolve(true);
        };
      });
    } catch (error) {
      console.error('Error en Gemini TTS (proxy):', error);
    }
  }

  /**
   * Anuncia el resultado final con textos acortados y precisos.
   */
  async announceGameResult(esVictoria: boolean, nombresImpostores: string[]) {
    this.stopActiveVoice(); 
    let listaNombres = "";
    if (nombresImpostores.length === 1) {
      listaNombres = nombresImpostores[0];
    } else {
      const ultimo = nombresImpostores[nombresImpostores.length - 1];
      const resto = nombresImpostores.slice(0, -1).join(", ");
      listaNombres = `${resto} y ${ultimo}`;
    }

    const esPlural = nombresImpostores.length > 1;
    
    try {
      // Frases acortadas según lo solicitado
      const prompt = esVictoria 
        ? `Di rápido y directo: ¡Ganaron! Encontraron ${esPlural ? 'a los impostores que fueron' : 'al impostor que fue'} ${listaNombres}.`
        : `Di rápido y directo: ¡Ganaron los impostores! ${esPlural ? 'Los impostores eran' : 'El impostor era'} ${listaNombres}.`;
      const resp = await fetch('/.netlify/functions/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'tts', texto: prompt }),
      });
      if (!resp.ok) {
        console.error('TTS server error', resp.status);
        return;
      }
      const data = await resp.json();
      const base64Audio = data.audio;
      if (!base64Audio) return;
      const ctx = this.initContext();
      const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
      const source = ctx.createBufferSource();
      const gainNode = ctx.createGain();
      gainNode.gain.value = 0.9;
      source.buffer = audioBuffer;
      source.connect(gainNode);
      gainNode.connect(ctx.destination);
      this.activeSource = source;
      source.start();
      return new Promise((resolve) => {
        source.onended = () => {
          if (this.activeSource === source) this.activeSource = null;
          resolve(true);
        };
      });
    } catch (error) {
      console.error('Error en Gemini TTS (proxy):', error);
    }
  }
}

export const soundManager = new SoundManager();
