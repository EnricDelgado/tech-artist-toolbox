# Tech Artist Toolbox — Informe técnico

**Actividad 1 · Desarrollo de aplicaciones con asistentes de programación basados en IA**
**Autor:** Enric Delgado Claramunt
**Asistente principal:** Claude Code (Anthropic) — modelos Claude Sonnet 5 y Claude Opus 4.7
**Fecha del informe:** 24/09/2026
**Repositorio:** <https://github.com/EnricDelgado/tech-artist-toolbox>
**App desplegada:** <https://tech-artist-toolbox.vercel.app>
**API:** <https://tech-artist-toolbox-backend.onrender.com> · Swagger UI en `/docs`
**Documento origen:** `psuiadesoft02_act1.docx`

---

## 1. Resumen ejecutivo

**Tech Artist Toolbox** es una aplicación web que ofrece cinco calculadoras
técnicas usadas a diario por Technical Artists (memoria de textura, comparador
de compresión, texel density, playground de shader math y utilidades de
color), más una API REST pública que expone los mismos cálculos y un CRUD de
perfiles de proyecto persistido en PostgreSQL.

El desarrollo se ha hecho **íntegramente** mediante interacción con un
asistente de IA (Claude Code), en cumplimiento del enunciado. No se ha
escrito una sola línea de código a mano en `calc-core/`, `backend/` ni
`frontend/`; cada cambio se produjo mediante un prompt registrado en la
carpeta `prompts/`.

El resultado es un MVP funcional y verificable, con 67 tests automatizados
que garantizan **paridad numérica cliente/servidor** contra un JSON de
referencia con casos citados a especificaciones oficiales (Khronos ASTC,
Microsoft DXGI BC7, IEC 61966-2-1 sRGB).

## 2. Descripción del proyecto

### 2.1 Público objetivo y problema

Technical Artists, artistas 3D con perfil técnico y programadores gráficos.
Las tareas técnicas menores del día a día (estimar memoria de una textura,
comparar formatos de compresión, calcular texel density, convertir
correctamente entre linear y sRGB) se resuelven habitualmente con una
mezcla de hojas de cálculo, calculadoras online sin fórmula visible y
respuestas de foros. Tres costes conocidos:

- Tiempo perdido cambiando de contexto.
- Errores silenciosos por fórmulas mal aplicadas.
- Imposibilidad de automatizar decisiones repetibles desde scripts o CI.

### 2.2 Propuesta de valor

Un único punto de entrada, con la fórmula a la vista, resultados
verificables y una API REST que permite integrar los mismos cálculos en
flujos automatizados (scripts de Unity, procesos de CI, tooling interno).

### 2.3 Alcance del MVP entregado

- 5 calculadoras: Texture Memory, Compression Comparator, Texel Density,
  Shader Math Playground (`lerp`, `remap`, `smoothstep`), Color utilities
  (RGB/HEX/HSL + linear/sRGB con curva IEC 61966-2-1).
- Perfiles de proyecto: crear, listar, editar, borrar, exportar/importar
  JSON.
- API REST v1 con `/api/v1/*` y OpenAPI autogenerado en `/docs`.
- Modo oscuro por defecto y accesibilidad básica.
- Sin autenticación (limitación conocida, documentada).

Fuera de alcance: cuentas de usuario, UV Playground visual, tooling de
normal maps, atlas calculator, integraciones con Unity/Unreal.

## 3. Requisitos iniciales

Ver el documento `definicion-inicial.md` para el detalle completo. En
resumen:

| Requisito | Cubierto por |
|-----------|--------------|
| Aplicación web funcional | Frontend Next.js + backend FastAPI |
| Descripción funcional y requisitos mínimos (criterio 1) | `definicion-inicial.md` (documento aceptado antes de escribir código) |
| Todo el código generado por IA (restricción del enunciado) | `prompts/000` a `prompts/005` |
| Corrección numérica verificable | 27 casos en `shared-tests/cases.json` con `source` oficial |
| Paridad cliente/servidor | Test de paridad en `backend/tests/test_calc_parity.py` |
| Rendimiento (< 50 ms en API, < 16 ms en cliente) | Cálculos O(1); Next build produce rutas estáticas |
| `docker-compose up` desde cero | Postgres + backend + frontend en un solo comando |
| Documentación de la API | OpenAPI en `/docs` (Swagger UI) |

## 4. Arquitectura

```
┌───────────────────────────────────────────────┐
│                Frontend (Next.js)             │
│  React + TypeScript + Tailwind + Recharts     │
└──────────┬────────────────────────────┬───────┘
           │ import                     │ fetch (verify)
           ▼                            ▼
    ┌──────────────┐         ┌────────────────────┐
    │  calc-core   │────────▶│  Backend (FastAPI) │
    │  (TS lib)    │  paridad│  Python + Pydantic │
    └──────────────┘   tests └─────────┬──────────┘
                                       │
                                       ▼
                              ┌──────────────────┐
                              │   PostgreSQL 16  │
                              │  (perfiles)      │
                              └──────────────────┘
```

- **`calc-core`** es la única fuente de verdad para las fórmulas del
  navegador. Se publica como paquete local (`file:../calc-core`) consumido
  por el frontend; produce un bundle ESM + tipos con `tsup`.
- **Backend Python** implementa el port 1:1 de esas fórmulas (`app/calc/*`)
  y expone la API v1. La correspondencia se verifica automáticamente en CI.
- **`shared-tests/cases.json`** contiene 27 casos de referencia con
  `source` citando la especificación oficial correspondiente. Es el único
  árbitro válido de "qué es correcto"; ambas implementaciones se validan
  contra él.
- **PostgreSQL** solo persiste la tabla `projects` (JSONB para `config`).
- **Alembic** gestiona la migración inicial; se aplica al arrancar el
  contenedor del backend (`alembic upgrade head && uvicorn ...`).

## 5. Estructura del repositorio

```
tech-artist-toolbox/
├── calc-core/           TypeScript, tsup, Vitest — 49 tests
├── backend/             FastAPI + Pydantic + SQLAlchemy + Alembic — 18 tests
├── frontend/            Next.js 15 App Router — 5 calculadoras + perfiles
├── shared-tests/        cases.json (27 casos con source oficial)
├── prompts/             registro cronológico de las conversaciones con la IA
├── docs/                arquitectura, despliegue, este informe
├── .github/workflows/   CI (calc-core, backend, frontend)
├── docker-compose.yml
└── README.md
```

## 6. Metodología: cómo se ha desarrollado con IA

### 6.1 Ciclo por hito

1. **Definir el objetivo** en el propio documento de planificación
   (`progreso-y-siguientes-pasos.md`).
2. **Formular un prompt claro y estructurado** con: lecturas previas
   obligatorias, criterio de "hecho" y formato del registro esperado.
3. **Ejecutar la sesión** con Claude Code, aceptando o revisando cada
   cambio.
4. **Registrar la conversación** en `prompts/NNN-<tema>.md`: prompt clave,
   decisiones de diseño, análisis crítico (qué salió bien, qué falló, qué
   se corrigió).
5. **Un commit por hito** con mensaje `feat(módulo): <qué>` o `docs: ...`.
6. **Actualizar el documento de progreso** marcando el paso cerrado.

### 6.2 Reglas mantenidas durante todo el proyecto

- Cero código a mano. Todo cambio pasa por el asistente.
- Un prompt por objetivo. Nada de "hazlo todo".
- Tests antes de dar por bueno cualquier módulo con corrección numérica.
- Documentar los errores de la IA es tan importante como documentar los
  aciertos (criterio 4 de la rúbrica).

### 6.3 Índice de conversaciones registradas

| # | Fichero | Tema | Modelos |
|---|---------|------|---------|
| 000 | `prompts/000-definicion-inicial.md` | Elección de idea y definición funcional | Sonnet 5 |
| 001 | `prompts/000-definicion-inicial.md` | Scaffold del repo y docker-compose | Sonnet 5 |
| 002 | `prompts/002-shared-tests.md` | Casos de referencia (`cases.json`) | Sonnet 5 |
| 003 | `prompts/003-calc-core.md` | Implementación de `calc-core` (TypeScript) | Sonnet 5 → Opus 4.7 |
| 004 | `prompts/004-backend.md` | Backend FastAPI + Alembic | Opus 4.7 |
| 005 | `prompts/005-frontend.md` | Frontend Next.js + verify contra API | Opus 4.7 |

### 6.4 Historial de commits

```
fe9e36e docs: guía de despliegue y actualización del estado
8eb080d feat(frontend): Next.js con calculadoras y verify contra API
d22f966 feat(backend): FastAPI v1 con paridad y Alembic
b5a657f feat(calc-core): fórmulas y tests iniciales
ef17c82 feat(shared-tests): casos de referencia iniciales
c3835d0 chore: scaffold inicial del repo (docker-compose, estructura, prompts)
```

## 7. Interacción con el asistente: análisis crítico

### 7.1 Ejemplos de prompts eficaces

**Prompt de `shared-tests/cases.json` (sesión 002):**

> Vamos a crear `shared-tests/cases.json`. Es el JSON de casos de referencia
> que consumirán tanto los tests de `calc-core` (TS) como los del backend
> (Python). Léete `../definicion-inicial.md` §4 (secciones 4.1–4.5) y
> `shared-tests/README.md` antes de empezar. Genera un JSON con las cinco
> secciones (…), mínimo 3 casos por sección, cada caso con `id`, `input`,
> `expected` y `source` citando la referencia oficial. Incluye casos de
> borde: ASTC con padding a bloque, sRGB en el umbral 0.0031308, mipmaps
> activos. No implementes ninguna función todavía — solo el JSON.

Este prompt funciona porque: (a) fija el objetivo en una entrega concreta,
(b) obliga a lecturas previas específicas, (c) da un shape del resultado,
(d) exige `source` con referencia oficial (evita valores plausibles pero
inventados), (e) enumera los casos de borde que hay que cubrir, (f)
delimita explícitamente lo que **no** se hace en esta sesión.

**Prompt de `calc-core` (sesión 003):** añade a lo anterior "Muestra la
fórmula usada en el JSDoc de cada función" — un requisito de trazabilidad
que se convierte en documentación viva.

### 7.2 Errores detectados en la IA (y correcciones)

**a) Un ejemplo del propio `definicion-inicial.md` es matemáticamente
   incorrecto.**

En §9 de la definición se dio como ejemplo del contrato de API:
`ASTC_6x6 sobre 2048×2048 con mipmaps y count=4 → perTextureBytes:
3355443`. Al recalcular con la fórmula del spec Khronos citada en el
propio §4.1 (16 bytes por bloque de 6×6 texels), el valor correcto es
1 871 424 bytes por textura sin mipmaps. El ejemplo del documento implica
una tasa de ~0,8 B/px, cuando ASTC 6×6 real es 16/36 ≈ 0,444 B/px.

Es decir, la IA generó un ejemplo "plausible" en la primera sesión (al
escribir la definición) que solo se detectó al escribir el JSON de casos
en la sesión 002. La detección se documentó en `prompts/002-shared-tests.md`
y la fórmula real es la que quedó en el JSON, en el backend y en el
cliente. **El caso demuestra exactamente el riesgo 1 anticipado en
`definicion-inicial.md` §12.3 ("La IA puede generar cálculos plausibles
pero incorrectos")** y valida la mitigación elegida (tests con valores de
referencia oficiales antes de dar cada módulo por hecho).

**b) La mutación `floor→round` en la fórmula de mipmaps no rompe ningún
   test compartido.**

Al implementar `calc-core` se probó cambiar `Math.floor(x·4/3)` por
`Math.round(x·4/3)` para verificar que los tests detectaban la
diferencia. No la detectaron: el único caso de `cases.json` con resto no
entero (262 144 · 4/3 = 349 525.33) da 349 525 con ambas políticas de
redondeo. **La cobertura de `shared-tests/cases.json` tiene un hueco
identificado**, que se ha documentado como deuda para añadir un caso con
resultado en `.5` o superior. Este hallazgo aparece en
`prompts/003-calc-core.md` y en el commit correspondiente.

**c) Python 3.13 en el host de desarrollo, target Docker 3.12.**

En la sesión del backend no había `python3.12` en la máquina local, por
lo que los tests locales corrieron con 3.13. Los tests pasaron igual y
el Docker está fijado a 3.12; el CI también fija 3.12, así que la
divergencia solo afecta al ciclo interactivo.

**d) `experimental.externalDir` en `next.config.mjs`.**

Necesario para que el resolver de Next 15 acepte
`file:../calc-core`. Marca "experimental" que podría moverse en una
release menor; documentado en `prompts/005-frontend.md`.

### 7.3 Iteraciones significativas

- **Sesión 002 → 003**: la elección de "tests-first" en `calc-core` (leer
  el JSON compartido, escribir los tests que consumen ese JSON, y solo
  entonces implementar los módulos) se decidió durante la sesión 003.
  Sin ese orden, la sesión no habría descubierto el error del ejemplo
  ASTC_6×6.
- **Sesión 004**: se decidió tener una **BD perezosa** en el backend
  (`app/db.py` no toca Postgres si `DATABASE_URL` está vacío). Esto
  permite correr los tests de la API sin necesidad de Postgres arriba y
  facilita el CI. Fue una decisión reactiva tras ver que el CI iba a
  complicarse innecesariamente con un servicio de Postgres.
- **Sesión 005**: el botón "Verificar con API" en cada calculadora es una
  forma **visualmente honesta** de exponer la promesa de paridad. En vez
  de decir en el informe "cliente y servidor coinciden", el usuario lo ve
  en verde cuando coincide.

## 8. Corrección numérica: `shared-tests/cases.json`

Se genera **una sola vez**, se cita al lado de cada valor esperado la
especificación oficial y se consume desde ambos lados:

- `calc-core/tests/*.test.ts` con Vitest (49 tests).
- `backend/tests/test_calc_parity.py` con pytest (5 tests, uno por
  sección, cada uno itera sobre sus casos).

Total: 27 casos × 2 entornos = 54 puntos de verificación. Cualquier
divergencia futura se manifiesta como test rojo en uno de los dos lados.

Referencias citadas:

- **ASTC** → Khronos Group ASTC Specification.
- **BC7** → Microsoft DXGI BC7 Format documentation.
- **sRGB** → IEC 61966-2-1 (umbral 0.0031308 / 0.04045).
- **Mipmaps (factor ≈ 4/3)** → Real-Time Rendering.

## 9. API REST

Endpoints v1 disponibles en `http://localhost:8000/api/v1/`:

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/texture/memory` | Texture Memory Calculator |
| POST | `/texture/compare` | Compression Comparator |
| POST | `/uv/texel-density` | Texel Density |
| POST | `/shader/math` | Playground (`function`: `lerp`/`remap`/`smoothstep`) |
| GET | `/projects` | Lista de perfiles |
| POST | `/projects` | Crear perfil |
| GET | `/projects/{id}` | Leer perfil |
| PATCH | `/projects/{id}` | Actualizar perfil |
| DELETE | `/projects/{id}` | Borrar perfil |
| GET | `/projects/{id}/export` | Exportar JSON (alias documental) |
| POST | `/projects/import` | Importar JSON |

Formato de error uniforme (§4.7 de la definición):

```json
{
  "error": {
    "code": "INVALID_INPUT",
    "message": "width must be a positive integer",
    "field": "width"
  }
}
```

`InvalidInputError` y `RequestValidationError` de Pydantic se traducen
ambos a este mismo shape, para que el cliente vea siempre la misma forma.

Rate limiting con slowapi (60/min por IP, configurable con
`API_RATE_LIMIT_PER_MINUTE`). CORS restringido a
`API_CORS_ORIGINS`.

## 10. Frontend

Next.js 15 con App Router, React 19, TypeScript y Tailwind. Recharts para
la gráfica 1D del Shader Math Playground. Modo oscuro por defecto.

Cada calculadora hace el cálculo en cliente con `calc-core` mediante un
`useMemo` sobre los inputs (respuesta instantánea). Un botón "Verificar
con API" envía el mismo payload al backend y contrasta:

- **Verde:** cliente y API coinciden numéricamente.
- **Ámbar:** divergencia detectada (útil en desarrollo).
- **Rojo:** la API ha fallado (mensaje del `code` + `field` del §4.7).

Los perfiles se exportan e importan como JSON directamente desde el
navegador (Blob + `<a download>`).

## 11. Requisitos no funcionales

- **Corrección numérica.** 27 casos con `source` oficial validados en
  cliente y servidor.
- **Paridad cliente/servidor.** Verificable clic a clic desde la UI y
  automatizable en CI.
- **Rendimiento.** Cálculos O(1); Next build produce rutas estáticas
  (`○ (Static)`). No hay operaciones bloqueantes en los endpoints de
  cálculo.
- **Accesibilidad básica.** Labels asociados a inputs, contraste alto en
  modo oscuro por defecto.
- **Reproducibilidad.** `docker compose up` desde cero funciona (frontend
  con multistage, backend con Dockerfile 3.12-slim, Postgres 16-alpine).

## 12. Instrucciones para el evaluador

### 12.1 En local (sin cuentas de terceros)

Requisitos: Docker y Docker Compose.

```bash
cp .env.example .env             # opcional
docker compose up                # arranca db + backend + frontend
```

- Frontend: <http://localhost:3000>
- Backend: <http://localhost:8000>
- OpenAPI: <http://localhost:8000/docs>

### 12.2 Tests

```bash
# calc-core (49 tests)
cd calc-core && npm install && npm test

# backend (18 tests, no necesita Postgres)
cd backend && python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements-dev.txt && pytest

# frontend build + typecheck
cd frontend && npm install && npm run build
```

### 12.3 Despliegue en la nube

Ver `docs/despliegue.md` para las tres alternativas (mínima con Docker,
recomendada con GitHub + Vercel + Render + Neon, o todo en Fly.io).

## 13. Limitaciones conocidas

- **Sin autenticación en el MVP.** Los perfiles son públicos por ID; se
  documenta como decisión consciente para reducir superficie de errores
  típicos de la IA en flujos de auth.
- **`docs`, `redoc` y OpenAPI son endpoints públicos.** Aceptable para
  MVP, no para producción real.
- **Sin tests unitarios de UI en el frontend.** La cobertura de
  correctitud vive en `calc-core` (49 tests) y en el backend (18
  tests). El frontend es una capa de presentación sobre módulos ya
  validados.
- **Hueco de cobertura en el mipmap rounding.** La mutación `floor→round`
  no rompe ningún test; documentado como deuda.
- **Recharts v2 emite un warning de deprecation.** No se migra a v3 para
  no arrastrar cambios de API en la última milla.
- **BD opcional al arrancar.** Sin `DATABASE_URL`, el backend responde
  503 en `/projects` en vez de crashear. Es útil para dev/tests, pero
  hay que asegurarse de configurar la variable en producción.

## 14. Trabajo futuro

- Rellenar el hueco del mipmap rounding y añadir el caso a
  `shared-tests/cases.json`.
- Corregir el ejemplo ASTC_6×6 en `definicion-inicial.md` §9.
- Añadir tests unitarios de UI con Vitest + Testing Library.
- Auth ligera (API keys o magic link) para poder abrir la API sin
  publicar los perfiles.
- Migrar Recharts v2 → v3.
- Añadir más calculadoras del backlog (UV Playground visual, normal maps,
  atlas calculator).

## 15. Conclusiones

**Sobre la calidad de la IA como asistente de desarrollo:**

- Cuando se le da un objetivo bien definido, con referencias específicas
  y criterios de "hecho", produce código correcto y probado a la primera
  con notable fiabilidad (calc-core: 49/49 verde en el primer intento;
  backend: 18/18 verde en el primer intento).
- Cuando se le pide un "ejemplo ilustrativo" sin obligación de citar la
  fuente, produce valores plausibles pero incorrectos (caso ASTC_6×6).
- **La técnica que mejor funcionó** fue: fijar el resultado esperado
  antes que la implementación, con `source` obligatorio a la
  documentación oficial, y consumir ese resultado desde ambos lados
  (cliente + servidor).
- **El límite que mejor se detectó** fue: los tests validan lo que
  esperas ver, no la forma de calcularlo. La mutación `floor→round` no
  se detecta porque el JSON no incluye un caso que discrimine entre
  ambas políticas. Testear "el resultado" no es lo mismo que testear
  "el algoritmo".

**Sobre el proceso:**

- Un prompt por objetivo, registro cronológico y un commit por hito dan
  al final una narrativa clara, útil tanto para el informe como para
  cualquier revisión futura.
- Documentar los errores de la IA es tan valioso como documentar los
  aciertos, y cuenta directamente hacia el criterio 4 de la rúbrica.
- El repositorio final tiene 6 commits, 6 prompts registrados, 67 tests
  automatizados y una guía de despliegue explícita. No queda nada
  "obvio pero no dicho" — todo lo que hay se puede reproducir.
