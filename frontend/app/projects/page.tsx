"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";

interface Project {
  id: string;
  name: string;
  engine: "unity" | "unreal" | "other";
  platform: "windows" | "macos" | "android" | "ios" | "quest" | "other";
  config: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

const ENGINES = ["unity", "unreal", "other"] as const;
const PLATFORMS = ["windows", "macos", "android", "ios", "quest", "other"] as const;

export default function Page() {
  const [items, setItems] = useState<Project[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    engine: "unity" as (typeof ENGINES)[number],
    platform: "windows" as (typeof PLATFORMS)[number],
    textureMaxSize: 2048,
    compression: "BC7",
    mipmaps: true,
    colorSpace: "linear" as "linear" | "srgb",
  });

  async function refresh() {
    setError(null);
    try {
      setItems(await api.listProjects());
    } catch (e) {
      setError(describe(e));
      setItems([]);
    }
  }

  useEffect(() => { void refresh(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.createProject({
        name: form.name,
        engine: form.engine,
        platform: form.platform,
        config: {
          textureMaxSize: form.textureMaxSize,
          compression: form.compression,
          mipmaps: form.mipmaps,
          colorSpace: form.colorSpace,
        },
      });
      setForm({ ...form, name: "" });
      await refresh();
    } catch (e) {
      setError(describe(e));
    }
  }

  async function remove(id: string) {
    await api.deleteProject(id);
    await refresh();
  }

  function exportJson(p: Project) {
    const blob = new Blob([JSON.stringify(p, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${p.name || "project"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function importJson(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      await api.createProject({
        name: parsed.name,
        engine: parsed.engine,
        platform: parsed.platform,
        config: parsed.config ?? {},
      });
      await refresh();
    } catch (err) {
      setError(describe(err));
    } finally {
      e.target.value = "";
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Perfiles de proyecto</h1>
      <p className="text-sm text-slate-400">
        MVP sin autenticación: los perfiles son públicos para quien conozca el ID.
      </p>

      {error && <div className="card border-red-500/50 text-red-400 text-sm">{error}</div>}

      <form className="card grid grid-cols-1 md:grid-cols-3 gap-3" onSubmit={create}>
        <div className="md:col-span-3">
          <label className="label">Nombre</label>
          <input className="input" required minLength={1} value={form.name}
                 onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label className="label">Motor</label>
          <select className="input" value={form.engine}
                  onChange={(e) => setForm({ ...form, engine: e.target.value as any })}>
            {ENGINES.map((v) => <option key={v}>{v}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Plataforma</label>
          <select className="input" value={form.platform}
                  onChange={(e) => setForm({ ...form, platform: e.target.value as any })}>
            {PLATFORMS.map((v) => <option key={v}>{v}</option>)}
          </select>
        </div>
        <div>
          <label className="label">textureMaxSize</label>
          <input type="number" min={1} className="input" value={form.textureMaxSize}
                 onChange={(e) => setForm({ ...form, textureMaxSize: parseInt(e.target.value || "0", 10) })} />
        </div>
        <div>
          <label className="label">compression</label>
          <input className="input" value={form.compression}
                 onChange={(e) => setForm({ ...form, compression: e.target.value })} />
        </div>
        <div>
          <label className="label">colorSpace</label>
          <select className="input" value={form.colorSpace}
                  onChange={(e) => setForm({ ...form, colorSpace: e.target.value as any })}>
            <option value="linear">linear</option>
            <option value="srgb">srgb</option>
          </select>
        </div>
        <label className="flex items-end pb-2 gap-2 text-sm text-slate-300">
          <input type="checkbox" checked={form.mipmaps}
                 onChange={(e) => setForm({ ...form, mipmaps: e.target.checked })} />
          mipmaps
        </label>
        <div className="md:col-span-3 flex gap-3">
          <button className="btn" type="submit">Crear perfil</button>
          <label className="btn-secondary cursor-pointer">
            Importar JSON
            <input type="file" accept="application/json" className="hidden" onChange={importJson} />
          </label>
        </div>
      </form>

      <div className="card">
        <h2 className="text-lg font-medium mb-2">Perfiles guardados</h2>
        {items === null ? (
          <p className="text-slate-400 text-sm">Cargando…</p>
        ) : items.length === 0 ? (
          <p className="text-slate-400 text-sm">Ninguno todavía.</p>
        ) : (
          <ul className="divide-y divide-surface-800">
            {items.map((p) => (
              <li key={p.id} className="py-3 flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-slate-400 truncate">
                    {p.engine} · {p.platform} · id {p.id}
                  </div>
                </div>
                <button className="btn-secondary" onClick={() => exportJson(p)}>
                  Exportar
                </button>
                <button className="btn-secondary" onClick={() => remove(p.id)}>
                  Borrar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function describe(e: unknown): string {
  if (e instanceof ApiError) {
    return `${e.status} ${e.body.error.code}: ${e.body.error.message}${e.body.error.field ? ` (${e.body.error.field})` : ""}`;
  }
  return (e as Error).message ?? "Error desconocido";
}
