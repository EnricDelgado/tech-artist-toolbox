# Instrucciones para el agente que rellenará `psuiadesoft02_act1.docx`

**Este documento es el prompt maestro para otro agente de IA.** Contiene:

- Contexto del proyecto y del alumno.
- Estructura obligada de la entrega según la rúbrica.
- Reglas de estilo y honestidad.
- Fuentes de las que tiene que sacar cada apartado.
- Formato del docx y de la portada.
- Antipatrones a evitar.

**Lee este documento entero antes de tocar el docx.** No improvises secciones
ni añadas contenido inventado. Todo lo que escribas tiene que poder
justificarse desde uno de los ficheros del repo.

---

## 0. Contexto rápido

- **Alumno:** Enric Delgado Claramunt.
- **Correo:** <enricdelgadoclaramunt@gmail.com>.
- **Actividad:** Actividad 1 — "Desarrollo de aplicaciones con asistentes de
  programación basados en IA".
- **Documento a rellenar:** `psuiadesoft02_act1.docx` (ubicado en
  `Actividad1/psuiadesoft02_act1.docx`, un nivel por encima del repo del
  proyecto).
- **Repo del proyecto:** `Actividad1/tech-artist-toolbox/`.
- **Producción:**
  - App: <https://tech-artist-toolbox.vercel.app>
  - API: <https://tech-artist-toolbox-backend.onrender.com>
  - Swagger: <https://tech-artist-toolbox-backend.onrender.com/docs>
  - Código: <https://github.com/EnricDelgado/tech-artist-toolbox>
- **Modelos de IA usados durante el desarrollo:** Claude Sonnet 5 y
  Claude Opus 4.7, en Claude Code (CLI/Desktop de Anthropic).

**Datos que el alumno debe darte antes de empezar** (si faltan, pídelos):

- Titulación / máster exacto y nombre oficial de la asignatura.
- Nombre del profesor/tutor si el docx lo pide.
- Fecha de entrega que consta en el aula virtual.
- Formato final requerido (docx, PDF o ambos).
- Si el aula virtual acepta enlace al repo o exige `.zip`.

---

## 1. Rúbrica y estructura obligatoria

El enunciado define **5 criterios** con estos pesos:

| # | Criterio | Peso | Cómo lo cubres |
|---|----------|------|----------------|
| 1 | Claridad y precisión en la definición inicial del proyecto | 20 % | §"Descripción y requisitos" del docx |
| 2 | Capacidad de formular instrucciones eficaces al asistente de IA | 25 % | §"Interacción con la IA" con extractos literales de `prompts/*.md` |
| 3 | Calidad y funcionalidad de la aplicación resultante | 25 % | §"Resultado" con capturas + enlaces vivos + cifras de tests |
| 4 | Documentación del proceso y análisis crítico de la experiencia | 20 % | §"Análisis crítico" con los 3 errores documentados de la IA |
| 5 | Organización y presentación del material entregado | 10 % | Formato del docx, portada, índice, tipografía coherente |

El enunciado (leído del docx original) pide **estas secciones mínimas**:

1. **Descripción del proyecto.**
2. **Requisitos iniciales.**
3. **Capturas de pantalla de la aplicación funcionando.**
4. **Extractos relevantes de las conversaciones con la IA.**
5. **Análisis de resultados y conclusiones.**

Además pide entregar:
- **Código fuente:** repositorio público (ya cumplido: repo de GitHub) o `.zip`.
- **Aplicación ejecutable o desplegada** (cumplido: URL de Vercel).
- **`requirements.txt`** o equivalente (cumplido:
  `backend/requirements.txt` + `package.json`).

---

## 2. Estructura recomendada del docx

Sigue este orden. No añadas secciones que no aporten a la rúbrica; no
quites las que aparecen en el enunciado.

```
Portada
Índice
1. Resumen ejecutivo (½ página)
2. Descripción del proyecto (1-1.5 pág)
3. Requisitos iniciales (1 pág)
4. Arquitectura y stack (1 pág, con el diagrama de docs/informe.md §4)
5. Metodología: cómo se ha desarrollado con IA (1 pág)
6. Interacción con el asistente
   6.1 Registro de conversaciones (tabla con las 7 entradas)
   6.2 Prompt eficaz: ejemplo literal (¾ pág)
   6.3 Errores detectados en la IA y corrección (1-1.5 pág)
7. Resultado: la aplicación
   7.1 Capturas comentadas (2-4 pág)
   7.2 API y OpenAPI
   7.3 Cifras verificables (tests, casos de referencia, commits)
8. Corrección numérica y paridad cliente/servidor (1 pág)
9. Despliegue (½ pág)
10. Limitaciones conocidas (½ pág)
11. Conclusiones (1 pág)
12. Instrucciones para el evaluador
13. Anexos:
    A. Historial de commits
    B. Índice de prompts registrados
    C. Enlaces
```

Extensión objetivo: **12-15 páginas** más capturas. Si el aula virtual da
un límite distinto, prioriza secciones 6, 7 y 11.

---

## 3. De dónde sale cada sección — trazabilidad

**Escribe cada párrafo copiando o adaptando de estas fuentes.** No inventes
detalles que no estén en el repo.

| Sección del docx | Fuente principal | Fuente secundaria |
|------------------|------------------|-------------------|
| 1. Resumen ejecutivo | `docs/informe.md` §1 | — |
| 2. Descripción del proyecto | `definicion-inicial.md` §1-§2 | `docs/informe.md` §2 |
| 3. Requisitos iniciales | `definicion-inicial.md` §3, §5 | `docs/informe.md` §3 |
| 4. Arquitectura y stack | `definicion-inicial.md` §6-§7 | `docs/informe.md` §4 |
| 5. Metodología con IA | `docs/informe.md` §6 | `prompts/README.md` |
| 6.1 Registro de conversaciones | `docs/informe.md` §6.3 (tabla) | `prompts/*.md` |
| 6.2 Prompt eficaz literal | `prompts/002-shared-tests.md` sección "Prompt clave" | `docs/informe.md` §7.1 |
| 6.3 Errores + corrección | `docs/informe.md` §7.2 | `prompts/002`, `003`, `005` |
| 7.1 Capturas | `docs/capturas/` (12 imágenes numeradas) | `docs/entrega-dossier.md` §5.2 |
| 7.2 API | `docs/informe.md` §9 | Swagger en producción |
| 7.3 Cifras | `docs/entrega-dossier.md` §3 (tabla) | ejecutar comandos si dudas |
| 8. Paridad | `docs/informe.md` §8 | `shared-tests/cases.json` |
| 9. Despliegue | `docs/despliegue.md` §Opción B | `README.md` §"En producción" |
| 10. Limitaciones | `docs/informe.md` §13 | — |
| 11. Conclusiones | `docs/informe.md` §15 | — |
| 12. Instrucciones evaluador | `docs/informe.md` §12 | — |
| A. Commits | `git log --oneline` | — |
| B. Prompts | `ls prompts/*.md` | — |
| C. Enlaces | `docs/entrega-dossier.md` §4 | — |

---

## 4. Ejemplos que **debes** citar literalmente

Estos tres extractos son la evidencia más valiosa para los criterios 2 y 4.
Cítalos textualmente (con formato de cita) en las secciones 6.2 y 6.3.

### 4.1 Prompt eficaz — sección 6.2

Fuente: `prompts/002-shared-tests.md`, apartado "Prompt clave". Cita el
bloque entero. Debajo, comenta por qué funciona (los seis rasgos: objetivo
concreto, lecturas previas obligatorias, shape del resultado, criterio de
fuente oficial, casos de borde y anti-scope). El comentario ya está redactado
en `docs/informe.md` §7.1 — cópialo y adáptalo.

### 4.2 Error de la IA #1 — sección 6.3

**El ejemplo de contrato de API en `definicion-inicial.md` §9 (ASTC_6×6 con
`perTextureBytes: 3355443`) es matemáticamente incorrecto.** El valor real
según el spec de Khronos es 1 871 424. La IA generó un número plausible en
la primera sesión y solo se detectó al escribir el JSON de casos.

- Cita textual: `docs/informe.md` §7.2 apartado a).
- Análisis original: `prompts/002-shared-tests.md` sección "Análisis crítico".
- Lección: los "ejemplos ilustrativos" de la IA no son de fiar sin
  verificación numérica contra fuente oficial. Este error valida el riesgo
  1 anticipado en `definicion-inicial.md` §12.3.

### 4.3 Error de la IA #2 — sección 6.3

**La mutación `Math.floor(x·4/3) → Math.round(x·4/3)` en el cálculo de
mipmaps no rompe ningún test compartido.** Descubierto haciendo mutation
testing manual.

- Cita textual: `docs/informe.md` §7.2 apartado b).
- Análisis original: `prompts/003-calc-core.md` sección "Análisis crítico".
- Lección: testear "el resultado" no es lo mismo que testear "el
  algoritmo". La cobertura de `shared-tests/cases.json` tiene un hueco
  identificado que se ha documentado como deuda.

### 4.4 (Opcional) Error de la IA #3 — sección 6.3

**`experimental.externalDir` en `next.config.mjs`.** Necesaria para que
Next 15 resuelva `file:../calc-core`. Marca "experimental" que podría
moverse en una release menor. Documentado como riesgo aceptado.

- Fuente: `prompts/005-frontend.md`.

**Total mínimo:** dos errores citados (los dos primeros). Con los tres, la
sección 6.3 cubre plenamente el criterio 4.

---

## 5. Cifras y hechos verificables

Estos números están comprobados. Úsalos tal cual:

- **27 casos** de referencia numérica con `source` oficial (Khronos ASTC,
  Microsoft DXGI BC7, IEC 61966-2-1 sRGB, Real-Time Rendering).
- **49 tests** verdes en calc-core (Vitest).
- **18 tests** verdes en backend (pytest), 5 de ellos de paridad numérica
  ejercitando los 27 casos.
- **6 endpoints** REST del §9 + healthz + import/export + OpenAPI.
- **8 rutas estáticas** en el frontend (`next build`).
- **8+ commits** en `main` (verifica con `git log --oneline | wc -l`).
- **7 conversaciones** registradas en `prompts/`.
- **CI verde** en GitHub Actions con tres jobs (calc-core, backend,
  frontend) sobre Node 20 + Python 3.12 + Ubuntu 24.04, sin anotaciones de
  deprecación.

---

## 6. Reglas de estilo y honestidad

1. **No inventar.** Si un dato no está en el repo, o lo pides al alumno o
   lo omites. No hay "seguramente hicimos X".
2. **Sin marketing.** No uses adjetivos como "revolucionario",
   "innovador", "última generación". El proyecto es un MVP técnico
   correcto; se describe con esa dignidad, no con hype.
3. **No inflar cifras.** Los tests, endpoints y capturas están contados;
   respétalos.
4. **Referenciar el fichero exacto.** Cuando afirmes algo del código o
   del proceso, cita el fichero (`shared-tests/cases.json`,
   `prompts/003-calc-core.md`, etc.). El evaluador tiene el repo delante.
5. **Nada de código a mano.** El enunciado exige que todo el código lo
   escriba la IA. Dilo explícitamente en la sección de metodología, y
   respáldalo con el hecho de que hay 8 commits mapeando 1-a-1 con 7
   conversaciones registradas.
6. **Limitaciones a la vista.** Sección 10 no es opcional. Debe recoger:
   sin auth, sin tests unitarios de UI, hueco `floor→round` sin cerrar,
   ejemplo ASTC_6×6 en la definición aún sin corregir, backend duerme
   por free tier de Render.
7. **Idioma:** español de España.
8. **Persona verbal:** primera persona plural neutra ("hemos
   implementado", "hemos detectado"). Alternativa aceptable: impersonal
   ("se ha implementado"). No mezcles.
9. **Tiempo verbal:** pretérito perfecto compuesto o presente para
   describir el estado del sistema; futuro solo en "trabajo futuro".

---

## 7. Portada y metadatos del docx

- **Título:** Tech Artist Toolbox — Actividad 1 (o el título oficial que
  el docx tenga en la plantilla, si ya lo trae).
- **Autor:** Enric Delgado Claramunt.
- **Correo:** <enricdelgadoclaramunt@gmail.com>.
- **Fecha:** la que el aula virtual indique como fecha de entrega. Si el
  alumno no te la da, pídela; no la inventes.
- **Titulación / Máster:** pídesela al alumno.
- **Asignatura:** pídesela al alumno.

Metadatos del fichero .docx (File → Info en Word / Propiedades):

- Autor: Enric Delgado Claramunt.
- Título: como arriba.
- Comentarios: `Actividad 1 · Tech Artist Toolbox · Repo:
  https://github.com/EnricDelgado/tech-artist-toolbox`.

---

## 8. Cómo incrustar las capturas

Las 12 capturas están en `docs/capturas/` numeradas del 01 al 12. Insértalas
en la sección 7.1 con este patrón:

- Cada figura con **pie**: `Figura N: <descripción corta>` (Times/Arial 9-10
  pt, cursiva).
- **Anchura:** que quepan en el ancho útil de la página; nada de imágenes
  a página completa salvo la captura de Swagger.
- **Orden:** el mismo que el numérico (01 a 12).
- **Comentario debajo:** 1-3 frases explicando qué se ve y qué demuestra.
  Ejemplo para la 03 (padding ASTC): *"El aviso ámbar muestra que la
  entrada 1024×1024 se ha padded a 1026×1026 porque ASTC 6×6 requiere
  múltiplos de 6. Este caso es exactamente uno de los tests de borde de
  `shared-tests/cases.json`."*

---

## 9. Antipatrones — cosas que NO debes hacer

- **No escribir código nuevo en el docx.** Cita fragmentos si añaden valor
  (formato monoespaciado), pero no inventes. Copia de los ficheros reales.
- **No prometer features que no existen.** El MVP no tiene: auth, uso
  compartido, integración con Unity, exportación a PPT, tests UI.
- **No presentar los errores de la IA como "detalles menores".** Son la
  evidencia más valiosa de análisis crítico. Trátalos como hallazgos, no
  como excusas.
- **No decir "usamos ChatGPT".** El asistente ha sido Claude Code
  (Claude Sonnet 5 → Claude Opus 4.7). El enunciado permite cualquier
  asistente; nombra el que se ha usado de verdad.
- **No inflar la sección de metodología con teoría del prompt engineering.**
  Con explicar los seis rasgos del prompt de la §4.1 basta.
- **No añadir un README dentro del docx.** El repo tiene su README; enlázalo.

---

## 10. Checklist antes de dar el docx por terminado

Antes de guardar y avisar al alumno:

- [ ] Portada con nombre real y fecha correcta.
- [ ] Índice actualizado con las páginas reales (Word: References →
  Update Table).
- [ ] Las tres tablas de cifras coinciden con las de `docs/entrega-dossier.md`.
- [ ] 12 figuras insertadas, numeradas, con pie y con comentario debajo.
- [ ] Cita literal del prompt de `prompts/002-shared-tests.md` en 6.2.
- [ ] Al menos dos errores de la IA citados con su corrección en 6.3.
- [ ] Enlaces al repo, app, API y Swagger clicables.
- [ ] Sin secretos, tokens, contraseñas ni datos sensibles.
- [ ] Sección 10 (Limitaciones) presente y honesta.
- [ ] Ortografía revisada con corrector.
- [ ] Fichero guardado como `.docx` y, si se pide, exportado a PDF.

---

## 11. Cuando termines

Deja un resumen breve al alumno con:

- Ruta del docx guardado.
- Ruta del PDF si lo has generado.
- Cifra de páginas totales.
- Advertencias, si has tenido que asumir algo por falta de datos (fecha,
  nombre del profesor, etc.).

**No** subas el fichero a ningún sitio. Es responsabilidad del alumno
entregarlo en el aula virtual.
