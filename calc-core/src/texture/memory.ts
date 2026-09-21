import { InvalidInputError, assertPositiveInteger } from "../errors";

export const TEXTURE_FORMATS = ["RGBA32", "BC7", "ASTC_4x4", "ASTC_6x6", "ASTC_8x8"] as const;

export type TextureFormat = (typeof TEXTURE_FORMATS)[number];

export interface TextureMemoryInput {
  width: number;
  height: number;
  format: TextureFormat;
  mipmaps: boolean;
  /** Número de texturas idénticas. */
  count: number;
}

export interface TextureMemoryResult {
  /** Bytes de una textura sin mipmaps (con padding a bloque si aplica). */
  perTextureBytes: number;
  /** Bytes de una textura con cadena de mipmaps; igual a `perTextureBytes` si `mipmaps` es false. */
  perTextureWithMipmapsBytes: number;
  totalBytes: number;
  formula: string;
  warnings: string[];
}

interface FormatSpec {
  /** Texels por bloque en X e Y. Para RGBA32 (sin comprimir) el "bloque" es 1x1. */
  blockWidth: number;
  blockHeight: number;
  bytesPerBlock: number;
}

/**
 * Tabla de formatos.
 * - RGBA32: 4 bytes por píxel (Microsoft DXGI_FORMAT_R8G8B8A8).
 * - BC7: 16 bytes por bloque de 4x4 texels (Microsoft DXGI, BC7).
 * - ASTC NxM: 16 bytes por bloque de NxM texels, con independencia del tamaño de bloque
 *   (Khronos ASTC Specification).
 */
const FORMAT_SPECS: Record<TextureFormat, FormatSpec> = {
  RGBA32: { blockWidth: 1, blockHeight: 1, bytesPerBlock: 4 },
  BC7: { blockWidth: 4, blockHeight: 4, bytesPerBlock: 16 },
  ASTC_4x4: { blockWidth: 4, blockHeight: 4, bytesPerBlock: 16 },
  ASTC_6x6: { blockWidth: 6, blockHeight: 6, bytesPerBlock: 16 },
  ASTC_8x8: { blockWidth: 8, blockHeight: 8, bytesPerBlock: 16 },
};

const FORMULAS: Record<TextureFormat, string> = {
  RGBA32: "w * h * 4 bytes",
  BC7: "ceil(w/4) * ceil(h/4) * 16 bytes",
  ASTC_4x4: "ceil(w/4) * ceil(h/4) * 16 bytes",
  ASTC_6x6: "ceil(w/6) * ceil(h/6) * 16 bytes",
  ASTC_8x8: "ceil(w/8) * ceil(h/8) * 16 bytes",
};

/**
 * Memoria estimada de una o varias texturas.
 *
 * Fórmula por textura (sin mipmaps):
 *   bytes = ceil(width / blockW) * ceil(height / blockH) * bytesPerBlock
 * Con mipmaps (cadena completa, aproximación geométrica 1 + 1/4 + 1/16 + ... = 4/3):
 *   bytesConMips = floor(bytes * 4 / 3)
 * Total:
 *   total = (mipmaps ? bytesConMips : bytes) * count
 *
 * El redondeo `floor` del factor 4/3 está fijado por `shared-tests/cases.json`
 * (caso `compare-768-mipmaps`, ASTC_6x6).
 *
 * @throws {InvalidInputError} si `width`, `height` o `count` no son enteros >= 1 o `format` es desconocido.
 */
export function calculateTextureMemory(input: TextureMemoryInput): TextureMemoryResult {
  const { width, height, format, mipmaps, count } = input;
  assertPositiveInteger(width, "width");
  assertPositiveInteger(height, "height");
  assertPositiveInteger(count, "count");
  if (!Object.hasOwn(FORMAT_SPECS, format)) {
    throw new InvalidInputError(`format must be one of ${TEXTURE_FORMATS.join(", ")}`, "format");
  }

  const spec = FORMAT_SPECS[format];
  const blocksX = Math.ceil(width / spec.blockWidth);
  const blocksY = Math.ceil(height / spec.blockHeight);
  const perTextureBytes = blocksX * blocksY * spec.bytesPerBlock;
  const perTextureWithMipmapsBytes = mipmaps ? Math.floor((perTextureBytes * 4) / 3) : perTextureBytes;
  const totalBytes = perTextureWithMipmapsBytes * count;

  const warnings: string[] = [];
  const paddedWidth = blocksX * spec.blockWidth;
  const paddedHeight = blocksY * spec.blockHeight;
  if (paddedWidth !== width || paddedHeight !== height) {
    warnings.push(`dimensions padded to ${paddedWidth}x${paddedHeight} block-aligned size`);
  }

  return {
    perTextureBytes,
    perTextureWithMipmapsBytes,
    totalBytes,
    formula: mipmaps ? `${FORMULAS[format]}; mipmaps ≈ ×4/3` : FORMULAS[format],
    warnings,
  };
}
