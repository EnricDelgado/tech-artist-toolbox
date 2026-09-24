# Tech Artist Toolbox

Aplicación web con calculadoras y utilidades técnicas para Technical Artists
y desarrolladores de videojuegos, más una API REST pública que expone los
mismos cálculos.

Este proyecto se ha desarrollado íntegramente asistido por IA, en el marco de
la Actividad 1 de la asignatura de Automatizaciones. Toda decisión, prompt,
error y corrección relevantes están registrados en `prompts/`.

## En producción

| Recurso | URL |
|---------|-----|
| Aplicación | <https://tech-artist-toolbox.vercel.app> |
| API | <https://tech-artist-toolbox-backend.onrender.com> |
| Swagger UI | <https://tech-artist-toolbox-backend.onrender.com/docs> |
| Healthcheck | <https://tech-artist-toolbox-backend.onrender.com/healthz> |
| Código fuente | <https://github.com/EnricDelgado/tech-artist-toolbox> |

Verificado en producción el 24/09/2026: paridad cliente/servidor (botón
"Verificar con API" en verde), CORS restringido a la URL de Vercel, Neon
Postgres respondiendo con `GET /api/v1/projects → 200 []` (migración de
Alembic aplicada al arrancar).

Infraestructura: **GitHub** (repo público) + **Vercel** (frontend Next.js) +
**Render** (backend Docker) + **Neon** (Postgres). Todo en tiers gratuitos.
El backend duerme tras 15 min de inactividad; la primera petición tras un
rato tarda ~30 s en despertar el contenedor.

## Estructura

```
tech-artist-toolbox/
├── frontend/       → Next.js + React + TypeScript
├── backend/        → FastAPI + Python 3.12
├── calc-core/      → Fórmulas compartidas en TypeScript
├── shared-tests/   → JSON con casos de referencia (paridad cliente/servidor)
├── prompts/        → Registro de conversaciones con la IA
├── docs/           → Documentación técnica y del informe final
├── docker-compose.yml
├── .env.example
└── README.md
```

## Cómo ejecutar en local

Requisitos: Docker y Docker Compose.

```bash
cp .env.example .env         # opcional: los defaults funcionan
docker compose up            # arranca db + backend + frontend
```

Servicios expuestos:

| Servicio | URL                       |
|----------|---------------------------|
| Frontend | http://localhost:3000     |
| Backend  | http://localhost:8000     |
| API docs | http://localhost:8000/docs|
| Postgres | localhost:5432            |

Para levantar solo la base de datos durante el desarrollo:

```bash
docker compose up db
```

## Documentos clave

- `../definicion-inicial.md` — definición funcional y de alcance del proyecto.
- `../desglose-actividad-1.md` — desglose del enunciado de la actividad.
- `prompts/` — registro cronológico de las interacciones con la IA.
- `docs/` — documentación técnica adicional (arquitectura, decisiones, informe).

## Estado del MVP

- [x] `shared-tests/cases.json` (27 casos, referencias oficiales)
- [x] `calc-core` TypeScript (49 tests verdes)
- [x] Backend FastAPI + Alembic (18 tests, paridad con `calc-core`)
- [x] Frontend Next.js (5 calculadoras + perfiles + verify contra API)
- [ ] CI (lint + tests)
- [ ] Despliegue en producción — ver [`docs/despliegue.md`](docs/despliegue.md)
      para las tres alternativas (mínima con Docker, recomendada con
      GitHub + Vercel + Render + Neon, todo en Fly.io).

## Tests locales

```bash
# calc-core
cd calc-core && npm install && npm test     # 49 tests

# backend
cd backend && python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements-dev.txt && pytest    # 18 tests

# frontend (build + typecheck; sin tests unitarios de UI en el MVP)
cd frontend && npm install && npm run build
```
