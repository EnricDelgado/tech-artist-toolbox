import Link from "next/link";

const CALCULATORS = [
  {
    href: "/calculators/texture-memory",
    title: "Texture memory",
    blurb: "Memoria estimada de una textura por formato y con/sin mipmaps.",
  },
  {
    href: "/calculators/texture-compare",
    title: "Compression compare",
    blurb: "Misma textura, comparada en RGBA32, BC7, ASTC 4x4/6x6/8x8.",
  },
  {
    href: "/calculators/texel-density",
    title: "Texel density",
    blurb: "Densidad px/unidad y resolución sugerida a la potencia de dos.",
  },
  {
    href: "/calculators/shader-math",
    title: "Shader math",
    blurb: "lerp, remap y smoothstep con gráfica 1D y snippet HLSL.",
  },
  {
    href: "/calculators/color",
    title: "Color",
    blurb: "RGB / HEX / HSL y linear <-> sRGB (IEC 61966-2-1).",
  },
];

export default function Home() {
  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-semibold text-slate-100">
          Cinco calculadoras. Una fórmula visible junto a cada resultado.
        </h1>
        <p className="mt-2 text-slate-400 max-w-2xl">
          Todas las cifras se calculan en el navegador con{" "}
          <code className="formula">calc-core</code>. Con el botón{" "}
          <em>Verificar con API</em> se contrastan contra el backend, que
          replica las mismas fórmulas en Python.
        </p>
      </section>
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {CALCULATORS.map((c) => (
          <Link key={c.href} href={c.href} className="card hover:border-accent-500 transition">
            <h2 className="text-xl font-medium text-accent-500">{c.title}</h2>
            <p className="mt-2 text-sm text-slate-400">{c.blurb}</p>
          </Link>
        ))}
      </section>
      <section className="card">
        <h2 className="text-lg font-medium">Perfiles de proyecto</h2>
        <p className="mt-2 text-sm text-slate-400">
          Guarda motor, plataforma y presupuesto de texturas como perfil
          reutilizable. Exportable e importable como JSON.
        </p>
        <Link href="/projects" className="btn mt-4">
          Ir a perfiles
        </Link>
      </section>
    </div>
  );
}
