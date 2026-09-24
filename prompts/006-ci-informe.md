# 006 — CI + informe técnico + dossier de entrega

**Fecha:** 24/09/2026
**Asistente:** Claude Code (Opus 4.7)
**Contexto:** Paso 7 del plan. Con calc-core, backend y frontend cerrados, esta sesión rellena el placeholder de CI en `.github/workflows/ci.yml`, redacta el informe técnico (`docs/informe.md`) y el dossier de entrega (`docs/entrega-dossier.md`).
**Resultado:**
- `.github/workflows/ci.yml` real: tres jobs (calc-core, backend, frontend). El job de frontend depende del de calc-core porque necesita el `dist/` para resolver `file:../calc-core`.
- `docs/informe.md`: informe técnico completo, estructurado por capítulos, con las citas literales del enunciado.
- `docs/entrega-dossier.md`: dossier operativo que mapea cada apartado de la rúbrica a los ficheros del repo, lista las capturas de pantalla que hay que tomar, incluye el checklist de higiene antes de entregar, y da la estructura recomendada del PDF final.

## Decisiones de diseño

- **Tres jobs separados en el CI**, no un solo job "monolítico". Facilita
  ver dónde falla si algo se rompe.
- **`needs: calc-core`** en el job de frontend: sin el `dist/` de calc-core,
  el `npm install` de frontend falla al resolver la dependencia local.
- **`DATABASE_URL: ''`** en el job de backend, para que corran los tests
  sin Postgres. La BD perezosa se demostró útil desde el minuto uno.
- **`API_RATE_LIMIT_PER_MINUTE: '10000'`** en el job de backend, mismo
  valor que en `conftest.py`, para evitar que slowapi ensucie los
  asserts si la CI dispara muchas requests rápidas.
- **Informe y dossier separados.** El informe (`informe.md`) es el
  contenido del PDF final; el dossier (`entrega-dossier.md`) es la lista
  operativa de "qué copiar dónde", "qué capturas tomar" y "qué revisar
  antes de mandar". Separarlos evita que el PDF final tenga contenido
  meta ("me tengo que acordar de X") mezclado con contenido técnico.

## Análisis crítico

**Bien.**

- El informe cubre las cinco secciones de la rúbrica de forma explícita.
- Cada crítica que se hace a la IA está anclada a un fichero
  (`prompts/NNN-*.md`) y a un caso concreto (ejemplo ASTC_6×6,
  `floor→round`, `experimental.externalDir`). No hay críticas genéricas
  del tipo "la IA a veces se equivoca"; hay tres errores localizados y
  documentados con su corrección.
- El dossier de entrega es un mapa 1:1 entre la rúbrica del docx y los
  ficheros del repo. Cuando el evaluador lea el PDF, no debe tener que
  buscar nada.

**Regular / a mejorar.**

- **El CI aún no se ha ejecutado.** Se ha escrito en frío; hay que subir
  a GitHub y comprobar que los tres jobs pasan. Casi seguro que el job
  de frontend pida algún ajuste (por ejemplo, cache path de npm cuando
  hay dos `package-lock.json` en el repo).
- **El PDF hay que generarlo manualmente.** No entra en el alcance de
  esta sesión (requiere Obsidian/Typora/VS Code o pandoc con toolchain
  LaTeX).
- **Sin capturas todavía.** Están enumeradas exhaustivamente en
  `docs/entrega-dossier.md` §5, pero hay que tomarlas cuando la app esté
  arriba.

**Deuda técnica pendiente.**

- Ninguna nueva. La deuda arrastrada de sesiones anteriores
  (`floor→round`, ejemplo ASTC_6×6 en la definición) sigue igual y está
  documentada en el informe como "trabajo futuro".

**Commit:** `chore(ci,docs): CI real, informe técnico y dossier de entrega`.
