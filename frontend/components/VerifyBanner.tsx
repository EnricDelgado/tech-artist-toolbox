"use client";

import { useState } from "react";
import { ApiError } from "@/lib/api";

type Verify = () => Promise<{ ok: boolean; detail?: string }>;

export function VerifyBanner({ verify }: { verify: Verify }) {
  const [state, setState] = useState<"idle" | "loading" | "ok" | "diff" | "err">("idle");
  const [msg, setMsg] = useState<string>("");

  async function run() {
    setState("loading");
    setMsg("");
    try {
      const r = await verify();
      if (r.ok) {
        setState("ok");
        setMsg("Cliente y API coinciden.");
      } else {
        setState("diff");
        setMsg(r.detail ?? "Divergencia entre cliente y API.");
      }
    } catch (e) {
      setState("err");
      const detail =
        e instanceof ApiError
          ? `${e.status} ${e.body.error.code}: ${e.body.error.message}${e.body.error.field ? ` (${e.body.error.field})` : ""}`
          : (e as Error).message;
      setMsg(`Error al verificar: ${detail}`);
    }
  }

  const color =
    state === "ok"
      ? "text-emerald-400"
      : state === "diff"
        ? "text-amber-400"
        : state === "err"
          ? "text-red-400"
          : "text-slate-400";

  return (
    <div className="flex items-center gap-3">
      <button className="btn-secondary" onClick={run} disabled={state === "loading"}>
        {state === "loading" ? "Verificando…" : "Verificar con API"}
      </button>
      {msg && <span className={`text-sm ${color}`}>{msg}</span>}
    </div>
  );
}
