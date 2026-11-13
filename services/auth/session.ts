import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/database/client";
import { createToken, passwordFingerprint, readToken } from "@/services/auth/token";

export const SESSION_COOKIE = "admin_session";
const SESSION_HOURS = 8;

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("SESSION_SECRET falta o es demasiado corto (mínimo 32 caracteres).");
  return s;
}

export async function startSession(user: { id: number; passwordHash: string }) {
  const exp = Date.now() + SESSION_HOURS * 3600_000;
  (await cookies()).set(SESSION_COOKIE, createToken({ uid: user.id, pv: passwordFingerprint(user.passwordHash), exp }, secret()), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(exp),
  });
}

export async function endSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

/** Admin actual o null. Comprueba firma, expiración, que el usuario exista y que no haya cambiado la contraseña. */
export async function getAdmin() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  // Hora actual vía performance: Next.js 16 no permite Date.now() en el prerender de la sesión, y
  // connection() aquí provoca un error interno tras las acciones del servidor.
  const payload = readToken(token, secret(), Math.round(performance.timeOrigin + performance.now()));
  if (!payload) return null;
  const user = await db.adminUser.findUnique({ where: { id: payload.uid } });
  if (!user || passwordFingerprint(user.passwordHash) !== payload.pv) return null;
  return { id: user.id, email: user.email };
}

/** Úsalo al inicio de CADA página y acción del panel: el proxy solo es una primera barrera. */
export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
