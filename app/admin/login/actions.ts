"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import type { ActionState } from "@/components/admin/forms";
import { db } from "@/database/client";
import { hashPassword, verifyPassword } from "@/services/auth/password";
import { createRateLimiter } from "@/services/auth/rate-limit";
import { endSession, startSession } from "@/services/auth/session";
import { clientIp } from "@/services/request";

// 5 intentos fallidos por IP cada 15 minutos.
const limiter = createRateLimiter(5, 15 * 60_000);
const schema = z.object({ email: z.email().max(200), password: z.string().min(1).max(200) });
// Hash ficticio para que un email inexistente tarde lo mismo que uno real (no revela qué emails existen).
const dummyHash = hashPassword("contraseña-ficticia-de-relleno");

export async function login(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const ip = await clientIp();
  if (limiter.isBlocked(ip)) return { error: "Demasiados intentos. Espera 15 minutos e inténtalo de nuevo." };

  const parsed = schema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { error: "Escribe un correo y una contraseña válidos." };

  const user = await db.adminUser.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  const ok = await verifyPassword(parsed.data.password, user?.passwordHash ?? (await dummyHash));
  if (!user || !ok) {
    limiter.hit(ip);
    return { error: "Correo o contraseña incorrectos." };
  }

  limiter.reset(ip);
  await startSession(user);
  redirect("/admin");
}

export async function logout() {
  await endSession();
  redirect("/admin/login");
}
