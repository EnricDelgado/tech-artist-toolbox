import { describe, expect, it } from "vitest";
import { lerp, remap, smoothstep } from "../src/shader/math";
import { InvalidInputError } from "../src/errors";
import { expectClose, loadCases } from "./helpers";

describe("shader.math (shared-tests)", () => {
  for (const c of loadCases("shader.math")) {
    it(c.id, () => {
      const i = c.input as any;
      let actual: number;
      switch (i.function) {
        case "lerp":
          actual = lerp(i.a, i.b, i.t);
          break;
        case "remap":
          actual = remap(i.value, i.inMin, i.inMax, i.outMin, i.outMax);
          break;
        case "smoothstep":
          actual = smoothstep(i.edge0, i.edge1, i.x);
          break;
        default:
          throw new Error(`función desconocida en cases.json: ${i.function}`);
      }
      expectClose(actual, c.expected.result, c.tolerance);
    });
  }
});

describe("shader.math degenerate ranges", () => {
  it("remap con inMin == inMax lanza InvalidInputError", () => {
    expect(() => remap(1, 5, 5, 0, 1)).toThrow(InvalidInputError);
  });

  it("smoothstep con edge0 == edge1 lanza InvalidInputError", () => {
    expect(() => smoothstep(2, 2, 1)).toThrow(InvalidInputError);
  });
});
