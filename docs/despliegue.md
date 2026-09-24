# Despliegue — opciones para la entrega

El enunciado (`psuiadesoft02_act1.docx`) exige:

- **Repositorio público** (GitHub, GitLab, etc.) o `.zip`.
- **Aplicación ejecutable o desplegada** — enlace si está online, o
  instrucciones para ejecutar en local.
- `requirements.txt` o equivalente con dependencias — ya cubierto por
  `backend/requirements.txt` y los `package.json` de `frontend` y `calc-core`.

Este documento describe tres alternativas de entrega, en orden creciente de
esfuerzo. Cualquiera de las tres cumple el enunciado.

## Opción A — Mínima (solo repo público)

**Qué se entrega:** enlace al repo público + `.zip` de respaldo.
El usuario / evaluador ejecuta la app con `docker compose up` en local.

**Pasos:**

1. Crear repo público en GitHub (nombre sugerido: `tech-artist-toolbox`).
   Sin plantilla, sin `.gitignore` inicial (ya está en el repo local).
2. Añadir remoto y empujar:

   ```bash
   git remote add origin git@github.com:<usuario>/tech-artist-toolbox.git
   git branch -M main
   git push -u origin main
   ```

3. En el README del repo, dejar clara la instrucción única:
   `docker compose up` (Postgres + backend + frontend, todo en local).
4. Empaquetar `.zip` de respaldo con `git archive` o exportando el árbol
   sin `node_modules`, `.venv`, `.next`, `dist`.

**Ventajas:** cero coste, sin dependencias externas, todo bajo control.
**Contras:** requiere que el evaluador tenga Docker; sin URL pública para
verificación rápida.

## Opción B — Recomendada: GitHub + Vercel + Render + Neon

**Qué se entrega:** enlace al repo público + URL pública de la app.

- **Repo:** GitHub público (ya existe: `https://github.com/EnricDelgado/tech-artist-toolbox`).
- **Frontend:** Vercel free tier. Deploy nativo de Next.js, dominio
  `<proyecto>.vercel.app`.
- **Backend:** Render web service free tier. Duerme tras 15 min de
  inactividad; se despierta en ~30 s en la primera petición (aceptable
  para demo).
- **Base de datos:** Neon Postgres free tier (0.5 GB, sobra para perfiles).

Ficheros de configuración ya en el repo:

- [`render.yaml`](../render.yaml) — Blueprint de Render (raíz del repo).
- [`frontend/vercel.json`](../frontend/vercel.json) — build config de Vercel
  con install command que primero construye `calc-core` y luego el frontend.

### Paso 1 — Neon (Postgres)

1. Crear cuenta en <https://console.neon.tech> (login con GitHub va bien).
2. New Project. Región cercana (p. ej. `eu-central-1`). Nombre libre.
3. En el dashboard, sección "Connection Details", copiar la connection
   string. Formato típico:

   ```
   postgresql://<user>:<pass>@ep-xxxxx.eu-central-1.aws.neon.tech/<db>?sslmode=require
   ```

4. **Guarda dos versiones** de esa cadena:
   - **Original** (con `postgresql://`), para tenerla como referencia.
   - **Para este backend**: cambia el scheme a `postgresql+psycopg://` y
     conserva `?sslmode=require`. Esta segunda cadena es la que va a
     Render como `DATABASE_URL`.

5. En Neon, activar la extensión `pgcrypto` si no lo está (para
   `gen_random_uuid()`). En Neon suele estar disponible por defecto;
   si la migración inicial falla por eso, ejecutar en el SQL editor:

   ```sql
   CREATE EXTENSION IF NOT EXISTS pgcrypto;
   ```

### Paso 2 — Render (backend)

1. Crear cuenta en <https://dashboard.render.com> (login con GitHub).
2. New → **Blueprint** → conectar el repo `tech-artist-toolbox`.
   Render detecta `render.yaml` en la raíz y propone crear un servicio
   `tech-artist-toolbox-backend`.
3. Antes de "Apply", rellenar las env vars marcadas como `sync: false`:
   - `DATABASE_URL` — la cadena de Neon **con `postgresql+psycopg://`**.
   - `API_CORS_ORIGINS` — dejar `*` de momento (se afina en el paso 4).
   - `API_RATE_LIMIT_PER_MINUTE` — ya viene `60` por defecto.
4. Apply. Render construye el Docker (usa `backend/Dockerfile`), aplica
   `alembic upgrade head` al arrancar y expone uvicorn en el puerto 8000.
5. Cuando el deploy termine, verificar:
   - `https://<backend>.onrender.com/healthz` → `{"status":"ok"}`.
   - `https://<backend>.onrender.com/docs` → Swagger UI.
6. **Anota la URL pública del backend.** La necesitas en el paso 3.

### Paso 3 — Vercel (frontend)

1. Crear cuenta en <https://vercel.com> (login con GitHub).
2. New Project → Import Git Repository → `tech-artist-toolbox`.
3. **Root directory:** `frontend`.
4. Framework preset: Next.js (autodetectado).
5. Build/Install command: Vercel leerá `frontend/vercel.json`. No hay que
   tocar nada.
6. Environment Variables:
   - `NEXT_PUBLIC_API_BASE_URL` = URL pública del backend en Render, sin
     barra final. Ej. `https://tech-artist-toolbox-backend.onrender.com`.
7. Deploy. Cuando termine, verificar `https://<proyecto>.vercel.app`.
8. **Anota la URL pública del frontend.** La necesitas en el paso 4.

### Paso 4 — Cerrar el bucle CORS (importante)

Ahora que tienes la URL real del frontend, endurece CORS en el backend:

1. En Render → Service → Environment → editar `API_CORS_ORIGINS`.
2. Pasar de `*` a la URL exacta del frontend, sin barra final:

   ```
   https://tech-artist-toolbox.vercel.app
   ```

   (o el subdominio que te haya asignado Vercel; si vas a añadir
   preview deployments, se pueden encadenar varias con coma).
3. Save. Render reinicia el servicio con la nueva config.
4. En el frontend, abrir cualquier calculadora y pulsar "Verificar con
   API". Debe salir verde. Si sale rojo con error CORS: revisar que la
   URL en `API_CORS_ORIGINS` coincide exactamente con la del navegador
   (protocolo + host, sin barra final).

### Verificación final

Con las tres URLs vivas, comprobar en orden:

1. `GET https://<backend>/healthz` → 200 `{"status":"ok"}`.
2. `GET https://<backend>/docs` → Swagger UI.
3. `POST https://<backend>/api/v1/texture/memory` con el body del §9 →
   200 con `perTextureBytes` y `totalBytes`.
4. En `https://<frontend>` → recorrer las 5 calculadoras y pulsar
   "Verificar con API" en cada una. Todas verdes.
5. En `/projects` → crear un perfil, exportarlo a JSON, borrarlo,
   volver a importarlo.

**Ventajas:** URL pública, cero coste, cero exposición del ecosistema local.
**Contras:** primer arranque lento del backend tras inactividad; hay que
mantener 3 servicios coordinados; Vercel y Render usan tu cuenta de
GitHub para autenticar (privacidad razonable, no expone contenido).

### Cosas que suelen fallar y cómo desatascarlas

- **Migración de Alembic falla en el primer deploy con
  `function gen_random_uuid() does not exist`.** La extensión `pgcrypto`
  no está creada en Neon. Ejecuta el SQL del paso 1.5 y vuelve a hacer
  deploy manual desde Render.
- **`OperationalError: SSL connection has been closed unexpectedly`.**
  La `DATABASE_URL` no lleva `?sslmode=require`. Añádelo.
- **`ModuleNotFoundError: psycopg`.** Se está usando `postgresql://`
  (que apunta a psycopg2, no incluido). Cambia el scheme a
  `postgresql+psycopg://`.
- **Frontend "Verificar con API" en rojo con "Failed to fetch" o CORS.**
  `API_CORS_ORIGINS` no incluye la URL del frontend, o la URL tiene
  barra final. Debe ser exacta.
- **Frontend "Verificar con API" en rojo con "429 RATE_LIMITED".** El
  free tier con 60/min es corto si compartes IP. Sube
  `API_RATE_LIMIT_PER_MINUTE` a `600` en Render mientras haces la demo.
- **Vercel install command tarda mucho o falla resolviendo `file:../calc-core`.**
  Verifica que `frontend/vercel.json` está en el repo y que Root
  Directory en Vercel es exactamente `frontend`. El install command
  construye primero el `dist/` de calc-core.

## Opción C — Todo en Fly.io (o similar)

**Qué se entrega:** enlace al repo público + URL pública.

Fly.io permite desplegar los dos contenedores (backend + frontend) en la
misma región con Postgres gestionado, sin el "sleep" de Render. Curva de
aprendizaje algo mayor y `fly launch` interactivo. Se documenta como
alternativa si Render da problemas.

## Verificación tras el despliegue

Independientemente de la opción, comprobar:

1. `GET https://<backend>/healthz` → `{"status":"ok"}`.
2. `GET https://<backend>/docs` → OpenAPI navegable.
3. `POST https://<backend>/api/v1/texture/memory` con el ejemplo de la
   documentación → 200 con el shape del §9.
4. En el frontend público, entrar a cada calculadora y pulsar "Verificar
   con API": debe salir verde en todas.
5. En `/projects`, crear un perfil, exportarlo, borrarlo, importarlo de
   nuevo — debe reaparecer.

## Higiene de secretos

- **Nunca** commitear `DATABASE_URL`, `API_CORS_ORIGINS` con dominios de
  producción reales, o cualquier valor por defecto no público en `.env`.
  `.env` está en `.gitignore` desde el commit inicial.
- Las variables se configuran en el panel de Vercel/Render, no en el repo.
- El repo puede permanecer público sin exponer nada sensible.

## Backup en `.zip`

En cualquier caso, además del repo público, añadir a la entrega un `.zip`:

```bash
git archive --format=zip --output tech-artist-toolbox.zip HEAD
```

Ese archivo captura exactamente el estado del commit `HEAD` sin
`node_modules`, `.venv`, `.next`, `dist` ni ficheros ignorados.
