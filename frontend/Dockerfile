# Frontend Next.js — Tech Artist Toolbox
# Multistage: build con toolchain completo, runtime solo con lo necesario.

FROM node:20-alpine AS builder
WORKDIR /workspace

# Copia calc-core (dependencia file:../calc-core) y construye su bundle.
COPY calc-core /workspace/calc-core
WORKDIR /workspace/calc-core
RUN npm install --no-audit --no-fund && npm run build

# Instala y construye el frontend.
WORKDIR /workspace/frontend
COPY frontend/package.json ./
RUN npm install --no-audit --no-fund
COPY frontend .
RUN npm run build

# Runtime: usa la salida `standalone` de Next.
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /workspace/frontend/.next/standalone ./
COPY --from=builder /workspace/frontend/.next/static ./.next/static
COPY --from=builder /workspace/frontend/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
