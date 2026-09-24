# Frontend — Tech Artist Toolbox

Next.js 15 (App Router) + React 19 + TypeScript + Tailwind + Recharts.
Consume `calc-core` como paquete local (`file:../calc-core`) para calcular en
cliente y la API v1 del backend para verificar los mismos resultados en el
servidor.

## Estructura

```
frontend/
├── app/
│   ├── layout.tsx                          # cabecera, dark mode por defecto
│   ├── page.tsx                            # home con las 5 calculadoras
│   ├── calculators/
│   │   ├── texture-memory/page.tsx
│   │   ├── texture-compare/page.tsx
│   │   ├── texel-density/page.tsx
│   │   ├── shader-math/page.tsx            # gráfica 1D con Recharts
│   │   └── color/page.tsx
│   ├── projects/page.tsx                   # CRUD + export/import JSON
│   └── globals.css
├── components/
│   └── VerifyBanner.tsx                    # botón "Verificar con API"
├── lib/
│   └── api.ts                              # cliente HTTP tipado
├── Dockerfile                              # multistage con salida standalone
├── next.config.mjs
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## Variables de entorno

- `NEXT_PUBLIC_API_BASE_URL` — URL del backend. Por defecto `http://localhost:8000`.

## Local

```bash
# Con calc-core ya construido (npm run build en ../calc-core).
npm install
npm run dev       # http://localhost:3000
npm run build     # Bundle standalone en .next/standalone
```

## Paridad cliente/servidor

Cada calculadora tiene un botón "Verificar con API": envía el mismo payload al
endpoint del backend y compara el resultado. Verde si coincide, ámbar si
diverge (para depurar durante desarrollo).
