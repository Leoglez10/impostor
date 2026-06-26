import { GoogleGenAI, Type, Modality } from "@google/genai";

export async function handler(event) {
  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const { action, tema, texto } = body;

    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'API_KEY not configured on server.' }),
      };
    }

    const ai = new GoogleGenAI({ apiKey });

    if (action === 'generate') {
      const prompt = `Actúa como un experto diseñador de juegos de mesa.\nTu tarea es generar una palabra secreta para el juego \"El Impostor\" basada en el tema: \"${tema}\".\nREGLAS DE VALIDACIÓN: 1. Debe ser un sustantivo común o nombre propio muy conocido. 2. Debe ser fácil de describir con una palabra pero no obvia. 3. No debe ser una frase, solo una palabra. 4. Debe ser apta para todos los públicos. 5. Si el tema es incoherente o inapropiado, marca esValida como false.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              palabra: { type: Type.STRING },
              esValida: { type: Type.BOOLEAN },
              mensajeError: { type: Type.STRING },
            },
            required: ['palabra', 'esValida'],
          },
        },
      });

      let result = {};
      try {
        result = JSON.parse(response.text || '{}');
      } catch (e) {
        result = { palabra: response.text || '', esValida: false, mensajeError: 'Respuesta de IA no es JSON' };
      }

      return { statusCode: 200, body: JSON.stringify(result) };
    }

    if (action === 'tts') {
      const prompt = texto || '';
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-tts',
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      return { statusCode: 200, body: JSON.stringify({ audio: base64Audio || null }) };
    }

    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid action' }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: String(err) }) };
  }
}
