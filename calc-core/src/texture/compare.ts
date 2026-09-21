import {
  TEXTURE_FORMATS,
  calculateTextureMemory,
  type TextureFormat,
  type TextureMemoryInput,
  type TextureMemoryResult,
} from "./memory";

export type CompareInput = Omit<TextureMemoryInput, "format">;

export type CompareResult = Record<TextureFormat, TextureMemoryResult>;

/**
 * Compression Comparator: la misma textura evaluada en todos los formatos del MVP.
 * Reutiliza `calculateTextureMemory`, de modo que cualquier corrección de la
 * fórmula por formato se refleja aquí sin duplicar lógica.
 */
export function compareFormats(input: CompareInput): CompareResult {
  const entries = TEXTURE_FORMATS.map((format) => [format, calculateTextureMemory({ ...input, format })] as const);
  return Object.fromEntries(entries) as CompareResult;
}
