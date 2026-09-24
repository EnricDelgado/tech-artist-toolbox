"use client";

import { useMemo, useState } from "react";
import { compareFormats, TEXTURE_FORMATS } from "@tech-artist-toolbox/calc-core";
import { VerifyBanner } from "@/components/VerifyBanner";
import { api } from "@/lib/api";

function fmtBytes(b: number): string {
  if (b < 1024) return `${b} B`;
  if (b < 1024 ** 2) return `${(b / 1024).toFixed(2)} KiB`;
  return `${(b / 1024 ** 2).toFixed(2)} MiB`;
}

export default function Page() {
  const [width, setWidth] = useState(1024);
  const [height, setHeight] = useState(1024);
  const [mipmaps, setMipmaps] = useState(false);
  const [count, setCount] = useState(1);

  const result = useMemo(() => {
    try {
      return { ok: true as const, value: compareFormats({ width, height, mipmaps, count }) };
    } catch (e) {
      return { ok: false as const, error: (e as Error).message };
    }
  }, [width, height, mipmaps, count]);

  async function verify() {
    if (!result.ok) return { ok: false, detail: "El cálculo local es inválido." };
    const r = await api.textureCompare({ width, height, mipmaps, count });
    for (const f of TEXTURE_FORMATS) {
      if (r.results[f].totalBytes !== result.value[f].totalBytes) {
        return { ok: false, detail: `Divergencia en ${f}` };
      }
    }
    return { ok: true };
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Compression Comparator</h1>

      <div className="card grid grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <label className="label">Anchura</label>
          <input type="number" min={1} className="input" value={width}
                 onChange={(e) => setWidth(parseInt(e.target.value || "0", 10))} />
        </div>
        <div>
          <label className="label">Altura</label>
          <input type="number" min={1} className="input" value={height}
                 onChange={(e) => setHeight(parseInt(e.target.value || "0", 10))} />
        </div>
        <div>
          <label className="label">Nº texturas</label>
          <input type="number" min={1} className="input" value={count}
                 onChange={(e) => setCount(parseInt(e.target.value || "1", 10))} />
        </div>
        <label className="flex items-end pb-2 gap-2 text-sm text-slate-300">
          <input type="checkbox" checked={mipmaps} onChange={(e) => setMipmaps(e.target.checked)} />
          Con mipmaps
        </label>
      </div>

      {result.ok ? (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 border-b border-surface-800">
                <th className="py-2">Formato</th>
                <th className="py-2">Por textura</th>
                <th className="py-2">Con mipmaps</th>
                <th className="py-2">Total</th>
                <th className="py-2">Notas</th>
              </tr>
            </thead>
            <tbody>
              {TEXTURE_FORMATS.map((f) => {
                const r = result.value[f];
                return (
                  <tr key={f} className="border-b border-surface-800/60">
                    <td className="py-2 font-mono text-accent-500">{f}</td>
                    <td className="py-2">{fmtBytes(r.perTextureBytes)}</td>
                    <td className="py-2">{fmtBytes(r.perTextureWithMipmapsBytes)}</td>
                    <td className="py-2 font-medium">{fmtBytes(r.totalBytes)}</td>
                    <td className="py-2 text-amber-400">{r.warnings.join("; ")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="mt-4">
            <VerifyBanner verify={verify} />
          </div>
        </div>
      ) : (
        <p className="text-red-400">{result.error}</p>
      )}
    </div>
  );
}
