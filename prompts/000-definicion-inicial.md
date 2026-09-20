# 000 — Definición inicial y elección de idea

**Fecha:** 20/09/2026
**Asistente:** claude-opus-4-7 (Cowork, sesión Claude Code Remote)
**Contexto:** primer contacto con la actividad. Dos candidatos de idea
(Home Manager y Tech Artist Toolbox). Se pide al asistente contrastarlos
contra los requisitos y decidir cuál se desarrolla.
**Resultado:** decisión firme (Tech Artist Toolbox) + documento
`definicion-inicial.md` con alcance, arquitectura, MVP y riesgos.

---

## Prompt clave

> lee el desglose de la actividad — `desglose-actividad-1.md` (actividad
> es `psuiadesoft02_act1.docx`). Tengo dos candidatos a ideas en
> `web-ideas`. Contrástalos con los requerimientos. Si ninguno funciona
> del todo bien a nivel conceptual, se busca otra idea. Mi intención es,
> ya que va a ser una app que va a salir cara — puesto se tiene que hacer
> usando IA —, prefiero que sea algo que vaya a utilizar.

## Respuesta / acción

El asistente:

1. Leyó `desglose-actividad-1.md`, `web-ideas/opcion-2-home-manager.md` y
   `web-ideas/opcion-5-tech-artist-toolbox.md`.
2. Contrastó ambas ideas contra la rúbrica (5 criterios).
3. Contrastó ambas ideas contra el criterio de "uso real diario".
4. Recomendó Tech Artist Toolbox por: variedad natural de prompts,
   salidas verificables numéricamente, dominio conocido por el autor y
   utilidad inmediata sin coste de arranque (a diferencia de Home Manager,
   que exige rellenar mucha información antes de aportar valor).
5. Propuso un MVP acotado a 5 calculadoras + perfiles + API v1.

## Análisis crítico

- Lo que salió bien: propuesta concreta con MVP cerrado y mapeo directo
  contra la rúbrica.
- Riesgo asumido: la elección apuesta por un dominio de nicho. Mitigación
  prevista: glosario en la definición y ejemplos numéricos para el
  evaluador.
- Decisión aceptada por el autor sin cambios: se procede.

---

# 001 — Scaffold del repositorio y docker-compose

**Fecha:** 20/09/2026
**Asistente:** claude-opus-4-7 (Cowork)
**Contexto:** definición aceptada. Toca crear la estructura mínima del
repositorio y el orquestador local antes de tocar ningún módulo.
**Resultado:** carpeta `tech-artist-toolbox/` con:

- `docker-compose.yml` (Postgres 16 + backend + frontend, con healthcheck
  en la DB y variables por defecto).
- `.env.example` y `.gitignore`.
- READMEs en la raíz y en cada módulo con el alcance pendiente.
- Dockerfiles placeholder en `backend/` y `frontend/` (mantienen los
  contenedores vivos hasta que se implementen los módulos).
- `prompts/README.md` con la convención de registro.

## Prompt clave

> definicion leida y aceptada — empecemos con el punto 2

## Respuesta / acción

El asistente creó la estructura descrita, con placeholders explícitos
que documentan qué falta y remiten a `definicion-inicial.md`.

Decisiones tomadas por el asistente en este paso:

- **Ubicación del repo:** subcarpeta `tech-artist-toolbox/` dentro de
  `Actividad1/`, para no separar código y notas.
- **Dockerfiles placeholder:** en lugar de dejar `docker-compose` sin
  contexto de build, se crean Dockerfiles mínimos que documentan el TODO
  y mantienen los contenedores vivos (así `docker compose up db` funciona
  hoy y `up` completo funcionará en cuanto se rellenen los módulos).
- **Healthcheck en Postgres:** obliga al backend a esperar a que la base
  esté lista, evitando el clásico error de arranque intermitente.
- **Variables con defaults en el compose:** `docker compose up` funciona
  sin `.env` (útil para clonar y probar rápido).
- **Volúmenes montados en dev:** `./backend`, `./frontend` y `./calc-core`
  para tener recarga en caliente cuando se implementen.

## Análisis crítico

- Pendiente para el siguiente hito: `shared-tests/cases.json` y luego
  `calc-core`. Es el orden lógico porque los casos de test son la
  especificación ejecutable de las fórmulas.
- Todavía no se puede hacer `docker compose up` completo (los servicios
  backend y frontend son placeholders). Sí funciona `docker compose up db`.
