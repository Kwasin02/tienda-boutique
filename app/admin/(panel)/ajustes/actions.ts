"use server";

import { updateTag } from "next/cache";
import { z } from "zod";
import type { ActionState } from "@/components/admin/forms";
import { db } from "@/database/client";
import { firstError, parseFaq } from "@/services/admin-forms";
import { hashPassword, MIN_PASSWORD_LENGTH, verifyPassword } from "@/services/auth/password";
import { requireAdmin, startSession } from "@/services/auth/session";
import { CATALOG_TAG } from "@/services/catalog";

const url = z.string().trim().max(200).refine((v) => v === "" || /^https:\/\/[^\s]+$/.test(v), "Los enlaces de redes deben empezar por https://");

const settingsSchema = z.object({
  about: z.string().trim().max(1000),
  email: z.string().trim().max(200).refine((v) => v === "" || z.email().safeParse(v).success, "El correo no es válido."),
  address: z.string().trim().max(300),
  instagram: url,
  facebook: url,
  tiktok: url,
  hours: z.string().trim().max(1000),
  faq: z.string().max(20000),
});

export async function saveSettings(_p: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const r = settingsSchema.safeParse(Object.fromEntries(fd));
  if (!r.success) return { error: firstError(r.error) };
  const data = { ...r.data, faq: JSON.stringify(parseFaq(r.data.faq)) };
  await db.storeSettings.upsert({ where: { id: 1 }, update: data, create: { id: 1, ...data } });
  updateTag(CATALOG_TAG);
  return { ok: "Ajustes guardados. Ya se ven en la página de contacto." };
}

export async function changePassword(_p: ActionState, fd: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const current = String(fd.get("current") ?? "");
  const next = String(fd.get("next") ?? "");
  if (next.length < MIN_PASSWORD_LENGTH) return { error: `La nueva contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.` };
  if (next.length > 200) return { error: "La contraseña es demasiado larga." };
  if (next !== fd.get("confirm")) return { error: "Las contraseñas nuevas no coinciden." };

  const user = await db.adminUser.findUniqueOrThrow({ where: { id: admin.id } });
  if (!(await verifyPassword(current, user.passwordHash))) return { error: "La contraseña actual no es correcta." };

  const updated = await db.adminUser.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(next) } });
  await startSession(updated); // las demás sesiones abiertas quedan invalidadas
  return { ok: "Contraseña actualizada. Se cerraron las sesiones en otros dispositivos." };
}
