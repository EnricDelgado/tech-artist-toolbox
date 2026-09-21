import { describe, expect, it } from "vitest";
import { calculateTextureMemory } from "../src/texture/memory";
import { compareFormats } from "../src/texture/compare";
import { InvalidInputError } from "../src/errors";
import { loadCases } from "./helpers";

describe("texture.memory (shared-tests)", () => {
  for (const c of loadCases("texture.memory")) {
    it(c.id, () => {
      const result = calculateTextureMemory(c.input as any);
      expect(result.perTextureBytes).toBe(c.expected.perTextureBytes);
      expect(result.perTextureWithMipmapsBytes).toBe(c.expected.perTextureWithMipmapsBytes);
      expect(result.totalBytes).toBe(c.expected.totalBytes);
      expect(result.warnings).toEqual(c.expected.warnings);
      expect(result.formula).toEqual(expect.any(String));
    });
  }
});

describe("texture.compare (shared-tests)", () => {
  for (const c of loadCases("texture.compare")) {
    it(c.id, () => {
      const result = compareFormats(c.input as any);
      expect(Object.keys(result).sort()).toEqual(Object.keys(c.expected).sort());
      for (const [format, expected] of Object.entries<any>(c.expected)) {
        const actual = result[format as keyof typeof result];
        expect(actual.perTextureBytes, `${format} perTextureBytes`).toBe(expected.perTextureBytes);
        if (expected.perTextureWithMipmapsBytes !== undefined) {
          expect(actual.perTextureWithMipmapsBytes, `${format} withMipmaps`).toBe(
            expected.perTextureWithMipmapsBytes,
          );
        }
        expect(actual.totalBytes, `${format} totalBytes`).toBe(expected.totalBytes);
        // `note` en el JSON es documentación humana, no parte del contrato.
        expect(actual.warnings, `${format} warnings`).toEqual(expected.warnings ?? []);
      }
    });
  }
});

describe("texture validation", () => {
  const valid = { width: 256, height: 256, format: "RGBA32", mipmaps: false, count: 1 } as const;

  it.each([
    ["width", { ...valid, width: 0 }],
    ["width", { ...valid, width: 10.5 }],
    ["height", { ...valid, height: -4 }],
    ["count", { ...valid, count: 0 }],
    ["format", { ...valid, format: "PVRTC" as any }],
  ])("rechaza %s inválido con InvalidInputError", (field, input) => {
    try {
      calculateTextureMemory(input as any);
      expect.unreachable("debía lanzar");
    } catch (e) {
      expect(e).toBeInstanceOf(InvalidInputError);
      expect((e as InvalidInputError).field).toBe(field);
      expect((e as InvalidInputError).code).toBe("INVALID_INPUT");
    }
  });
});
