// Copia de seguridad de la base SQLite (segura con la tienda funcionando).
// Uso: npm run db:backup   → guarda en BACKUP_DIR (por defecto backups/) y conserva las últimas 14.

import { mkdir, readdir, unlink } from "node:fs/promises";
import path from "node:path";
import Database from "better-sqlite3";

try {
  process.loadEnvFile(".env.local");
} catch {}

const url = process.env.DATABASE_URL ?? "";
if (!url.startsWith("file:")) throw new Error("db:backup solo funciona con SQLite (DATABASE_URL=file:...).");

const dir = process.env.BACKUP_DIR || "backups";
const KEEP = 14;
await mkdir(dir, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const target = path.join(dir, `tienda-${stamp}.db`);

const db = new Database(url.slice("file:".length), { readonly: true });
await db.backup(target);
db.close();
console.log(`Copia guardada: ${target}`);

const old = (await readdir(dir)).filter((f) => /^tienda-.*\.db$/.test(f)).sort().slice(0, -KEEP);
for (const f of old) await unlink(path.join(dir, f));
