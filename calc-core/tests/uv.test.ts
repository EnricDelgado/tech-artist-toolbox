import { describe, expect, it } from "vitest";
import { calculateTexelDensity } from "../src/uv/texelDensity";
import { InvalidInputError } from "../src/errors";
import { expectClose, loadCases } from "./helpers";

describe("uv.texelDensity (shared-tests)", () => {
  for (const c of loadCases("uv.texelDensity")) {
    it(c.id, () => {
      const result: any = calculateTexelDensity(c.input as any);
      for (const [key, expected] of Object.entries<number>(c.expected)) {
        expect(result[key], `falta ${key} en el resultado`).toBeTypeOf("number");
        expectClose(result[key], expected, c.tolerance);
      }
    });
  }
});

describe("texel density validation", () => {
  it.each([
    ["objectSize", { textureResolution: 1024, objectSize: 0, unit: "m" }],
    ["textureResolution", { textureResolution: -1, objectSize: 2, unit: "m" }],
    ["targetDensity", { targetDensity: 0, objectSize: 2, unit: "m" }],
    ["unit", { textureResolution: 1024, objectSize: 2, unit: "furlong" }],
    ["textureResolution", { objectSize: 2, unit: "m" }],
  ])("rechaza %s inválido", (field, input) => {
    try {
      calculateTexelDensity(input as any);
      expect.unreachable("debía lanzar");
    } catch (e) {
      expect(e).toBeInstanceOf(InvalidInputError);
      expect((e as InvalidInputError).field).toBe(field);
    }
  });

  it("empate exacto entre potencias de dos redondea hacia arriba", () => {
    // 384 = punto medio entre 256 y 512
    const r = calculateTexelDensity({ objectSize: 1, unit: "m", targetDensity: 384 });
    expect(r.recommendedResolution).toBe(512);
  });
});
