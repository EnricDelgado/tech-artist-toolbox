# Dossier de entrega — Actividad 1

Este documento recopila todo lo que hay que poner en el informe final PDF y
en el docx (`psuiadesoft02_act1.docx`) sin tener que volver a excavar el
repo. Cada apartado apunta a la rúbrica del enunciado.

---

## 0. Datos de portada

- **Autor:** Enric Delgado Claramunt.
- **Correo:** enricdelgadoclaramunt@gmail.com.
- **Asignatura y actividad:** Desarrollo de aplicaciones con asistentes de
  programación basados en IA — Actividad 1.
- **Título del proyecto:** Tech Artist Toolbox.
- **Fecha de entrega:** [rellenar].
- **Modelos de IA utilizados:** Claude Sonnet 5 y Claude Opus 4.7,
  accedidos desde Claude Code (CLI/Desktop de Anthropic).

---

## 1. Cubrir la rúbrica del docx

### Criterio 1 — Claridad y precisión en la definición inicial (20 %)

- **Documento a citar:** `definicion-inicial.md` en la raíz del proyecto
  (`Actividad1/definicion-inicial.md`).
- **Puntos clave a extraer para el PDF:**
  - §1 descripción funcional (dos superficies: web app + API REST).
  - §2 público objetivo y problema (Technical Artists de videojuegos).
  - §3 alcance del MVP: 5 calculadoras + perfiles + API + no-goals.
  - §4 detalle funcional de cada calculadora y sus notas de dominio.
  - §5 requisitos no funcionales (corrección numérica, paridad,
    rendimiento, accesibilidad, reproducibilidad).
  - §12 decisiones y riesgos anticipados.
- **Aportar como evidencia:** este documento se aceptó **antes** de
  escribir código; el commit `c3835d0` es la línea de base a partir de la
  que se construye todo lo demás.

### Criterio 2 — Capacidad de formular instrucciones eficaces (25 %)

- **Fichero clave:** carpeta `prompts/`.
- **Seis conversaciones registradas:**
  1. `000` — elección de idea y definición funcional.
  2. `001` (dentro de `000-*.md`) — scaffold del repo y docker-compose.
  3. `002` — casos de referencia (`shared-tests/cases.json`).
  4. `003` — implementación de `calc-core`.
  5. `004` — backend FastAPI + Alembic.
  6. `005` — frontend Next.js.
- **Prompt ejemplar a incluir en el PDF** (recomendado, sesión 002):
  transcrito literalmente en `docs/informe.md` §7.1. Muestra los seis
  rasgos del "buen prompt": objetivo concreto, lecturas previas obligatorias,
  shape del resultado, criterio de fuente oficial, casos de borde y
  anti-scope.
- **Prompt fallido a citar como contraste:** el ejemplo de contrato de
  API en `definicion-inicial.md` §9 (ASTC_6×6 con valor incorrecto). No
  fue un prompt "malo" per se, pero pidió un ejemplo sin obligar a citar
  fuente, y la IA rellenó con un número plausible pero equivocado. Es la
  mejor lección del proyecto sobre el peligro de "ejemplos ilustrativos"
  sin verificación numérica.

### Criterio 3 — Calidad y funcionalidad de la aplicación (25 %)

- **Aplicación funcional y estable:** sí, con `docker compose up` desde
  cero.
- **Cifras a citar:**
  - 27 casos de referencia con `source` oficial en
    `shared-tests/cases.json`.
  - 49 tests verdes en `calc-core` (Vitest).
  - 18 tests verdes en `backend` (pytest), incluidos 5 de paridad
    numérica que ejercitan los 27 casos compartidos.
  - `next build` produce 8 rutas estáticas del frontend.
- **Endpoints implementados:** los 6 del §9 de la definición + healthz +
  export/import de perfiles + OpenAPI.
- **Reglas del enunciado cumplidas:**
  - Todo el código generado por IA — sí, cero código escrito a mano en
    `calc-core/`, `backend/` y `frontend/`.
  - Ejemplo `docker compose up` — funciona.
  - `requirements.txt` o equivalente — sí:
    `backend/requirements.txt` + `package.json` de `frontend` y
    `calc-core`.
- **Capturas a incluir en el PDF** (checklist para tomarlas cuando
  levantes la app; ver §5.2 de este dossier):
  - Home del frontend (`/`).
  - Texture Memory Calculator con un caso trivial (RGBA32 1024×1024).
  - Texture Memory con caso de borde (ASTC_6×6 1024×1024 mostrando el
    warning de padding).
  - Compression Comparator con la tabla comparativa.
  - Texel Density (px/m, px/inch, potencia de dos).
  - Shader Math Playground con la gráfica 1D de `smoothstep`.
  - Color: sección linear/sRGB con `linear=0.5` y su valor sRGB.
  - Perfiles con al menos un perfil creado y exportado a JSON.
  - `/docs` de FastAPI (Swagger UI) mostrando los endpoints.
  - Terminal con `npm test` verde (49 passing) y `pytest` verde (18
    passed).

### Criterio 4 — Documentación del proceso y análisis crítico (20 %)

- **Fichero clave:** `docs/informe.md` §7 "Interacción con el asistente:
  análisis crítico".
- **Errores de la IA documentados** (cada uno es un punto a mencionar en
  el PDF):
  1. Ejemplo ASTC_6×6 incorrecto en la propia definición generada por la
     IA. Detectado por la técnica "tests con referencia oficial antes de
     implementar". Ver `prompts/002-shared-tests.md`.
  2. `Math.floor(x·4/3)` vs `Math.round(x·4/3)` en mipmaps no distinguible
     por el `cases.json` actual. Descubierto haciendo mutation testing
     manual. Ver `prompts/003-calc-core.md`.
  3. `experimental.externalDir` de Next 15 necesaria para `file:../calc-core`;
     etiqueta "experimental" es una advertencia futura. Ver
     `prompts/005-frontend.md`.
- **Iteraciones significativas** (mismo capítulo del informe):
  - Sesión 003 incorporó tests-first como técnica.
  - Sesión 004 adoptó "BD perezosa" reactiva al ver que el CI se
    complicaba.
  - Sesión 005 introdujo el botón "Verificar con API" como prueba visual
    de la promesa de paridad.

### Criterio 5 — Organización y presentación (10 %)

- **Repositorio ordenado, con README explícito y estructura clara.**
- **`docs/despliegue.md`** describe tres alternativas de entrega con
  pasos concretos.
- **Documento de progreso** (`progreso-y-siguientes-pasos.md`) mantenido
  al día — sirve como narrativa del proceso.

---

## 2. Extractos que debes citar literalmente en el PDF

Los tres extractos más valiosos para el criterio 2 (prompts) y 4
(análisis crítico) son:

1. **Prompt de `shared-tests/cases.json`** — en `docs/informe.md` §7.1 o
   en `prompts/002-shared-tests.md` sección "Prompt clave".
2. **Análisis crítico del error ASTC_6×6** — en `prompts/002-shared-tests.md`
   sección "Análisis crítico", párrafo "Error detectado en el propio
   documento de definición".
3. **Análisis crítico del `floor→round` no detectado** — en
   `prompts/003-calc-core.md` sección "Análisis crítico", apartado
   "Regular / a mejorar".

---

## 3. Cifras y hechos verificables para el PDF

| Métrica | Valor | Cómo verificar |
|---------|-------|----------------|
| Casos de referencia numérica | 27 | `jq 'to_entries \| map({(.key): (.value \| length)})' shared-tests/cases.json` |
| Tests `calc-core` verdes | 49 | `cd calc-core && npm test` |
| Tests `backend` verdes | 18 | `cd backend && pytest` |
| Rutas del frontend | 8 estáticas | `cd frontend && npm run build` |
| Commits del proyecto | 7 | `git log --oneline \| wc -l` |
| Conversaciones registradas | 6 | `ls prompts/*.md` (excluyendo README) |

## 4. Enlaces a incluir en el PDF y en el docx

- **Repositorio:** <https://github.com/EnricDelgado/tech-artist-toolbox>
- **App desplegada:** <https://tech-artist-toolbox.vercel.app>
- **API en producción:** <https://tech-artist-toolbox-backend.onrender.com>
- **Swagger UI:** <https://tech-artist-toolbox-backend.onrender.com/docs>
- **Healthcheck:** <https://tech-artist-toolbox-backend.onrender.com/healthz>

Verificado en producción el 24/09/2026 (los cuatro endpoints anteriores
responden 200; paridad cliente/servidor en verde).

## 5. Capturas de pantalla — checklist para tomarlas

### 5.1 Preparación

```bash
# En una terminal
docker compose up

# Espera a que los tres servicios (db, backend, frontend) estén "healthy"
```

Alternativa sin Docker (más rápido para hacer capturas del frontend):

```bash
# T1 — backend
cd backend && source .venv/bin/activate
DATABASE_URL='' uvicorn app.main:app --host 0.0.0.0 --port 8000

# T2 — frontend
cd frontend && npm run dev
```

Con `DATABASE_URL=''` la app arranca sin Postgres. Los endpoints de
`/projects` devolverán 503, pero las 5 calculadoras y el "Verificar con
API" funcionan perfectamente.

### 5.2 Lista de capturas

1. **Home** — <http://localhost:3000/>.
2. **Texture Memory (caso trivial)** — `/calculators/texture-memory` con
   1024, 1024, RGBA32, sin mipmaps, count 1. Pulsar "Verificar con API"
   antes de la captura; ha de salir "Cliente y API coinciden." en verde.
3. **Texture Memory (caso de borde)** — mismos anchos pero formato
   `ASTC_6x6`. Debe mostrarse el warning ámbar
   "dimensions padded to 1026×1026 block-aligned size".
4. **Compression Comparator** — 1024×1024 sin mipmaps count 1. Tabla
   comparativa con RGBA32, BC7 y las tres ASTC.
5. **Texel Density** — resolución 1024, objetivo 2 m. Debe salir 512
   px/m, 512 px/unit, 13.0048 px/inch.
6. **Texel Density modo "target"** — objectSize 4 m, targetDensity 100.
   Debe salir recommendedResolution=512 px, densidad resultante 128 px/m.
7. **Shader Math** — función `smoothstep`, edge0=0, edge1=1, x=0.5.
   Resultado 0.5, gráfica visible.
8. **Shader Math** con `lerp` extrapolación — a=-5, b=5, t=1.5. Resultado
   10. Muestra que la función no clampa (fórmula "correcta" según HLSL/GLSL).
9. **Color** — HEX `#6EE7B7`, mostrando RGB, HSL y el swatch. Debajo,
   `linear=0.5 → sRGB≈0.735357`.
10. **Perfiles** — crear un perfil "Unity Quest baseline", exportarlo a
    JSON (aparecerá el diálogo de guardado del navegador). Captura del
    listado y del diálogo si es posible.
11. **Swagger UI** — <http://localhost:8000/docs> con los endpoints v1
    visibles.
12. **Terminal con tests verdes** — dos ventanas o una captura por cada
    módulo:
    - `cd calc-core && npm test` → `Tests  49 passed (49)`.
    - `cd backend && pytest` → `18 passed`.

## 6. Estructura recomendada del informe PDF

```
1. Portada (autor, fecha, título, asignatura)
2. Resumen ejecutivo (1 página) — extraído de docs/informe.md §1
3. Descripción del proyecto y público objetivo — §2 del informe.md
4. Requisitos iniciales — §3 del informe.md
5. Arquitectura + estructura del repo — §4 y §5 del informe.md
6. Metodología con IA — §6 del informe.md
7. Interacción con el asistente y análisis crítico — §7 del informe.md (clave para C4)
8. Corrección numérica y paridad — §8 del informe.md
9. API REST y frontend — §9 y §10 del informe.md
10. Capturas de pantalla — sección 5 de este dossier
11. Instrucciones para el evaluador — §12 del informe.md
12. Limitaciones conocidas y trabajo futuro — §13 y §14 del informe.md
13. Conclusiones — §15 del informe.md
14. Anexos:
    A. Índice de commits (git log)
    B. Índice de prompts registrados
    C. Ejemplo completo de una conversación (elegir prompts/002 o 003)
```

## 7. Cómo generar el PDF

Dos opciones sencillas, sin instalar toolchain nueva:

- **Opción rápida:** abrir `docs/informe.md` en cualquier editor
  Markdown, exportar a PDF (Obsidian, Typora, VS Code + extensión
  Markdown PDF). Añadir portada y capturas.
- **Opción con pandoc** (si lo instalas):

  ```bash
  pandoc docs/informe.md -o docs/informe.pdf \
    --pdf-engine=xelatex --toc --number-sections
  ```

## 8. Higiene antes de entregar

- Revisa que no hay `.env`, `node_modules`, `.venv`, `.next`, `dist` en
  el repo público (los `.gitignore` ya los excluyen; verifica con
  `git status`).
- Verifica que no hay tokens, contraseñas ni URLs privadas en los
  ficheros:

  ```bash
  git grep -Ei 'token|secret|password|api[_-]?key' -- ':!package-lock.json' ':!*.lock'
  ```

- Verifica que el `.zip` de respaldo pesa < 5 MB (sin dependencias):

  ```bash
  git archive --format=zip --output tech-artist-toolbox.zip HEAD
  ls -lh tech-artist-toolbox.zip
  ```

---

## Anexo — Mapa rápido de dónde está cada cosa

- Definición funcional aceptada: `../definicion-inicial.md`.
- Casos de referencia con `source` oficial: `shared-tests/cases.json`.
- Fórmulas TypeScript: `calc-core/src/`.
- Fórmulas Python: `backend/app/calc/`.
- Endpoints REST: `backend/app/api/v1/`.
- Migraciones BD: `backend/alembic/versions/`.
- UI: `frontend/app/`.
- Cliente HTTP tipado: `frontend/lib/api.ts`.
- Registro de prompts: `prompts/`.
- Documentación técnica: `docs/`.
- CI: `.github/workflows/ci.yml`.
