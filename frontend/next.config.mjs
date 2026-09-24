/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Docker: build standalone para imagen más ligera en producción.
  output: "standalone",
  // calc-core está enlazado como paquete file:../calc-core.
  // Se resuelve al `dist/` que produce tsup, así que no hace falta transpilarlo.
  experimental: {
    // Silencia el warning de workspace root cuando calc-core se resuelve fuera.
    externalDir: true,
  },
};
export default nextConfig;
