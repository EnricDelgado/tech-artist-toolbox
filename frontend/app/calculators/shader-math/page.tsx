"use client";

import { useMemo, useState } from "react";
import { lerp, remap, smoothstep } from "@tech-artist-toolbox/calc-core";
import { VerifyBanner } from "@/components/VerifyBanner";
import { api } from "@/lib/api";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Fn = "lerp" | "remap" | "smoothstep";

const HLSL: Record<Fn, string> = {
  lerp: "float y = lerp(a, b, t);",
  remap: "float y = outMin + (v - inMin) / (inMax - inMin) * (outMax - outMin);",
  smoothstep: "float y = smoothstep(edge0, edge1, x);",
};

function evaluate(fn: Fn, params: Record<string, number>, xValue: number): number {
  if (fn === "lerp") return lerp(params.a, params.b, xValue);
  if (fn === "smoothstep") return smoothstep(params.edge0, params.edge1, xValue);
  return remap(xValue, params.inMin, params.inMax, params.outMin, params.outMax);
}

export default function Page() {
  const [fn, setFn] = useState<Fn>("smoothstep");
  const [a, setA] = useState(0);
  const [b, setB] = useState(10);
  const [t, setT] = useState(0.5);
  const [edge0, setEdge0] = useState(0);
  const [edge1, setEdge1] = useState(1);
  const [x, setX] = useState(0.5);
  const [inMin, setInMin] = useState(0);
  const [inMax, setInMax] = useState(1);
  const [outMin, setOutMin] = useState(0);
  const [outMax, setOutMax] = useState(1);
  const [value, setValue] = useState(0.5);

  const params: Record<string, number> = { a, b, t, edge0, edge1, x, inMin, inMax, outMin, outMax, value };

  const output = useMemo(() => {
    try {
      let y: number;
      if (fn === "lerp") y = lerp(a, b, t);
      else if (fn === "smoothstep") y = smoothstep(edge0, edge1, x);
      else y = remap(value, inMin, inMax, outMin, outMax);
      return { ok: true as const, value: y };
    } catch (e) {
      return { ok: false as const, error: (e as Error).message };
    }
  }, [fn, a, b, t, edge0, edge1, x, inMin, inMax, outMin, outMax, value]);

  const chartData = useMemo(() => {
    // Barrido en el rango relevante.
    const [xMin, xMax] =
      fn === "lerp"
        ? [0, 1]
        : fn === "smoothstep"
          ? [Math.min(edge0, edge1) - 0.2, Math.max(edge0, edge1) + 0.2]
          : [Math.min(inMin, inMax) - 0.1, Math.max(inMin, inMax) + 0.1];
    const N = 128;
    const data: { x: number; y: number }[] = [];
    for (let i = 0; i <= N; i++) {
      const xv = xMin + ((xMax - xMin) * i) / N;
      try {
        data.push({ x: xv, y: evaluate(fn, params, xv) });
      } catch { /* rango degenerado, se ignora */ }
    }
    return data;
  }, [fn, params]);

  async function verify() {
    if (!output.ok) return { ok: false, detail: "El cálculo local es inválido." };
    const payload =
      fn === "lerp"
        ? { function: fn, a, b, t }
        : fn === "smoothstep"
          ? { function: fn, edge0, edge1, x }
          : { function: fn, value, inMin, inMax, outMin, outMax };
    const r = await api.shaderMath(payload);
    const same = Math.abs(r.result - output.value) < 1e-9;
    return { ok: same, detail: same ? undefined : `local=${output.value} api=${r.result}` };
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Shader Math Playground</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card space-y-4">
          <div>
            <label className="label">Función</label>
            <select className="input" value={fn} onChange={(e) => setFn(e.target.value as Fn)}>
              <option value="lerp">lerp(a, b, t)</option>
              <option value="remap">remap(value, inMin, inMax, outMin, outMax)</option>
              <option value="smoothstep">smoothstep(edge0, edge1, x)</option>
            </select>
          </div>

          {fn === "lerp" && (
            <div className="grid grid-cols-3 gap-3">
              <NumInput label="a" value={a} setter={setA} />
              <NumInput label="b" value={b} setter={setB} />
              <NumInput label="t" value={t} setter={setT} step={0.01} />
            </div>
          )}

          {fn === "smoothstep" && (
            <div className="grid grid-cols-3 gap-3">
              <NumInput label="edge0" value={edge0} setter={setEdge0} step={0.01} />
              <NumInput label="edge1" value={edge1} setter={setEdge1} step={0.01} />
              <NumInput label="x" value={x} setter={setX} step={0.01} />
            </div>
          )}

          {fn === "remap" && (
            <div className="grid grid-cols-3 gap-3">
              <NumInput label="value" value={value} setter={setValue} step={0.01} />
              <NumInput label="inMin" value={inMin} setter={setInMin} step={0.01} />
              <NumInput label="inMax" value={inMax} setter={setInMax} step={0.01} />
              <NumInput label="outMin" value={outMin} setter={setOutMin} step={0.01} />
              <NumInput label="outMax" value={outMax} setter={setOutMax} step={0.01} />
            </div>
          )}
        </div>

        <div className="card space-y-3">
          <div>
            <div className="label">Resultado</div>
            <div className="text-2xl font-semibold text-accent-500">
              {output.ok ? output.value.toFixed(6) : output.error}
            </div>
          </div>
          <div>
            <div className="label">HLSL</div>
            <pre className="formula whitespace-pre-wrap">{HLSL[fn]}</pre>
          </div>
          <VerifyBanner verify={verify} />
        </div>
      </div>

      <div className="card">
        <div className="label mb-2">Gráfica 1D</div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis dataKey="x" stroke="#94a3b8" tickFormatter={(v) => v.toFixed(2)} />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ background: "#12151a", border: "1px solid #242b35" }} />
              <Line type="monotone" dataKey="y" stroke="#6ee7b7" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function NumInput({
  label, value, setter, step = 1,
}: { label: string; value: number; setter: (n: number) => void; step?: number }) {
  return (
    <div>
      <label className="label">{label}</label>
      <input type="number" step={step} className="input" value={value}
             onChange={(e) => setter(parseFloat(e.target.value || "0"))} />
    </div>
  );
}
