import { describe, expect, it } from "vitest";
import {
  hexToRgb,
  linearToSrgb,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  srgbToLinear,
} from "../src/color/convert";
import { InvalidInputError } from "../src/errors";
import { expectClose, loadCases } from "./helpers";

describe("color.convert (shared-tests)", () => {
  for (const c of loadCases("color.convert")) {
    it(c.id, () => {
      const i = c.input as any;
      const e = c.expected as any;

      if (i.direction === "linearToSrgb") {
        expectClose(linearToSrgb(i.linear), e.srgb, c.tolerance);
      } else if (i.direction === "srgbToLinear") {
        expectClose(srgbToLinear(i.srgb), e.linear, c.tolerance);
      } else {
        const rgb = i.rgb ?? hexToRgb(i.hex);
        if (e.rgb) expect(rgb).toEqual(e.rgb);
        if (e.hex) expect(rgbToHex(rgb)).toBe(e.hex);
        const hsl = rgbToHsl(rgb);
        expectClose(hsl.h, e.hsl.h, 1e-9);
        expectClose(hsl.s, e.hsl.s, 1e-9);
        expectClose(hsl.l, e.hsl.l, 1e-9);
      }
    });
  }
});

describe("color round-trips y validación", () => {
  it("hslToRgb invierte rgbToHsl en colores no triviales", () => {
    for (const rgb of [
      { r: 50, g: 168, b: 82 },
      { r: 12, g: 34, b: 250 },
      { r: 128, g: 128, b: 128 },
      { r: 255, g: 255, b: 255 },
      { r: 0, g: 0, b: 0 },
    ]) {
      expect(hslToRgb(rgbToHsl(rgb))).toEqual(rgb);
    }
  });

  it("linear -> sRGB -> linear es identidad dentro de tolerancia", () => {
    for (const x of [0, 0.001, 0.0031308, 0.02, 0.18, 0.5, 1]) {
      expectClose(srgbToLinear(linearToSrgb(x)), x, 1e-9);
    }
  });

  it("hexToRgb acepta #RGB, sin '#' y minúsculas", () => {
    expect(hexToRgb("#0f8")).toEqual({ r: 0, g: 255, b: 136 });
    expect(hexToRgb("ff8000")).toEqual({ r: 255, g: 128, b: 0 });
    expect(hexToRgb("#aBcDeF")).toEqual({ r: 171, g: 205, b: 239 });
  });

  it.each(["#GGGGGG", "#12345", "", "#1234567"])("hexToRgb rechaza %j", (bad) => {
    expect(() => hexToRgb(bad)).toThrow(InvalidInputError);
  });

  it("rgbToHex rechaza canales fuera de 0..255 o no enteros", () => {
    expect(() => rgbToHex({ r: 256, g: 0, b: 0 })).toThrow(InvalidInputError);
    expect(() => rgbToHex({ r: 1.5, g: 0, b: 0 })).toThrow(InvalidInputError);
  });

  it("linearToSrgb/srgbToLinear rechazan valores fuera de [0,1]", () => {
    expect(() => linearToSrgb(-0.1)).toThrow(InvalidInputError);
    expect(() => srgbToLinear(1.1)).toThrow(InvalidInputError);
  });
});
