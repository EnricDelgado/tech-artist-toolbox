# 005 — Frontend Next.js

**Fecha:** 24/09/2026
**Asistente:** Claude Code (Opus 4.7)
**Contexto:** Paso 6 del plan (`progreso-y-siguientes-pasos.md`). Frontend Next.js 15 con las cinco calculadoras del §4 de la definición, gráfica 1D en Shader Math, CRUD de perfiles y botón "Verificar con API" en cada calculadora para contrastar el cálculo cliente contra el backend.
**Resultado:** `frontend/` completo:
- `package.json` con Next 15, React 19, TS, Tailwind, Recharts. `@tech-artist-toolbox/calc-core` referenciado con `file:../calc-core` (sin necesidad de un monorepo real).
- App Router con 7 rutas: home + 5 calculadoras + perfiles.
- Cliente HTTP tipado (`lib/api.ts`) con `ApiError` estructurado.
- Componente `VerifyBanner` reutilizado por las 4 calculadoras que tienen endpoint equivalente.
- Dockerfile multistage con salida `standalone` de Next.
- Modo oscuro por defecto (Tailwind con `darkMode: "class"` y `<html class="dark">`).
- Typecheck limpio; `next build` genera las 8 rutas correctamente (todas estáticas).

## Prompt clave

> Vamos a implementar el frontend. Léete `../definicion-inicial.md` §4 y §7,
> y `frontend/README.md`. Next.js 15 con App Router, TS y Tailwind. Cada
> calculadora en su propia página bajo `/calculators/*`. Importa `calc-core`
> como paquete workspace (o local via `../calc-core`) para cálculo en cliente,
> con opción de "verificar contra API" que llama al backend. Modo oscuro por
> defecto. Reemplaza el Dockerfile placeholder por uno real.

## Decisiones de diseño relevantes

- **`file:../calc-core` en vez de workspace real.** Evita añadir pnpm/yarn
  workspaces al proyecto; npm resuelve la dependencia por la ruta y el
  `dist/` que produce `tsup` es lo que se consume. Es lo que ya recomendaba
  `definicion-inicial.md` §12.2 como decisión por defecto.
- **Cálculo cliente-first + botón de verificación.** Los inputs disparan el
  cálculo local (memo) con `calc-core`; el botón "Verificar con API" hace
  el mismo cálculo en el servidor y compara. Verde si coincide, ámbar si
  hay divergencia numérica (útil para depurar en dev), rojo si la API falla.
  Es la forma más honesta de mostrar la promesa de paridad cliente/servidor
  del §6 de la definición.
- **Shader Math con Recharts.** Barrido de 128 puntos en el rango relevante
  a cada función (para `smoothstep` se extiende 0.2 más allá de cada borde,
  para `remap` un 10% fuera de `[inMin, inMax]`). Snippet HLSL debajo del
  resultado. Sin animaciones ni interacciones sobre la gráfica, en línea con
  el riesgo 3 del §12.3 de la definición (evitar convertir el playground en
  un pozo de pulido visual).
- **Perfiles con export/import por navegador.** El export descarga el JSON
  del perfil directamente; el import parsea el fichero y hace un `POST` para
  crearlo. No hay endpoint separado en el backend porque el shape ya coincide.
- **Errores en un solo formato.** `ApiError.body.error` reproduce el shape
  del §4.7 (que ya devuelve el backend). El frontend renderiza `code`,
  `message` y `field` cuando los recibe, sin traducir a texto propio.

## Análisis crítico

**Bien.**

- **`next build` produce los 8 endpoints estáticos** (`○ (Static)`). No hay
  fetches del backend en tiempo de build; las páginas son islas cliente que
  hacen fetch al montar (perfiles) o al pulsar el botón (verificación).
  Buena separación: el frontend se puede desplegar en un CDN (Vercel) aunque
  el backend esté caído; los cálculos siguen funcionando en cliente.
- **La misma librería que valida los 27 casos de `shared-tests/cases.json`
  se ejecuta ahora en el navegador.** No hay copia de fórmulas ni una tercera
  implementación en JS suelto; el bundle importa el `dist/index.js` que
  produjo `tsup`.
- **Contraste visual entre paridad OK y divergencia.** El botón de verificar
  refuerza el mensaje del informe: la promesa de paridad no es una consigna,
  es algo que el usuario puede comprobar clic a clic.

**Regular / a mejorar.**

- **Sin tests propios de UI.** El frontend no tiene Vitest/RTL. Justificado
  por alcance del MVP y por presión de tiempo, pero deja el criterio 3 más
  débil que en calc-core/backend. En el informe conviene mencionar que la
  cobertura de correctitud vive en `calc-core` (49 tests) y en `backend`
  (18 tests, 27 casos de paridad), y que el frontend es una capa de
  presentación sobre esos módulos ya validados.
- **`recharts` v2 emite un warning de deprecation.** Es v2.15 y funciona,
  pero recomiendan v3. No se cambia para no arrastrar cambios de API en
  la última milla. Anotado.
- **`next.config.mjs` usa `experimental.externalDir`.** Necesario para que
  el resolver acepte `file:../calc-core`. Marca "experimental" que podría
  moverse en una release menor; documentado aquí para no verse sorprendido.
- **Dockerfile multistage copia `calc-core` y `frontend` desde el contexto
  raíz**, no desde `frontend/`. Esto significa que `docker compose build
  frontend` debe hacerse con contexto en el raíz — hay que ajustar
  `docker-compose.yml` en el Paso 7 (context: `.`, dockerfile:
  `frontend/Dockerfile`).

**Deuda técnica pendiente (arrastrada + nueva).**

- Ajustar `docker-compose.yml` frontend service: `context: .` en vez de
  `./frontend`, para que el multistage vea `calc-core/`.
- Corregir el ejemplo ASTC_6×6 de `definicion-inicial.md` §9.
- Añadir caso de `cases.json` donde `floor` y `round` del factor 4/3 en
  mipmaps difieran.
- Preparar despliegue y CI (Paso 7).

**Commit:** `feat(frontend): Next.js con calculadoras y verify contra API`.
