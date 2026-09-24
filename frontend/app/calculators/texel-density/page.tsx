"use client";

import { useMemo, useState } from "react";
import { calculateTexelDensity, LENGTH_UNITS } from "@tech-artist-toolbox/calc-core";
import { VerifyBanner } from "@/components/VerifyBanner";
import { api } from "@/lib/api";

export default function Page() {
  const [textureResolution, setTextureResolution] = useState<number>(1024);
  const [objectSize, setObjectSize] = useState<number>(2);
  const [unit, setUnit] = useState<(typeof LENGTH_UNITS)[number]>("m");
  const [useTarget, setUseTarget] = useState(false);
  const [targetDensity, setTargetDensity] = useState<number>(500);

  const result = useMemo(() => {
    try {
      return {
        ok: true as const,
        value: calculateTexelDensity({
          textureResolution: useTarget ? undefined : textureResolution,
          objectSize,
          unit,
          targetDensity: useTarget ? targetDensity : undefined,
        }),
      };
    } catch (e) {
      return { ok: false as const, error: (e as Error).message };
    }
  }, [textureResolution, objectSize, unit, useTarget, targetDensity]);

  async function verify() {
    if (!result.ok) return { ok: false, detail: "El cálculo local es inválido." };
    const r = await api.texelDensity({
      textureResolution: useTarget ? undefined : textureResolution,
      objectSize,
      unit,
      targetDensity: useTarget ? targetDensity : undefined,
    });
    if (useTarget) {
      const same = r.recommendedResolution === result.value.recommendedResolution;
      return { ok: same };
    }
    const local = result.value.texelDensityPxPerUnit ?? -1;
    const remote = r.texelDensityPxPerUnit ?? -2;
    const same = Math.abs(local - remote) < 1e-6;
    return { ok: same, detail: same ? undefined : `local=${local} api=${remote}` };
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Texel Density</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card space-y-4">
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input type="checkbox" checked={useTarget} onChange={(e) => setUseTarget(e.target.checked)} />
            Calcular resolución recomendada a partir de densidad objetivo
          </label>

          {!useTarget && (
            <div>
              <label className="label">Resolución de textura (px)</label>
              <input type="number" min={1} className="input" value={textureResolution}
                     onChange={(e) => setTextureResolution(parseInt(e.target.value || "0", 10))} />
            </div>
          )}

          <div>
            <label className="label">Dimensión del objeto</label>
            <input type="number" min={0.0001} step="any" className="input" value={objectSize}
                   onChange={(e) => setObjectSize(parseFloat(e.target.value || "0"))} />
          </div>
          <div>
            <label className="label">Unidad</label>
            <select className="input" value={unit} onChange={(e) => setUnit(e.target.value as any)}>
              {LENGTH_UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>

          {useTarget && (
            <div>
              <label className="label">Densidad objetivo (px por {unit})</label>
              <input type="number" min={0.0001} step="any" className="input" value={targetDensity}
                     onChange={(e) => setTargetDensity(parseFloat(e.target.value || "0"))} />
            </div>
          )}
        </div>

        <div className="card space-y-3">
          {result.ok ? (
            <>
              {result.value.texelDensityPxPerUnit !== undefined && (
                <>
                  <div>
                    <div className="label">Densidad (px por {unit})</div>
                    <div className="text-2xl font-semibold text-accent-500">
                      {result.value.texelDensityPxPerUnit.toFixed(2)}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="label">px/m</div>
                      <div>{result.value.texelDensityPxPerMeter?.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="label">px/inch</div>
                      <div>{result.value.texelDensityPxPerInch?.toFixed(4)}</div>
                    </div>
                  </div>
                </>
              )}
              {result.value.recommendedResolution !== undefined && (
                <div>
                  <div className="label">Resolución recomendada (potencia de 2)</div>
                  <div className="text-2xl font-semibold text-accent-500">
                    {result.value.recommendedResolution} px
                  </div>
                  <div className="text-sm text-slate-400">
                    Densidad real: {result.value.resultingDensityPxPerUnit?.toFixed(2)} px/{unit}
                  </div>
                </div>
              )}
              <div>
                <div className="label">Fórmula</div>
                <div className="formula">densidad = resolución / dimensión_objeto</div>
              </div>
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
