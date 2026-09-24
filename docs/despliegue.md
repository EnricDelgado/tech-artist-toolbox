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

- **Repo:** GitHub público.
- **Frontend:** Vercel free tier. Deploy nativo de Next.js, dominio
  `<proyecto>.vercel.app`.
- **Backend:** Render web service free tier. Duerme tras 15 min de
  inactividad; se despierta en ~30 s en la primera petición (aceptable
  para demo).
- **Base de datos:** Neon Postgres free tier (0.5 GB, más que suficiente
  para perfiles).

**Pasos (resumidos):**

1. **Neon**: crear cuenta, crear proyecto Postgres, copiar el
   `postgresql://...` connection string. En Neon aparece como URL de tipo
   `postgres://user:pass@ep-xxx.eu-central-1.aws.neon.tech/dbname` — para
   este backend, sustituir el esquema por `postgresql+psycopg://...`.
2. **Render**:
   - New → Web Service → conectar el repo de GitHub.
   - Root directory: `backend`.
   - Environment: `Docker` (usa el `backend/Dockerfile`).
   - Env vars:
     - `DATABASE_URL` — el connection string de Neon (con
       `postgresql+psycopg://`).
     - `API_CORS_ORIGINS` — la URL pública del frontend en Vercel.
     - `API_RATE_LIMIT_PER_MINUTE` — `60` por defecto.
   - Deploy. Al arrancar aplica migraciones (`alembic upgrade head`) y
     lanza uvicorn.
3. **Vercel**:
   - New Project → import from GitHub → seleccionar el repo.
   - Root directory: `frontend`.
   - Framework preset: Next.js.
   - Build command: `npm run build`.
   - Install command: `npm install` (Vercel resolverá `file:../calc-core`
     usando el árbol del repo).
   - Env vars:
     - `NEXT_PUBLIC_API_BASE_URL` — la URL pública del backend en Render.
   - Deploy.

**Ventajas:** URL pública, sin coste, cero exposición del ecosistema local.
**Contras:** primer arranque lento del backend tras inactividad; hay que
mantener 3 servicios coordinados.

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
