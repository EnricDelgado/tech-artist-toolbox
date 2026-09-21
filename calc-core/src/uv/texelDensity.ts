import { InvalidInputError, assertPositiveNumber } from "../errors";

export const LENGTH_UNITS = ["m", "unity", "inch"] as const;

export type LengthUnit = (typeof LENGTH_UNITS)[number];

/** Metros por unidad. 1 inch = 0.0254 m exacto por definición; 1 unidad de Unity = 1 m por convención. */
const METERS_PER_UNIT: Record<LengthUnit, number> = {
  m: 1,
  unity: 1,
  inch: 0.0254,
};

export interface TexelDensityInput {
  /** Resolución de la textura en el eje relevante (px). Opcional si se da `targetDensity`. */
  textureResolution?: number;
  /** Dimensión del objeto en ese eje, expresada en `unit`. */
  objectSize: number;
  unit: LengthUnit;
  /** Densidad objetivo en px por `unit`. Opcional si se da `textureResolution`. */
  targetDensity?: number;
}

export interface TexelDensityResult {
  /** Densidad en px por `unit` (la unidad de entrada). Presente si se dio `textureResolution`. */
  texelDensityPxPerUnit?: number;
  texelDensityPxPerMeter?: number;
  texelDensityPxPerInch?: number;
  /** Resolución que consigue `targetDensity`, redondeada a la potencia de dos más cercana. */
  recommendedResolution?: number;
  /** Densidad real (px por `unit`) con `recommendedResolution`. */
  resultingDensityPxPerUnit?: number;
}

/**
 * Potencia de dos más cercana a `x` en distancia lineal; los empates suben.
 * Para x < 1 devuelve 1.
 */
function nearestPowerOfTwo(x: number): number {
  if (x <= 1) return 1;
  let lower = 1;
  while (lower * 2 <= x) lower *= 2;
  const upper = lower * 2;
  return x - lower < upper - x ? lower : upper;
}

/**
 * Texel Density.
 *
 *   densidad (px/unit)  = textureResolution / objectSize
 *   densidad (px/m)     = densidad(px/unit) / metersPerUnit
 *   densidad (px/inch)  = densidad(px/unit) * (0.0254 / metersPerUnit)
 *
 * Si se da `targetDensity` (px/unit):
 *   recommendedResolution     = nearestPowerOfTwo(targetDensity * objectSize)
 *   resultingDensityPxPerUnit = recommendedResolution / objectSize
 *
 * @throws {InvalidInputError} si faltan datos, hay valores no positivos o `unit` es desconocida.
 */
export function calculateTexelDensity(input: TexelDensityInput): TexelDensityResult {
  const { textureResolution, objectSize, unit, targetDensity } = input;

  if (!Object.hasOwn(METERS_PER_UNIT, unit)) {
    throw new InvalidInputError(`unit must be one of ${LENGTH_UNITS.join(", ")}`, "unit");
  }
  assertPositiveNumber(objectSize, "objectSize");
  if (textureResolution === undefined && targetDensity === undefined) {
    throw new InvalidInputError("textureResolution or targetDensity is required", "textureResolution");
  }

  const result: TexelDensityResult = {};

  if (textureResolution !== undefined) {
    assertPositiveNumber(textureResolution, "textureResolution");
    const perUnit = textureResolution / objectSize;
    const metersPerUnit = METERS_PER_UNIT[unit];
    result.texelDensityPxPerUnit = perUnit;
    result.texelDensityPxPerMeter = perUnit / metersPerUnit;
    result.texelDensityPxPerInch = perUnit * (METERS_PER_UNIT.inch / metersPerUnit);
  }

  if (targetDensity !== undefined) {
    assertPositiveNumber(targetDensity, "targetDensity");
    const recommendedResolution = nearestPowerOfTwo(targetDensity * objectSize);
    result.recommendedResolution = recommendedResolution;
    result.resultingDensityPxPerUnit = recommendedResolution / objectSize;
  }

  return result;
}
