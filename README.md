<div align="center">

<img width="260" src="https://github.com/user-attachments/assets/1c91ea65-0926-47bf-b3e7-6a6c1abf6cc3" alt="Pantalla de El Impostor" />

# El Impostor

Juego web de deducción social para compartir un solo dispositivo, con palabras temáticas, votaciones y generación opcional mediante Gemini.

[Probar la demo](https://impostor-el-juego.netlify.app/)

</div>

> La partida es local y por turnos. El repositorio no implementa salas, cuentas ni sincronización multijugador entre dispositivos.

## Qué permite hacer

- Configurar entre **3 y 16 jugadores** y hasta `jugadores - 2` impostores.
- Personalizar los nombres o usar identificadores automáticos.
- Elegir una palabra manual, aleatoria, por categoría o generada por Gemini.
- Revelar cada rol de forma individual mientras se pasa el dispositivo.
- Seleccionar al jugador que comienza el debate.
- Registrar votaciones e intentos hasta encontrar a todos los impostores o perder la ronda.
- Evitar las últimas 100 palabras utilizadas mediante un historial local.
- Escuchar anuncios con Gemini Text-to-Speech y, si falla, usar la voz disponible en el navegador.
- Cambiar tema, contraste, tamaño de texto, tipografía y animaciones.
- Activar una categoría para adultos mediante una confirmación en dos pasos.

## Cómo jugar

1. Define la cantidad de jugadores e impostores.
2. Decide si cada participante usará su nombre.
3. Elige cómo se obtendrá la palabra secreta:
   - **Manual:** una persona la escribe.
   - **Azar:** se toma del catálogo incorporado.
   - **Tema:** se toma de una categoría concreta.
   - **IA:** Gemini genera y valida una palabra a partir de un tema.
4. Pasa el dispositivo para que cada jugador consulte su rol y vuelva a ocultarlo.
5. Debate por turnos. Los ciudadanos describen la palabra sin decirla; los impostores intentan deducirla sin ser descubiertos.
6. Abre la votación y selecciona a la persona sospechosa.
7. Continúa mientras queden intentos e impostores por encontrar.

## Datos, red y privacidad

No hay autenticación ni base de datos. El estado de la partida permanece en memoria y se pierde al recargar la página.

El navegador conserva únicamente el historial de palabras recientes en `localStorage`, bajo la clave `el_impostor_historial_palabras`. Borrar los datos del sitio reinicia ese historial.

Las opciones manual, aleatoria y por categoría funcionan con datos incluidos en el frontend. La generación por IA y la voz de Gemini envían solicitudes a `/.netlify/functions/gemini`; la función serverless utiliza la variable privada `API_KEY` para comunicarse con Google. Si el TTS remoto falla, la aplicación intenta usar `speechSynthesis` del navegador.

## Desarrollo local

### Requisitos

- Node.js y npm. El repositorio no declara una versión de Node.
- Una cuenta de Netlify y una clave de Gemini solo para probar la función serverless completa.

### Instalación verificada

```bash
git clone https://github.com/Leoglez10/impostor.git
cd impostor
npm install --no-package-lock
npm run dev
```

Vite escucha en `http://localhost:3000` y en las interfaces de red disponibles.

> `npm run dev` sirve únicamente el frontend. El repositorio no incluye un script que emule localmente `netlify/functions`, por lo que la generación con IA no responde en un servidor Vite aislado y la voz remota utiliza su fallback del navegador.

### Configuración en Netlify

La función [`netlify/functions/gemini.mjs`](netlify/functions/gemini.mjs) requiere esta variable **en el entorno del servidor**:

| Variable | Obligatoria para IA/TTS | Uso |
|---|---:|---|
| `API_KEY` | Sí | Autentica las solicitudes del backend serverless a Gemini. |

No coloques la clave en una variable `VITE_*`: Vite expone esas variables al código enviado al navegador.

> ⚠️ `.env.example` todavía declara `VITE_API_KEY`, pero el código actual no lee esa variable. La fuente de verdad es `process.env.API_KEY` dentro de la función serverless.

### Scripts disponibles

| Comando | Función |
|---|---|
| `npm run dev` | Inicia el frontend con Vite en el puerto `3000`. |
| `npm run build` | Genera la aplicación estática en `dist/`. |
| `npm run preview` | Sirve localmente el contenido generado en `dist/`. |

El repositorio incluye `pnpm-lock.yaml`, pero su `pnpm-workspace.yaml` conserva valores de plantilla en `allowBuilds`. Con pnpm 11, la instalación verificada fue detenida por `ERR_PNPM_IGNORED_BUILDS`; por eso el camino anterior usa npm sin crear un segundo lockfile.

## Arquitectura

```text
index.tsx
└── App.tsx                         Estado y transiciones de la partida
    ├── components/                 Configuración, roles, debate y votación
    ├── constants.ts                Palabras, temas y límites del juego
    └── utils/
        ├── wordSelector.ts         Selección e historial local
        ├── gemini.ts               Cliente del endpoint serverless
        └── audio.ts                Sonidos, TTS remoto y fallback del navegador

netlify/functions/gemini.mjs        Proxy serverless hacia Gemini
```

`App.tsx` controla el recorrido inicio → revelación de roles → debate → votación → resultado. El frontend mantiene la partida; la función serverless solo genera palabras y audio.

## Stack verificado

- React 19
- TypeScript 5.8
- Vite 6
- Google Gen AI SDK
- Netlify Functions
- Lucide React
- Tailwind CSS cargado desde CDN
- Web Audio API, Web Speech API y `localStorage`

## Seguridad y límites conocidos

- La clave de Gemini permanece en el servidor siempre que se configure como `API_KEY` en Netlify.
- El handler versionado no implementa autenticación, validación de origen ni limitación de solicitudes. Protege la cuota de Gemini desde la plataforma o añade controles antes de exponer un despliegue público.
- No hay pruebas automatizadas, lint ni typecheck separados.
- No existen workflows de CI/CD ni un `netlify.toml` versionado.
- `index.html` referencia `/index.css`, pero ese archivo no existe; Vite conserva la referencia y muestra una advertencia durante el build.

## Verificación del build

La compilación de Vite fue comprobada con las dependencias instaladas mediante npm:

```bash
npm run build
```

El build genera `dist/index.html` y el bundle JavaScript de la aplicación. Esta verificación no ejecuta una llamada real a Gemini ni prueba el flujo interactivo en un navegador.

## Licencia

El repositorio no incluye actualmente una licencia pública. El código permanece sujeto a los derechos de su autor; abrir el repositorio no concede por sí solo permiso para copiarlo, modificarlo o redistribuirlo.
