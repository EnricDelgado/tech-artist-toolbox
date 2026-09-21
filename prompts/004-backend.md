# 004 — Backend FastAPI

**Fecha:** 21/09/2026
**Asistente:** Claude Code (Opus 4.7)
**Contexto:** Paso 5 del plan (`progreso-y-siguientes-pasos.md`). Backend Python que expone la API v1 del §9 de `definicion-inicial.md`, replica en Python las fórmulas de `calc-core`, y valida paridad numérica contra los 27 casos de `shared-tests/cases.json`.
**Resultado:** `backend/` completo:
- `pyproject.toml`, `requirements.txt`, `requirements-dev.txt` (satisface el requisito "`requirements.txt` o equivalente" del enunciado).
- Dockerfile real (Python 3.12-slim, aplica migraciones al arrancar y lanza uvicorn).
- `app/` con configuración, errores, BD (perezosa), port de fórmulas en `app/calc/*`, esquemas Pydantic v2, modelo SQLAlchemy 2.0 y routers.
- Alembic con `alembic.ini`, `env.py`, `script.py.mako`, migración inicial `20260921_0001_initial_projects.py`.
- 18 tests pytest en verde (paridad con calc-core sobre los 27 casos compartidos + endpoints con TestClient).

## Prompt clave

> Vamos a implementar el backend FastAPI. Léete `../definicion-inicial.md`
> §5, §7, §8 y §9, y `backend/README.md`. Reemplaza el Dockerfile placeholder
> por uno real (Python 3.12-slim, poetry o pip con requirements). Crea los
> endpoints del §9. La lógica de cálculo va en `app/calc/`, y los tests de
> pytest deben cargar `/shared-tests/cases.json` (montado en el compose) y
> validar los mismos casos que `calc-core`, garantizando paridad. Añade
> Alembic con una migración inicial para la tabla `projects` del §8. Rate
> limiting con slowapi (60/min por defecto, configurable por env).

## Decisiones de diseño relevantes

- **`InvalidInputError` con la misma forma que en calc-core.** Sirve para 422
  con `{"error": {"code": "INVALID_INPUT", "message": "...", "field": "..."}}`,
  formato del §4.7. Se traduce también `RequestValidationError` de Pydantic
  al mismo formato, para que el cliente no vea dos códigos de error distintos.
- **BD perezosa y opcional.** `app/db.py` no toca Postgres si `DATABASE_URL`
  está vacío. Los endpoints de `/projects` devuelven 503 en ese modo (el resto
  de la API sigue funcionando). Permite correr tests y arrancar la app en
  local sin la infraestructura completa, y evita hacer los tests de cálculo
  dependientes de la BD.
- **`app/calc/*` es un port literal de `calc-core`.** Misma tabla de formatos,
  mismas fórmulas, mismo redondeo (`Math.floor(x*4/3)` en TS → `//` en Python
  para el mismo comportamiento entero). El test `test_calc_parity.py` no
  redefine ningún esperado: lee el JSON compartido y compara.
- **Endpoint único para shader math** (`POST /api/v1/shader/math`) que se
  ramifica por `function`, en lugar de tres endpoints. La razón es que las
  tres funciones comparten forma (input numérico, salida numérica) y la
  granularidad ayudaría al frontend, no al consumidor de la API.
- **Rate limiting por IP con slowapi.** Configurable con `API_RATE_LIMIT_PER_MINUTE`
  (60 por defecto). En tests se sube a 10000 en `conftest.py` para no ensuciar
  los asserts.
- **Migración Alembic con `gen_random_uuid()`** del propio Postgres 16, en vez
  de generar UUIDs desde Python. Reduce la superficie donde una divergencia de
  librería puede introducir un ID mal formado.

## Análisis crítico

**Bien.**

- **18 tests verdes a la primera**, incluyendo los 27 casos del JSON
  compartido (5 secciones), casos de error con contrato validado (código,
  campo, mensaje) y un test que verifica que los 6 endpoints de la
  definición aparecen en el `openapi.json`.
- **Paridad real, no simulada.** El test de paridad carga
  `shared-tests/cases.json` directamente. La ruta se resuelve desde el
  fichero de conftest hacia el hermano `shared-tests/`; en Docker se monta
  como volumen `/shared-tests:ro` sobre `docker-compose.yml`, así que dentro
  del contenedor la ruta cambia — habrá que decidir en el Paso 6 o 7 si se
  añade una env var para desacoplar la ruta, o si los tests solo se corren
  desde local/CI y no dentro del contenedor.
- **Formato de error uniforme.** Un middleware traduce tanto los errores de
  Pydantic como `InvalidInputError` al mismo shape. El frontend consumirá
  una sola forma.

**Regular / a mejorar.**

- **Python 3.13 en local, target Dockerfile 3.12.** El repo se ejecutó con
  3.13 en la máquina de desarrollo (no había 3.12 instalado). Los tests
  pasan igual, pero el CI y el build de Docker deberían fijar 3.12 para
  garantizar la coincidencia con el target. Anotado.
- **`docs`, `redoc` y OpenAPI son endpoints públicos.** Sin auth (por
  decisión del MVP). Aceptable, pero conviene documentarlo como limitación
  conocida junto con "perfiles públicos por ID" en el informe final.
- **`from app.errors import HTTPException`… en `app/db.py`.** Import interno
  dentro de la función `get_session` para evitar que un fallo temprano en
  FastAPI rompa el módulo. No es bonito; el precio de que el módulo funcione
  aún sin FastAPI instalado (útil para scripts de Alembic).
- **Convención de nombres.** Los endpoints usan camelCase para los campos
  (el contrato viene del §9 de la definición); el ORM y el módulo Python
  usan snake_case. La traducción se hace explícita en el router. No es
  bonito pero es lo que impone el §9; anotado.

**Deuda técnica pendiente.**

- Corregir el ejemplo ASTC_6×6 de `definicion-inicial.md` §9 (arrastrado desde
  Paso 3 y 4).
- Añadir un caso a `shared-tests/cases.json` donde `floor` y `round` del
  factor 4/3 en mipmaps difieran (anotado desde Paso 4).
- Documentar en el informe final que la API pública no tiene autenticación
  ni permisos, y que los perfiles son públicos por ID (§3.1 de la
  definición).

**Commit:** `feat(backend): FastAPI v1 con paridad y Alembic`.
