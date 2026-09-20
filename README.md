# Tech Artist Toolbox

Aplicación web con calculadoras y utilidades técnicas para Technical Artists
y desarrolladores de videojuegos, más una API REST pública que expone los
mismos cálculos.

Este proyecto se ha desarrollado íntegramente asistido por IA, en el marco de
la Actividad 1 de la asignatura de Automatizaciones. Toda decisión, prompt,
error y corrección relevantes están registrados en `prompts/`.

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

Pendiente:

- [ ] `calc-core` (fórmulas + tests)
- [ ] `shared-tests/cases.json`
- [ ] Backend FastAPI (endpoints v1)
- [ ] Frontend Next.js (calculadoras + perfiles)
- [ ] CI (lint + tests)
- [ ] Despliegue
