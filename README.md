<div align="center">
  <img width="314" height="681" alt="image" src="https://github.com/user-attachments/assets/1c91ea65-0926-47bf-b3e7-6a6c1abf6cc3" />
</div>

# El Impostor — Juego social con IA

El Impostor es una versión moderna y accesible del clásico juego de deducción social. Genera palabras secretas inteligentes con ayuda de Gemini (IA), ofrece votaciones, roles y anuncios por voz (TTS) para partidas rápidas y divertidas entre amigos.

**Valor para el usuario:** partida rápida sin preparación, palabras temáticas generadas por IA que evitan repeticiones, integración de TTS para accesibilidad y una interfaz cuidada para móviles y escritorio.

**Principales características**
- Generación de palabra secreta por IA según tema.
- Text-to-Speech (Gemini TTS) para anuncios y resultados.
- Personalización de jugadores, impostores y temas.
- Listo para desplegar en servicios estáticos (Netlify, Vercel, Cloudflare Pages).

## Cómo funciona (breve)
- El cliente solicita a la API de Gemini una palabra adecuada según el tema.
- La respuesta se valida y se muestra a los jugadores (o se usa en modo oculto).
- Al finalizar, Gemini TTS genera audio para anunciar el resultado.

## Ejecutar localmente

Recomendado: `pnpm` o `npm`. También funciona con `bun`.

1. Instala dependencias:

```bash
pnpm install
# o
npm install
```

2. Crea `.env.local` en la raíz con tu clave (no subirla a Git):

```
VITE_API_KEY=sk_TU_API_KEY_AQUI
```

También existe `.env.example` como referencia.

3. Levanta el servidor de desarrollo:

```bash
pnpm run dev
# o (si pnpm produce errores en tu entorno):
./node_modules/.bin/vite
# o con bun:
bun run dev
```

4. Abre la app en el navegador en `http://localhost:3000` (o el puerto que indique Vite).

## Build y despliegue

Build:

```bash
pnpm build
# o
npm run build
```

La carpeta de salida es `dist/`.

Deploy recomendado (Netlify / Vercel / Cloudflare Pages):

- Sube tu repo a GitHub.
- Conecta el repo desde Netlify/Vercel y configura:
  - Build command: `pnpm build` (o `npm run build`)
  - Publish directory: `dist`
  - Environment variable: `VITE_API_KEY` (si vas a usar la API desde el cliente). Idealmente usa un backend/serverless para no exponer la clave.

## Seguridad y buenas prácticas
- Nunca subas `.env.local` con claves. Usa `.env.example` para documentar variables.
- Para proteger tu API key, implementa un endpoint backend o funciones serverless que hagan las llamadas a Gemini usando `process.env.API_KEY`.

## Contribuir
- Fork, crea una rama, haz un PR. Para cambios grandes abre un issue primero.

---

¿Quieres que cree el archivo `.env.example` en el repo y haga un commit con este `README.md` actualizado? 
