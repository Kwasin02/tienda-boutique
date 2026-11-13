import { defineConfig, env } from "prisma/config";

// La CLI de Prisma no lee .env.local por sí sola (Next.js sí).
try {
  process.loadEnvFile(".env.local");
} catch {
  // En producción las variables vienen del entorno del servidor.
}

export default defineConfig({
  schema: "database/schema.prisma",
  migrations: {
    path: "database/migrations",
    seed: "tsx database/seed.ts",
  },
  datasource: { url: env("DATABASE_URL") },
});
