
import { GoogleGenAI, Type } from "@google/genai";

const getApiKey = () => {
  // Vite exposes env variables on import.meta.env (prefixed with VITE_)
  // In Node (server) use process.env.API_KEY (or process.env.VITE_API_KEY)
  const viteKey = typeof import.meta !== "undefined" ? (import.meta as any).env?.VITE_API_KEY : undefined;
  const nodeKey = process.env.API_KEY || process.env.VITE_API_KEY;
  const key = viteKey || nodeKey || "";
  return key;
};

// Inicializar cliente
const getAiClient = () => {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn("API key no encontrada en import.meta.env.VITE_API_KEY ni en process.env.API_KEY");
    return null;
  }
  // show masked key location for debugging (do not log full key in public)
  try {
    const masked = apiKey.length > 8 ? apiKey.slice(0, 4) + '...' + apiKey.slice(-4) : apiKey;
    console.log('GoogleGenAI: usando API key (preview):', masked);
  } catch (e) {
    // ignore
  }
  return new GoogleGenAI({ apiKey });
};

export interface ValidacionIA {
  palabra: string;
  esValida: boolean;
  mensajeError?: string;
}

export const generarPalabraConIA = async (tema: string): Promise<ValidacionIA> => {
  const ai = getAiClient();
  
  if (!ai) {
    return { 
      palabra: "", 
      esValida: false, 
      mensajeError: "Configuración de API no encontrada." 
    }; 
  }

  try {
    const prompt = `Actúa como un experto diseñador de juegos de mesa. 
    Tu tarea es generar una palabra secreta para el juego "El Impostor" basada en el tema: "${tema}".
    
    REGLAS DE VALIDACIÓN:
    1. Debe ser un sustantivo común o nombre propio muy conocido.
    2. Debe ser fácil de describir con una palabra pero no obvia (ej: "Agua" para tema "Naturaleza" es buena, "H2O" es mala).
    3. No debe ser una frase, solo una palabra (o dos si es un nombre compuesto muy corto).
    4. Debe ser apta para todos los públicos a menos que el tema sea explícitamente sobre adultos.
    5. Si el tema es incoherente o inapropiado, marca esValida como false.`;

    console.log('generarPalabraConIA: enviando prompt para tema:', tema);
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            palabra: {
              type: Type.STRING,
              description: 'La palabra secreta generada.',
            },
            esValida: {
              type: Type.BOOLEAN,
              description: 'Si la palabra y el tema son aptos para el juego.',
            },
            mensajeError: {
              type: Type.STRING,
              description: 'Explicación de por qué no es válida (si aplica).',
            },
          },
          required: ["palabra", "esValida"],
        },
      },
    });

    console.log('generarPalabraConIA: respuesta cruda de IA:', response);
    console.log('generarPalabraConIA: response.text:', response.text);
    let result = {};
    try {
      result = JSON.parse(response.text || "{}");
    } catch (e) {
      console.error('Error parseando response.text como JSON:', e);
      // intentar extraer texto plano
      result = { palabra: response.text || "", esValida: false, mensajeError: 'Respuesta de IA no es JSON' };
    }
    
    return {
      palabra: result.palabra?.trim() || "",
      esValida: !!result.esValida,
      mensajeError: result.mensajeError || "El tema proporcionado no permite generar una palabra válida para el juego."
    };

  } catch (error) {
    console.error("Error generando palabra con IA:", error);
    return {
      palabra: "",
      esValida: false,
      mensajeError: "Error de conexión con el servicio de IA. Intenta con un tema más sencillo."
    };
  }
};
