"use client";

import { useMemo, useState } from "react";
import { calculateTextureMemory, TEXTURE_FORMATS } from "@tech-artist-toolbox/calc-core";
import { VerifyBanner } from "@/components/VerifyBanner";
import { api } from "@/lib/api";

function fmtBytes(b: number): string {
  if (b < 1024) return `${b} B`;
  if (b < 1024 ** 2) return `${(b / 1024).toFixed(2)} KiB`;
  if (b < 1024 ** 3) return `${(b / 1024 ** 2).toFixed(2)} MiB`;
  return `${(b / 1024 ** 3).toFixed(2)} GiB`;
}

export default function Page() {
  const [width, setWidth] = useState(1024);
  const [height, setHeight] = useState(1024);
  const [format, setFormat] = useState<(typeof TEXTURE_FORMATS)[number]>("RGBA32");
  const [mipmaps, setMipmaps] = useState(false);
  const [count, setCount] = useState(1);

  const result = useMemo(() => {
    try {
      return {
        ok: true as const,
        value: calculateTextureMemory({ width, height, format, mipmaps, count }),
      };
    } catch (e) {
      return { ok: false as const, error: (e as Error).message };
    }
  }, [width, height, format, mipmaps, count]);

  async function verify() {
    if (!result.ok) return { ok: false, detail: "El cálculo local es inválido." };
    const r = await api.textureMemory({ width, height, format, mipmaps, count });
    const local = result.value;
    const same =
      r.perTextureBytes === local.perTextureBytes &&
      r.perTextureWithMipmapsBytes === local.perTextureWithMipmapsBytes &&
      r.totalBytes === local.totalBytes;
    return {
      ok: same,
      detail: same
        ? undefined
        : `Local totalBytes=${local.totalBytes} API=${r.totalBytes}`,
    };
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Texture Memory Calculator</h1>
        <p className="text-slate-400 mt-1">
          Memoria estimada por textura y total. La fórmula depende del formato:
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Anchura (px)</label>
              <input type="number" min={1} className="input" value={width}
                     onChange={(e) => setWidth(parseInt(e.target.value || "0", 10))} />
            </div>
            <div>
              <label className="label">Altura (px)</label>
              <input type="number" min={1} className="input" value={height}
                     onChange={(e) => setHeight(parseInt(e.target.value || "0", 10))} />
            </div>
          </div>
          <div>
            <label className="label">Formato</label>
            <select className="input" value={format}
                    onChange={(e) => setFormat(e.target.value as any)}>
              {TEXTURE_FORMATS.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3 items-end">
            <div>
              <label className="label">Nº texturas</label>
              <input type="number" min={1} className="input" value={count}
                     onChange={(e) => setCount(parseInt(e.target.value || "1", 10))} />
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-300 mb-2">
              <input type="checkbox" checked={mipmaps} onChange={(e) => setMipmaps(e.target.checked)} />
              Cadena de mipmaps
            </label>
          </div>
        </div>

        <div className="card space-y-3">
          {result.ok ? (
            <>
              <div>
                <div className="label">Por textura</div>
                <div className="text-lg">{fmtBytes(result.value.perTextureBytes)}</div>
              </div>
              <div>
                <div className="label">Por textura con mipmaps</div>
                <div className="text-lg">{fmtBytes(result.value.perTextureWithMipmapsBytes)}</div>
              </div>
              <div>
                <div className="label">Total ({count} tex.)</div>
                <div className="text-2xl font-semibold text-accent-500">
                  {fmtBytes(result.value.totalBytes)}
                </div>
              </div>
              <div>
                <div className="label">Fórmula</div>
                <div className="formula">{result.value.formula}</div>
              </div>
              {result.value.warnings.length > 0 && (
                <ul className="text-sm text-amber-400 list-disc list-inside">
                  {result.value.warnings.map((w, i) => <li key={i}>{w}</li>)}
                </ul>
              )}
              <VerifyBanner verify={verify} />
            </>
          ) : (
            <p className="text-red-400">{result.error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
