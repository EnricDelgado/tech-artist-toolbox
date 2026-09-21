import { InvalidInputError, assertFiniteNumber } from "../errors";

/**
 * Interpolación lineal, sin clamp de `t` (igual que HLSL `lerp` / GLSL `mix`).
 *
 *   lerp(a, b, t) = a + (b - a) * t
 *
 * Con t fuera de [0, 1] extrapola.
 */
export function lerp(a: number, b: number, t: number): number {
  assertFiniteNumber(a, "a");
  assertFiniteNumber(b, "b");
  assertFiniteNumber(t, "t");
  return a + (b - a) * t;
}

/**
 * Reasigna `value` del rango [inMin, inMax] al rango [outMin, outMax], sin clamp.
 *
 *   remap(v, inMin, inMax, outMin, outMax) = outMin + (v - inMin) / (inMax - inMin) * (outMax - outMin)
 *
 * @throws {InvalidInputError} si `inMin === inMax` (división por cero).
 */
export function remap(value: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
  assertFiniteNumber(value, "value");
  assertFiniteNumber(inMin, "inMin");
  assertFiniteNumber(inMax, "inMax");
  assertFiniteNumber(outMin, "outMin");
  assertFiniteNumber(outMax, "outMax");
  if (inMin === inMax) {
    throw new InvalidInputError("inMin and inMax must differ", "inMax");
  }
  return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
}

/**
 * Interpolación de Hermite (GLSL/HLSL `smoothstep`).
 *
 *   t = clamp((x - edge0) / (edge1 - edge0), 0, 1)
 *   smoothstep(edge0, edge1, x) = t * t * (3 - 2 * t)
 *
 * @throws {InvalidInputError} si `edge0 === edge1` (indefinido en la especificación GLSL).
 */
export function smoothstep(edge0: number, edge1: number, x: number): number {
  assertFiniteNumber(edge0, "edge0");
  assertFiniteNumber(edge1, "edge1");
  assertFiniteNumber(x, "x");
  if (edge0 === edge1) {
    throw new InvalidInputError("edge0 and edge1 must differ", "edge1");
  }
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}
