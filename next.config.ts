import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";
const isHttps = (process.env.STORE_URL ?? "").startsWith("https://");

// CSP sin nonces (mantiene las páginas estáticas). Next.js necesita 'unsafe-inline' para sus scripts.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isHttps ? ["upgrade-insecure-requests"] : []),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  ...(isHttps ? [{ key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" }] : []),
];

const nextConfig: NextConfig = {
  // Las pruebas e2e compilan en otra carpeta para no pisar el build normal.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
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
