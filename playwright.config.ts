import { defineConfig, devices } from "@playwright/test";

// Las pruebas e2e usan su propia base de datos, carpeta de fotos y build (puerto 3100),
// así no tocan los datos de desarrollo. El número de WhatsApp es ficticio para que nunca
// se abra un chat real.
const PORT = 3100;
const env = {
  DATABASE_URL: "file:./database/e2e.db",
  UPLOAD_DIR: "storage/e2e-uploads",
  NEXT_DIST_DIR: ".next-e2e",
  STORE_URL: `http://localhost:${PORT}`,
  WHATSAPP_NUMBER: "570000000000",
  SESSION_SECRET: "e2e-secreto-solo-para-pruebas-automatizadas-0123456789",
  ADMIN_EMAIL: "e2e@tienda.local",
  ADMIN_INITIAL_PASSWORD: "e2e-clave-de-prueba",
};

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  use: { baseURL: `http://localhost:${PORT}`, trace: "retain-on-failure" },
  projects: [
    { name: "escritorio", use: { ...devices["Desktop Chrome"] } },
    { name: "movil", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: `rm -f database/e2e.db && npx prisma migrate deploy && npx prisma db seed && npx next build && npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    env,
    timeout: 240_000,
    reuseExistingServer: false,
  },
});
