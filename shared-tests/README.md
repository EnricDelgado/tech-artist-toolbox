# shared-tests

Casos de referencia consumidos por `calc-core` (TypeScript) y por el backend
(Python). Su objetivo es garantizar paridad numérica entre las dos
implementaciones de las fórmulas.

Formato: un único `cases.json` con esta forma (borrador):

```json
{
  "texture.memory": [
    {
      "id": "rgba32-1024-no-mip",
      "input": { "width": 1024, "height": 1024, "format": "RGBA32", "mipmaps": false, "count": 1 },
      "expected": { "perTextureBytes": 4194304, "totalBytes": 4194304 },
      "source": "RGBA32 = 4 bytes/pixel · 1024·1024·4 = 4194304"
    }
  ]
}
```

Reglas:

- Cada caso lleva `source` con la referencia oficial que respalda el valor
  esperado (spec Khronos ASTC, DXGI para BC7, IEC 61966-2-1 para sRGB, etc.).
- Los tests de TS y los de Python cargan este mismo JSON.
- Se acepta tolerancia numérica solo en cálculos con curva sRGB
  (documentada en cada caso).

`cases.json` se genera en el siguiente hito.
