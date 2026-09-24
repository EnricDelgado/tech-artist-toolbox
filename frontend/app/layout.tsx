import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tech Artist Toolbox",
  description:
    "Calculadoras y utilidades técnicas para Technical Artists y desarrolladores de videojuegos.",
};

const NAV = [
  { href: "/", label: "Inicio" },
  { href: "/calculators/texture-memory", label: "Texture memory" },
  { href: "/calculators/texture-compare", label: "Compression compare" },
  { href: "/calculators/texel-density", label: "Texel density" },
  { href: "/calculators/shader-math", label: "Shader math" },
  { href: "/calculators/color", label: "Color" },
  { href: "/projects", label: "Perfiles" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body>
        <div className="min-h-full flex flex-col">
          <header className="border-b border-surface-800 bg-surface-900">
            <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-6 flex-wrap">
              <Link href="/" className="text-lg font-semibold text-accent-500">
                Tech Artist Toolbox
              </Link>
              <nav className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-300">
                {NAV.slice(1).map((item) => (
                  <Link key={item.href} href={item.href} className="hover:text-accent-500">
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </header>
          <main className="flex-1">
            <div className="max-w-6xl mx-auto px-4 py-8">{children}</div>
          </main>
          <footer className="border-t border-surface-800 text-xs text-slate-500">
            <div className="max-w-6xl mx-auto px-4 py-4">
              MVP — sin autenticación. Perfiles públicos por ID. Ver{" "}
              <a href="https://github.com" className="underline">
                repositorio
              </a>{" "}
              para código fuente.
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
