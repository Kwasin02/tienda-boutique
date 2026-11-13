// Token de sesión firmado con HMAC-SHA256: "<payload base64url>.<firma base64url>".
// No es secreto (no lleva datos sensibles), pero no se puede falsificar sin SESSION_SECRET.

import { createHmac, timingSafeEqual } from "node:crypto";

export type SessionPayload = {
  /** id del AdminUser */
  uid: number;
  /** huella del hash de contraseña: cambiar la contraseña invalida las sesiones abiertas */
  pv: string;
  /** expiración en ms desde epoch */
  exp: number;
};

const sign = (data: string, secret: string) => createHmac("sha256", secret).update(data).digest("base64url");

export function createToken(payload: SessionPayload, secret: string) {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${data}.${sign(data, secret)}`;
}

export function readToken(token: string | undefined, secret: string, now = Date.now()): SessionPayload | null {
  if (!token) return null;
  const [data, sig] = token.split(".");
  if (!data || !sig) return null;
  const expected = Buffer.from(sign(data, secret));
  const actual = Buffer.from(sig);
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
  try {
    const p = JSON.parse(Buffer.from(data, "base64url").toString());
    if (!Number.isInteger(p.uid) || typeof p.pv !== "string" || typeof p.exp !== "number" || p.exp < now) return null;
    return p;
  } catch {
    return null;
  }
}

/** Huella corta del hash: no expone el hash completo en la cookie. */
export const passwordFingerprint = (passwordHash: string) =>
  createHmac("sha256", "pv").update(passwordHash).digest("base64url").slice(0, 16);
