# 002 — shared-tests/cases.json

**Fecha:** 20/09/2026
**Asistente:** Claude Code (Sonnet 5)
**Contexto:** Paso 3 del plan de `progreso-y-siguientes-pasos.md`. Antes de implementar `calc-core` o el backend, se fija en un JSON compartido cuál es el resultado correcto de cada fórmula, con referencia oficial por caso.
**Resultado:** `shared-tests/cases.json` — 5 secciones (`texture.memory`, `texture.compare`, `uv.texelDensity`, `shader.math`, `color.convert`), 27 casos en total, cada uno con `source` citando la referencia oficial. Casos de borde incluidos: padding a bloque en BC7/ASTC (4×4, 6×6, 8×8), redondeo no exacto del factor de mipmap (×4/3), extrapolación fuera de rango en `remap`/`lerp`, clamps de `smoothstep`, umbral sRGB en 0.0031308/0.04045, redondeo a potencia de dos en texel density.

## Prompt clave

> Vamos a crear `shared-tests/cases.json`. Es el JSON de casos de referencia
> que consumirán tanto los tests de `calc-core` (TS) como los del backend
> (Python). Léete `../definicion-inicial.md` §4 (secciones 4.1–4.5) y
> `shared-tests/README.md` antes de empezar. Genera un JSON con las cinco
> secciones (`texture.memory`, `texture.compare`, `uv.texelDensity`,
> `shader.math`, `color.convert`), mínimo 3 casos por sección, cada caso con
> `id`, `input`, `expected` y `source` citando la referencia oficial. Incluye
> casos de borde: ASTC con padding a bloque, sRGB en el umbral 0.0031308,
> mipmaps activos. No implementes ninguna función todavía — solo el JSON.

## Respuesta / acción de la IA

- Leyó `definicion-inicial.md` completo (no solo §4) para confirmar fórmulas,
  contrato de API y modelo de datos antes de generar casos.
- Calculó a mano cada valor esperado en vez de estimarlos, y en varios casos
  reescogió las dimensiones de entrada para que el resultado fuera exacto
  (evitar decimales periódicos que obligarían a tolerancia donde no hace
  falta). Ejemplo: `1536×1536` en vez de `1024×1024` para el caso de mipmaps
  de RGBA32, porque `1024×1024×4×4/3` no da un entero exacto y `1536` sí.
- Generó 9 casos en `texture.memory` (más de los 3 mínimos) para cubrir los
  tres formatos (RGBA32, BC7, ASTC en sus tres tamaños de bloque del MVP) con
  y sin mipmaps, y con padding.
- Añadió campo `tolerance` solo en los dos casos que dependen de la curva
  sRGB con potencia no entera (`linear-to-srgb-mid`), tal como permite
  `shared-tests/README.md`; el resto de casos sRGB en el umbral exacto no
  necesita tolerancia porque es una multiplicación/división simple.

## Análisis crítico

**Error detectado en el propio documento de definición.** El ejemplo de
contrato de API en `definicion-inicial.md` §9 (`POST /api/v1/texture/memory`
con `width=2048, height=2048, format=ASTC_6x6, mipmaps=true, count=4`) da
`perTextureBytes: 3355443`. Al recalcular con la fórmula del spec de Khronos
citada en el propio §4.1 (16 bytes por bloque de N×M texels), el valor
correcto es `1871424` bytes por textura sin mipmaps — el ejemplo del
documento implica una tasa de ~0,8 bytes/píxel, cuando ASTC 6×6 real es
16/36 ≈ 0,444 bytes/píxel. Es decir, el ejemplo ilustrativo que yo mismo
(la IA) generé en la sesión anterior al escribir `definicion-inicial.md` era
matemáticamente incorrecto, aunque "sonaba plausible".

Se decidió **no** replicar ese valor en `cases.json` — se documentó
explícitamente en el caso `astc6x6-1024-padding` como nota (`NOTE:` en el
campo `source`) para que quede constancia de la discrepancia, y se generaron
los casos de `ASTC_6x6` a partir de la fórmula real del spec, no del ejemplo
del documento.

Esto es exactamente el riesgo 1 (`Corrección de fórmulas de dominio`) que
`definicion-inicial.md` §12.3 anticipaba: "La IA puede generar cálculos
plausibles pero incorrectos. Mitigación: tests con valores de referencia
oficiales antes de dar cada módulo por hecho." El propio `cases.json` acaba
de detectar un error de ese tipo antes de que llegara a `calc-core` o al
backend — es la prueba de que el orden elegido (casos de referencia antes
que implementación) funciona como red de seguridad.

**Pendiente:** cuando se implemente `calc-core` (Paso 4), conviene corregir
también el ejemplo de `definicion-inicial.md` §9 para que no quede un valor
de referencia incorrecto en el documento de definición aceptado.

**Commit:** `feat(shared-tests): casos de referencia iniciales`.
