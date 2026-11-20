import type { NextConfig } from "next";

// Exportación estática: Firebase Hosting sirve `out/` sin servidor de Next.js (costo cero).
// Las rutas con id (/barbero/{id}, /solicitud/{id}, /s/{codigo}) se resuelven en el cliente
// con rewrites de firebase.json. Ver docs/specs/00-arquitectura.md.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
