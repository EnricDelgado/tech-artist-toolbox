# Backend — Tech Artist Toolbox

FastAPI + Python 3.12. Expone la API REST v1 (`/api/v1/*`) y persiste los
perfiles de proyecto en PostgreSQL.

## Estructura

```
backend/
├── app/
│   ├── main.py            # factory FastAPI (CORS + rate limit + handlers)
│   ├── config.py          # settings desde variables de entorno
│   ├── errors.py          # InvalidInputError + traducción a 422 con formato §4.7
│   ├── db.py              # sesión SQLAlchemy (lazy, tolerante a "sin BD")
│   ├── api/v1/
│   │   ├── router.py      # /api/v1 raíz
│   │   ├── calc.py        # texture/memory, texture/compare, uv/texel-density, shader/math
│   │   └── projects.py    # CRUD + export/import
│   ├── calc/              # port de calc-core: texture, uv, shader, color
│   ├── models/project.py  # SQLAlchemy 2.0 ORM
│   └── schemas/           # Pydantic v2 (calc + project)
├── alembic/               # migraciones (initial: tabla projects)
├── tests/
│   ├── test_calc_parity.py   # 27 casos de shared-tests/cases.json
│   └── test_api.py           # endpoints v1
├── Dockerfile
├── pyproject.toml
├── requirements.txt
└── requirements-dev.txt
```

## Variables de entorno

- `DATABASE_URL` — Postgres, p. ej. `postgresql+psycopg://user:pass@db:5432/toolbox`. Vacío → los endpoints de `/projects` devuelven 503; el resto sigue funcionando (útil para dev/tests sin BD).
- `API_CORS_ORIGINS` — coma-separado, p. ej. `http://localhost:3000`.
- `API_RATE_LIMIT_PER_MINUTE` — por defecto 60 (slowapi, por IP).

## Correr en local (sin Docker)

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements-dev.txt
pytest                                        # 18 tests, sin necesitar BD
uvicorn app.main:app --reload --port 8000     # OpenAPI en /docs
```

Con Postgres arriba (`docker compose up db`), aplica migraciones:

```bash
alembic upgrade head
```

## Paridad con `calc-core`

`app/calc/` es un port 1:1 de `calc-core` (TypeScript). Ambos entornos validan
los mismos 27 casos de `shared-tests/cases.json`. Si alguna prueba pasa en un
lado y falla en el otro, es divergencia — no hay una única "fuente correcta":
la fuente es el JSON compartido y su `source` con la referencia oficial.
