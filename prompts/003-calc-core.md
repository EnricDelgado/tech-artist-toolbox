# 003 — calc-core (TypeScript)

**Fecha:** 21/09/2026
**Asistente:** Claude Code (Sonnet 5 → Opus 4.7 al final de la sesión)
**Contexto:** Paso 4 del plan (`progreso-y-siguientes-pasos.md`). Primer código funcional del MVP: el paquete `calc-core` con las cinco fórmulas del §4 de `definicion-inicial.md`, validado contra los 27 casos de `shared-tests/cases.json` cerrados en la sesión 002.
**Resultado:** `calc-core/` con `package.json`, `tsconfig.json`, `tsup.config.ts`, 6 módulos de código (`errors`, `texture/memory`, `texture/compare`, `uv/texelDensity`, `shader/math`, `color/convert`, `index`) y 4 archivos de tests. 49 tests verdes, typecheck limpio, bundle ESM + `.d.ts` generado con tsup. Commit pendiente al final de la sesión.

## Prompt clave

> Vamos a implementar `calc-core`, el paquete TypeScript con las fórmulas
> compartidas. Léete `../definicion-inicial.md` §4 y §6, y `calc-core/README.md`.
> Los tests deben cargar `../shared-tests/cases.json` (ya existente) y
> validar todos los casos. Empieza por `package.json` con TypeScript + Vitest,
> `tsconfig.json`, y `src/index.ts`. Luego implementa módulo a módulo, tests
> primero. Muestra la fórmula usada en el JSDoc de cada función. Para
> Compression Comparator, reutiliza la lógica de `texture/memory.ts`.

## Cronología resumida

1. Instalación de dependencias: `typescript@5`, `vitest`, `tsup`, `@types/node` (dev only).
2. Config: `tsconfig.json` estricto (`strict`, `noUncheckedIndexedAccess`, `noImplicitOverride`),
   `tsup` con formato ESM + `dts`.
3. **Tests primero**, uno por módulo (`texture.test.ts`, `uv.test.ts`, `shader.test.ts`,
   `color.test.ts`) y un helper `tests/helpers.ts` que lee `../../shared-tests/cases.json`
   una sola vez y ofrece `loadCases(section)` + `expectClose(actual, expected, tolerance)`.
   Se ejecutan en rojo (los módulos no existen todavía) — confirma que los tests fallan
   por la razón correcta y no por otro motivo antes de tocar la implementación.
4. Implementación módulo a módulo. Todos los tests verdes a la primera:
   `49 passed`, `tsc --noEmit` limpio, `tsup` genera `dist/index.js` (8.4 KB) y
   `dist/index.d.ts` (6.3 KB).
5. Mutation check manual: cambio temporal `Math.floor(x*4/3)` → `Math.round(x*4/3)` en
   el cálculo de mipmaps; los tests siguen en 49/49 verde. Ver "Análisis crítico".

## Decisiones de diseño relevantes

- **`InvalidInputError` con `{ code: "INVALID_INPUT", field, message }`.** La forma coincide
  exactamente con el contrato de error definido en `definicion-inicial.md` §4.7, de modo
  que el backend podrá traducirlo a 422 sin transformaciones.
- **Tabla `FORMAT_SPECS` como única fuente de verdad** para memoria de texturas y
  Compression Comparator. `compareFormats` reutiliza `calculateTextureMemory`; imposible
  que ambas se desincronicen.
- **`noUncheckedIndexedAccess: true`.** Elegido porque estos módulos leen mucho de tablas
  indexadas por enum (`FORMAT_SPECS[format]`, `METERS_PER_UNIT[unit]`). El flag empuja a
  validar la clave antes con `Object.hasOwn`, que además da el error de dominio correcto
  (`InvalidInputError` con `field` bien nombrado) en vez de un `undefined` silencioso.
- **`nearestPowerOfTwo` con desempate hacia arriba.** No lo obliga `shared-tests/cases.json`
  (el caso `td-target-density-pow2` está construido para no ser un empate: 400 está más
  cerca de 512 que de 256). Se dejó documentado en un test específico (`empate exacto entre
  potencias de dos redondea hacia arriba`, entrada 384 entre 256 y 512 → 512), para que la
  convención quede fijada y el port a Python la respete.
- **Round-trip como test propio.** Un test comprueba que `srgbToLinear(linearToSrgb(x)) ≈ x`
  para varios puntos, incluyendo el umbral 0.0031308. Esto valida la implementación de una
  forma independiente del valor esperado escrito en `cases.json`, que fue calculado a mano.

## Análisis crítico

**Bien.**

- Al escribir los tests antes de la implementación se detectó que el JSON de casos
  compartidos no incluía tests de validación (solo casos de "camino feliz"). Se añadieron
  bloques `describe("… validation")` en cada test file para cubrir `InvalidInputError`
  con distintos campos, sin tocar `cases.json`. Este tipo de cobertura complementa lo
  compartido con Python, en vez de duplicarlo.
- La reutilización de `calculateTextureMemory` en `compareFormats` evitó copiar la fórmula
  de cinco formatos; y el test de `texture.compare` valida los cinco de una vez.
- La corrección numérica de todos los casos de referencia (incluidos los de borde:
  padding a bloque en BC7 y ASTC 6×6/8×8, umbral sRGB 0.0031308/0.04045, clamps de
  `smoothstep`, extrapolación de `remap`/`lerp`) coincide con lo previsto en el JSON:
  49 tests verdes a la primera.

**Regular / a mejorar.**

- **La mutación `floor → round` en el cálculo de mipmaps no rompe ningún test.** Con
  262144 × 4/3 = 349525.33, tanto `Math.floor` como `Math.round` dan 349525, y ese es el
  único caso de `shared-tests/cases.json` con resto no entero en el factor 4/3. Los tests
  validan el número esperado, pero no distinguen entre las dos políticas de redondeo.
  Convendría añadir a `cases.json` un caso adicional donde `floor` y `round` difieran
  (por ejemplo, un tamaño cuyo resultado × 4/3 acabe en `.5` o superior). Anotado como
  deuda para el Paso 5 (backend), donde se replicará la misma fórmula en Python y donde
  esta ambigüedad podría manifestarse como divergencia cliente/servidor si no se documenta.
- **`@types/node` se instaló como devDependency solo por Vitest y por el `readFileSync`
  del helper de tests.** El código de `src/` no lo necesita — es puro TS. Si en el futuro
  `calc-core` se publica como paquete npm consumible por el frontend, hay que verificar
  que el bundle ESM no arrastra referencias a `node:*`.
- **Convención `NNN-<tema>.md` reevaluar.** Este archivo (`003-*.md`) sigue la convención,
  pero el `001` sigue viviendo dentro de `000-definicion-inicial.md` (dos entradas en un
  fichero) — inconsistencia arrastrada de la sesión inicial. No se corrige aquí para no
  ampliar el alcance de esta sesión; queda como pendiente menor.

**Pendiente derivado.**

- Añadir caso de `cases.json` que distinga `floor` de `round` en la fórmula de mipmaps.
- Al implementar el backend (Paso 5), replicar la misma tabla `FORMAT_SPECS` en Python
  y validar contra los mismos 27 casos; documentar en `prompts/004-backend.md` cualquier
  divergencia que aparezca.
- Corregir el ejemplo ASTC_6×6 de `definicion-inicial.md` §9 (ver `prompts/002-shared-tests.md`).

**Commit:** `feat(calc-core): fórmulas y tests iniciales`.
