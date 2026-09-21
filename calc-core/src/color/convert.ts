import { InvalidInputError, assertFiniteNumber } from "../errors";

export interface Rgb {
  r: number;
  g: number;
  b: number;
}

/** h en grados [0, 360); s y l en porcentaje [0, 100]. */
export interface Hsl {
  h: number;
  s: number;
  l: number;
}

function assertChannel(value: unknown, field: string): asserts value is number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value > 255) {
    throw new InvalidInputError(`${field} must be an integer between 0 and 255`, field);
  }
}

function assertRgb(rgb: Rgb): void {
  assertChannel(rgb.r, "r");
  assertChannel(rgb.g, "g");
  assertChannel(rgb.b, "b");
}

/** RGB (0..255 enteros) a HEX en mayúsculas: `#RRGGBB`. */
export function rgbToHex(rgb: Rgb): string {
  assertRgb(rgb);
  const part = (n: number) => n.toString(16).padStart(2, "0").toUpperCase();
  return `#${part(rgb.r)}${part(rgb.g)}${part(rgb.b)}`;
}

/** HEX a RGB. Acepta `#RRGGBB`, `#RGB`, con o sin `#`, en mayúsculas o minúsculas. */
export function hexToRgb(hex: string): Rgb {
  const match = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.exec(typeof hex === "string" ? hex.trim() : "");
  if (!match) {
    throw new InvalidInputError("hex must be #RGB or #RRGGBB", "hex");
  }
  let digits = match[1]!;
  if (digits.length === 3) {
    digits = digits
      .split("")
      .map((c) => c + c)
      .join("");
  }
  return {
    r: parseInt(digits.slice(0, 2), 16),
    g: parseInt(digits.slice(2, 4), 16),
    b: parseInt(digits.slice(4, 6), 16),
  };
}

/**
 * RGB a HSL (CSS Color Module Level 3, §7.2 / 4.2.4).
 *
 *   l = (max + min) / 2
 *   s = d / (1 - |2l - 1|)          con d = max - min  (0 si d = 0)
 *   h = 60 * segmento según el canal máximo
 *
 * Devuelve valores sin redondear.
 */
export function rgbToHsl(rgb: Rgb): Hsl {
  assertRgb(rgb);
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  const l = (max + min) / 2;

  if (d === 0) return { h: 0, s: 0, l: l * 100 };

  const s = d / (1 - Math.abs(2 * l - 1));
  let h: number;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  h *= 60;
  if (h < 0) h += 360;

  return { h, s: s * 100, l: l * 100 };
}

/** HSL a RGB (enteros 0..255, redondeados al más cercano). Inversa de `rgbToHsl`. */
export function hslToRgb(hsl: Hsl): Rgb {
  assertFiniteNumber(hsl.h, "h");
  assertFiniteNumber(hsl.s, "s");
  assertFiniteNumber(hsl.l, "l");
  if (hsl.s < 0 || hsl.s > 100) throw new InvalidInputError("s must be between 0 and 100", "s");
  if (hsl.l < 0 || hsl.l > 100) throw new InvalidInputError("l must be between 0 and 100", "l");

  const h = ((hsl.h % 360) + 360) % 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r1: number, g1: number, b1: number;
  if (h < 60) [r1, g1, b1] = [c, x, 0];
  else if (h < 120) [r1, g1, b1] = [x, c, 0];
  else if (h < 180) [r1, g1, b1] = [0, c, x];
  else if (h < 240) [r1, g1, b1] = [0, x, c];
  else if (h < 300) [r1, g1, b1] = [x, 0, c];
  else [r1, g1, b1] = [c, 0, x];

  const to255 = (v: number) => Math.round((v + m) * 255);
  return { r: to255(r1), g: to255(g1), b: to255(b1) };
}

function assertUnit(value: unknown, field: string): asserts value is number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > 1) {
    throw new InvalidInputError(`${field} must be a number between 0 and 1`, field);
  }
}

/**
 * Linear a sRGB, curva IEC 61966-2-1 (no la aproximación pow(2.2)).
 *
 *   linear <= 0.0031308:  srgb = linear * 12.92
 *   linear >  0.0031308:  srgb = 1.055 * linear^(1/2.4) - 0.055
 */
export function linearToSrgb(linear: number): number {
  assertUnit(linear, "linear");
  return linear <= 0.0031308 ? linear * 12.92 : 1.055 * Math.pow(linear, 1 / 2.4) - 0.055;
}

/**
 * sRGB a linear, curva IEC 61966-2-1.
 *
 *   srgb <= 0.04045:  linear = srgb / 12.92
 *   srgb >  0.04045:  linear = ((srgb + 0.055) / 1.055)^2.4
 */
export function srgbToLinear(srgb: number): number {
  assertUnit(srgb, "srgb");
  return srgb <= 0.04045 ? srgb / 12.92 : Math.pow((srgb + 0.055) / 1.055, 2.4);
}
