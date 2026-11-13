import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  experimental: {
    // Subida de fotos desde el panel: hasta 5 fotos de 5 MB por envío, más margen del formulario.
    serverActions: { bodySizeLimit: "26mb" },
  },
  images: {
    // Solo se optimizan las fotos subidas desde el panel.
    localPatterns: [{ pathname: "/uploads/**" }],
  },
  poweredByHeader: false,
};

export default nextConfig;
