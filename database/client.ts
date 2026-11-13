import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "./generated/client";

function createClient() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("Falta DATABASE_URL. Copia .env.example a .env.local.");
  return new PrismaClient({ adapter: new PrismaBetterSqlite3({ url }) });
}

// Una sola conexión, también con la recarga en caliente de `next dev`.
const globalForDb = globalThis as unknown as { db?: PrismaClient };
export const db = globalForDb.db ?? createClient();
if (process.env.NODE_ENV !== "production") globalForDb.db = db;
