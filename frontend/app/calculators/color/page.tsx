"use client";

import { useMemo, useState } from "react";
import {
  hexToRgb,
  hslToRgb,
  linearToSrgb,
  rgbToHex,
  rgbToHsl,
  srgbToLinear,
} from "@tech-artist-toolbox/calc-core";

export default function Page() {
  const [hex, setHex] = useState("#6EE7B7");
  const [linear, setLinear] = useState(0.5);

  const rgb = useMemo(() => {
    try { return hexToRgb(hex); } catch { return null; }
  }, [hex]);
  const hsl = useMemo(() => (rgb ? rgbToHsl(rgb) : null), [rgb]);
  const roundtripRgb = useMemo(() => (hsl ? hslToRgb(hsl) : null), [hsl]);

  const srgb = useMemo(() => {
    try { return linearToSrgb(linear); } catch { return null; }
  }, [linear]);
  const backLinear = useMemo(() => (srgb !== null ? srgbToLinear(srgb) : null), [srgb]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Color</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card space-y-3">
          <h2 className="text-lg font-medium">RGB / HEX / HSL</h2>
          <div>
            <label className="label">HEX</label>
            <input className="input" value={hex} onChange={(e) => setHex(e.target.value)} />
          </div>
          {rgb ? (
            <>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div><div className="label">R</div><div>{rgb.r}</div></div>
                <div><div className="label">G</div><div>{rgb.g}</div></div>
                <div><div className="label">B</div><div>{rgb.b}</div></div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div><div className="label">H</div><div>{hsl!.h.toFixed(1)}°</div></div>
                <div><div className="label">S</div><div>{hsl!.s.toFixed(1)}%</div></div>
                <div><div className="label">L</div><div>{hsl!.l.toFixed(1)}%</div></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded border border-surface-700"
                     style={{ backgroundColor: rgbToHex(rgb) }} />
                <span className="formula">round-trip: {rgbToHex(roundtripRgb!)}</span>
              </div>
            </>
          ) : (
            <p className="text-red-400 text-sm">Formato HEX inválido.</p>
          )}
        </div>

        <div className="card space-y-3">
          <h2 className="text-lg font-medium">linear ↔ sRGB (IEC 61966-2-1)</h2>
          <div>
            <label className="label">Linear ∈ [0, 1]</label>
            <input type="number" min={0} max={1} step={0.01} className="input"
                   value={linear} onChange={(e) => setLinear(parseFloat(e.target.value || "0"))} />
          </div>
          {srgb !== null ? (
            <>
              <div>
                <div className="label">sRGB</div>
                <div className="text-xl">{srgb.toFixed(6)}</div>
              </div>
              <div>
                <div className="label">round-trip linear</div>
                <div className="text-sm">{backLinear?.toFixed(9)}</div>
              </div>
              <div>
                <div className="label">Fórmula (linear &gt; 0.0031308)</div>
                <div className="formula">srgb = 1.055 · linear^(1/2.4) − 0.055</div>
              </div>
            </>
          ) : (
            <p className="text-red-400 text-sm">Valor fuera de [0, 1].</p>
          )}
        </div>
      </div>
    </div>
  );
}
