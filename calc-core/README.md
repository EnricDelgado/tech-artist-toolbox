# calc-core

Fórmulas compartidas de Tech Artist Toolbox, en TypeScript.

Este paquete es la única fuente de verdad para los cálculos que se ejecutan
en cliente. La misma lógica se implementa en Python dentro del backend, y
ambas se validan contra los casos de `../shared-tests/cases.json`.

Módulos previstos:

- `texture/memory.ts` — Texture Memory Calculator.
- `texture/compare.ts` — Compression Comparator.
- `uv/texelDensity.ts` — Texel Density.
- `shader/math.ts` — remap, smoothstep, lerp.
- `color/convert.ts` — RGB/HEX/HSL y linear/sRGB.

Se genera como primer módulo del MVP.
