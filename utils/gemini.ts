
// Client-side helper: proxy requests to the serverless function
// The serverless function (netlify/functions/gemini) keeps the API key on the server

export interface ValidacionIA {
  palabra: string;
  esValida: boolean;
  mensajeError?: string;
}

export const generarPalabraConIA = async (tema: string): Promise<ValidacionIA> => {
  try {
    const resp = await fetch('/.netlify/functions/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'generate', tema }),
    });
    if (!resp.ok) {
      const text = await resp.text();
      console.error('Error calling serverless generate:', resp.status, text);
      return { palabra: '', esValida: false, mensajeError: 'Error del servidor de IA.' };
    }
    const data = await resp.json();
    return {
      palabra: (data.palabra || '').trim(),
      esValida: !!data.esValida,
      mensajeError: data.mensajeError || '',
    };
  } catch (error) {
    console.error('Error generando palabra con IA:', error);
    return { palabra: '', esValida: false, mensajeError: 'Error de conexión con el servicio de IA.' };
  }
};
