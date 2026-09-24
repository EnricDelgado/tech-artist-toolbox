# 007 — Despliegue: GitHub + Vercel + Render + Neon

**Fecha:** 24/09/2026
**Asistente:** Claude Code (Opus 4.7)
**Contexto:** Con calc-core, backend, frontend y CI cerrados y verdes, esta sesión prepara la Opción B de `docs/despliegue.md`: repo público en GitHub (ya subido en `https://github.com/EnricDelgado/tech-artist-toolbox`) + Vercel para el frontend + Render para el backend (Docker) + Neon para Postgres. Todo free tier.
**Resultado:**
- `render.yaml` en la raíz del repo — Blueprint de Render que crea el servicio backend con la config correcta (Docker, healthcheck `/healthz`, env vars marcadas como `sync: false` para rellenar en el dashboard).
- `frontend/vercel.json` — install command que construye primero `calc-core` (`file:../calc-core`) y luego `frontend` con `npm ci`.
- Corrección en `app/main.py`: `allow_credentials=True → False` porque la API no usa cookies y la combinación `credentials + wildcard` está prohibida por la spec de CORS (los navegadores rechazan la respuesta). Sin esa corrección, el paso "empezar con `API_CORS_ORIGINS=*` y afinar después" de la guía sería tramposo.
- `docs/despliegue.md` §Opción B reescrito con los pasos exactos (Neon → Render → Vercel → cerrar el bucle CORS), una lista de "cosas que suelen fallar y cómo desatascarlas" y las gotchas específicas de Neon (`pgcrypto`, `sslmode=require`, cambio de scheme a `postgresql+psycopg://`).

## Decisiones de diseño

- **Render Blueprint (declarativo) en vez de "clicar en el wizard".**
  `render.yaml` versiona la config, facilita reproducirla y hace trivial
  documentar qué env vars son necesarias.
- **`sync: false` en `DATABASE_URL` y `API_CORS_ORIGINS`.** Son valores
  privados/dinámicos (Neon URL con contraseña, URL de Vercel que no
  existe hasta después). Se rellenan en el dashboard, no viven en el
  repo.
- **`frontend/vercel.json` con install command explícito.** Necesario
  porque `file:../calc-core` requiere que el `dist/` exista antes del
  `npm ci` del frontend. Con Root Directory=`frontend` en Vercel, el
  install command corre desde ahí; hace `cd ../calc-core && npm ci &&
  npm run build && cd ../frontend && npm ci`.
- **CORS con `allow_credentials=False`.** La API no autentica por
  cookies. Con `False`, `allow_origins=["*"]` funciona en navegadores
  (útil durante el bootstrap del deploy antes de tener la URL real del
  frontend). Se sigue recomendando afinar `API_CORS_ORIGINS` con la URL
  exacta del frontend después.
- **Alembic `gen_random_uuid()` requiere `pgcrypto`.** Neon suele
  tenerlo, pero puede fallar en free tier de primer arranque. Documento
  el `CREATE EXTENSION IF NOT EXISTS pgcrypto` como troubleshooting.

## Análisis crítico

**Bien.**

- Los ficheros de config son mínimos y declarativos. Cualquiera con
  acceso al repo puede reproducir el despliegue leyéndolos.
- La guía enumera errores reales (CORS wildcard con credentials, scheme
  psycopg2 vs psycopg3, sslmode faltante, pgcrypto). Son la lista de
  cosas con las que la IA (o cualquiera) tropieza en la primera vuelta.
- La corrección `allow_credentials=False` no rompe ningún test (18/18
  verdes tras el cambio). El backend no usa credentials en ningún flujo
  del MVP.

**Regular / a mejorar.**

- **`allow_origins=["*"]` como estado transitorio.** Se documenta como
  paso 3 y se cierra en paso 4, pero es fácil olvidar cerrarlo. Se
  podría automatizar con un endpoint que rechace peticiones si
  `API_CORS_ORIGINS=="*"`, pero es mejor mantenerlo simple y confiar en
  el propio README/guía.
- **Vercel + `output: "standalone"` en `next.config.mjs`.** Standalone
  está pensado para Docker; Vercel lo ignora sin problema, pero produce
  ficheros extra en el build que Vercel no usa. No se elimina para no
  romper el Dockerfile del compose local. Documentado como no-issue.
- **Render duerme en 15 min de inactividad (free tier).** El primer
  fetch tras un rato tarda ~30 s. Aceptable para demo; no aceptable
  para producción real. Documentado.

**Deuda técnica.**

- Ninguna nueva. La deuda arrastrada (`floor→round`, ejemplo ASTC_6×6
  en `definicion-inicial.md`) sigue viva.

**Commit:** `feat(deploy): config Render + Vercel y ajuste CORS`.
