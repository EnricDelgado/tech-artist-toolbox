# Checklist de entrega — cosas que TIENES que hacer o proporcionar

Este documento lista todo lo que **tú** tienes que hacer antes de invocar al
agente que rellenará `psuiadesoft02_act1.docx`, y todo lo que ese agente
necesita tener a mano.

**Estado del proyecto a fecha 24/09/2026:** código completo, CI verde, app
desplegada, tests pasando. Solo faltan los pasos manuales de abajo.

---

## Bloque A — Preparativos antes de rellenar el docx

### A.1 Capturas de pantalla (30-40 min)

Levanta la app y captura las 12 pantallas listadas en
`docs/entrega-dossier.md` §5.2. Puedes usar la app en producción o levantarla
en local; ambas valen para el docx.

- **App en producción:** <https://tech-artist-toolbox.vercel.app>
- **API en producción:** <https://tech-artist-toolbox-backend.onrender.com>
  (recuerda: el backend duerme tras 15 min; la primera petición tarda ~30 s
  en despertar. Haz una petición cualquiera antes de empezar las capturas).
- **Alternativa local sin Docker:**

  ```bash
  # Terminal 1
  cd backend && source .venv/bin/activate
  DATABASE_URL='' uvicorn app.main:app --host 0.0.0.0 --port 8000

  # Terminal 2
  cd frontend && npm run dev
  ```

  Con `DATABASE_URL=''`, los perfiles darán 503 pero las 5 calculadoras y el
  "Verificar con API" funcionan.

**Guarda las capturas en `docs/capturas/`** (crea la carpeta) y nómbralas
por orden: `01-home.png`, `02-texture-memory-trivial.png`, etc. El agente
las incrustará en el docx en las secciones correspondientes.

**Lista mínima recomendada** (12 capturas):

- [ ] `01-home.png` — home del frontend
- [ ] `02-texture-memory-trivial.png` — RGBA32 1024×1024 con "Verificar con API" en verde
- [ ] `03-texture-memory-astc-padding.png` — ASTC_6×6 1024×1024 con warning de padding
- [ ] `04-compression-comparator.png` — tabla comparativa completa
- [ ] `05-texel-density-basic.png` — 1024 px, 2 m
- [ ] `06-texel-density-target.png` — 4 m, targetDensity 100, potencia de dos
- [ ] `07-shader-math-smoothstep.png` — gráfica visible
- [ ] `08-shader-math-lerp-extrapolate.png` — a=-5 b=5 t=1.5 → 10
- [ ] `09-color.png` — #6EE7B7 + linear/sRGB 0.5→0.735357
- [ ] `10-projects-list-export.png` — lista con al menos un perfil, diálogo de export
- [ ] `11-swagger-ui.png` — /docs con los endpoints v1
- [ ] `12-tests-verdes.png` — dos terminales con `npm test` (49 passed) y `pytest` (18 passed)

### A.2 Datos personales para la portada

El agente necesita:

- **Nombre completo:** Enric Delgado Claramunt (verificado del git config).
- **Correo:** <enricdelgadoclaramunt@gmail.com>.
- **Titulación / Máster** y nombre de la asignatura tal como aparece en el
  aula virtual — **pega este dato en el prompt al agente**, no lo tengo yo.
- **Curso / grupo** si aplica.
- **Fecha de entrega** que consta en el aula.
- **Nombre del profesor / tutor** (si el docx lo pide).

### A.3 Formato de la entrega

- ¿La entrega definitiva es el docx? ¿O el docx se convierte a PDF? Si es
  PDF, ¿portada aparte o dentro del mismo fichero? — díselo al agente.
- ¿El aula virtual acepta enlace a repo, o hay que subir el `.zip`? Ambos
  se pueden preparar; el `.zip` se genera con:

  ```bash
  cd /Users/enric/Obsidian/Master/Automatizaciones/Actividades/Actividad1/tech-artist-toolbox
  git archive --format=zip --output ../tech-artist-toolbox.zip HEAD
  ```

### A.4 Chequeo final del repo

Antes de decirle al agente que puede empezar:

```bash
cd /Users/enric/Obsidian/Master/Automatizaciones/Actividades/Actividad1/tech-artist-toolbox
git status                                              # tree limpio
git grep -Ei 'token|secret|password|api[_-]?key' \
  -- ':!package-lock.json' ':!*.lock' ':!docs/'         # sin filtraciones
git log --oneline                                       # 8+ commits
```

Verificar además que estos ficheros existen y son la versión final:

- [ ] `docs/informe.md`
- [ ] `docs/entrega-dossier.md`
- [ ] `docs/despliegue.md`
- [ ] `docs/instrucciones-agente-docx.md` (creado en esta sesión)
- [ ] `docs/entrega-checklist-usuario.md` (este documento)
- [ ] `docs/capturas/` con las 12 imágenes

---

## Bloque B — Qué pasarle al agente que rellenará el docx

Cuando abras la sesión del otro agente, pásale (o dile dónde leer) **estos
seis ficheros**, en este orden:

1. `psuiadesoft02_act1.docx` (o su ruta) — la plantilla / rúbrica original.
2. `docs/instrucciones-agente-docx.md` — el manual paso a paso. **Este es
   el fichero clave.**
3. `docs/informe.md` — contenido técnico completo, listo para trocearlo
   por secciones.
4. `docs/entrega-dossier.md` — mapa rúbrica → repo con extractos ya
   seleccionados.
5. `prompts/*.md` — 7 conversaciones registradas (usadas como evidencia
   para el criterio 2 y el criterio 4).
6. `docs/capturas/` — carpeta con las 12 imágenes.

El agente **no** necesita clonar Vercel/Render/Neon, ni acceso al aula
virtual. Solo lee del repo local + escribe el docx.

---

## Bloque C — Datos verificables ya listos (no toques)

El agente va a citar estas cifras. Están calculadas y verificadas; no las
tienes que producir tú:

| Métrica | Valor | Evidencia |
|---------|-------|-----------|
| Casos de referencia numérica | 27 | `shared-tests/cases.json` |
| Tests calc-core verdes | 49 | `cd calc-core && npm test` |
| Tests backend verdes | 18 | `cd backend && pytest` |
| Rutas del frontend | 8 estáticas | `cd frontend && npm run build` |
| Commits del proyecto | 8+ | `git log --oneline` |
| Conversaciones registradas | 7 | `ls prompts/*.md` |
| CI en GitHub Actions | verde, sin annotations | tab "Actions" |
| Endpoints REST | 6 del §9 + healthz + import/export + OpenAPI | `docs/informe.md` §9 |

---

## Bloque D — Lo que TÚ tienes que decidir antes de invocar al agente

Decisiones que solo tú puedes tomar y que cambian cómo escribe el agente:

1. **¿Registro de conversaciones completo o resumido?** El enunciado pide
   "extractos relevantes". Recomendado: incluir literalmente el prompt de
   `prompts/002-shared-tests.md` (el mejor ejemplo estructurado) y
   resumir el resto.
2. **¿Cuánto énfasis en errores de la IA?** El criterio 4 (20%) premia el
   análisis crítico. Recomendado: incluir los tres errores localizados en
   `prompts/002`, `003` y `005` como sección "análisis crítico". No
   maquillar; es lo que diferencia el trabajo.
3. **¿Instrucciones de ejecución para el evaluador?** Puedes decidir entre
   (a) solo enlace a producción, (b) solo `docker compose up`, (c) ambos.
   Recomendado: ambos, con el enlace primero.
4. **Extensión total del docx.** Si el aula virtual da un límite, dilo. Sin
   límite: unas 12-15 páginas + capturas es razonable.

---

## Bloque E — Cuando el agente haya terminado

Antes de subir la entrega:

- [ ] Verifica que aparece tu nombre real (Enric Delgado Claramunt).
- [ ] Verifica que la fecha en la portada coincide con la de entrega.
- [ ] Confirma que los enlaces al repo/app/API abren correctamente.
- [ ] Confirma que las 12 capturas están incrustadas, en orden y con pie.
- [ ] Cuenta las conversaciones citadas: deben ser al menos 3 con
  extracto literal.
- [ ] Comprueba que la sección "análisis crítico" cita al menos 2 errores
  detectados en la IA con su corrección.
- [ ] Convierte a PDF si el aula lo exige (Word → Exportar como PDF).
- [ ] Genera el `.zip` de respaldo (comando en §A.3).
- [ ] Sube la entrega.

**Después de entregar**, si Vercel/Render dejan de responder por
inactividad prolongada, no pasa nada: el repo público (con toda la
documentación, tests y el CI verde) prueba el trabajo por sí solo.
