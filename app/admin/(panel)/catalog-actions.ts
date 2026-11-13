"use server";

// Acciones del panel para categorías, tallas, colores y banners.

import { updateTag } from "next/cache";
import { z } from "zod";
import type { ActionState } from "@/components/admin/forms";
import { db } from "@/database/client";
import { firstError } from "@/services/admin-forms";
import { requireAdmin } from "@/services/auth/session";
import { CATALOG_TAG } from "@/services/catalog";
import { slugify } from "@/services/slug";
import { deleteImage, filesFrom, saveImages } from "@/services/uploads";

const id = z.preprocess((v) => (v === "" || v === null ? undefined : v), z.coerce.number().int().positive().optional());
const order = z.coerce.number().int().min(0).max(999).catch(0);
const done = (ok: string): ActionState => {
  updateTag(CATALOG_TAG);
  return { ok };
};
const isUniqueError = (e: unknown) => (e as { code?: string }).code === "P2002";

// ---------- Categorías ----------

const categorySchema = z.object({
  id,
  name: z.string().trim().min(2, "El nombre de la categoría es muy corto.").max(60),
  slug: z.string().trim().max(60),
  description: z.string().trim().max(200),
  sortOrder: order,
});

export async function saveCategory(_p: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const r = categorySchema.safeParse(Object.fromEntries(fd));
  if (!r.success) return { error: firstError(r.error) };
  const { id: catId, ...data } = r.data;
  data.slug = slugify(data.slug || data.name);
  try {
    if (catId) await db.category.update({ where: { id: catId }, data });
    else await db.category.create({ data });
  } catch (e) {
    if (isUniqueError(e)) return { error: `Ya existe una categoría con la URL "${data.slug}".` };
    throw e;
  }
  return done(catId ? "Categoría guardada." : "Categoría creada.");
}

export async function deleteCategory(_p: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const catId = Number(fd.get("id"));
  const count = await db.product.count({ where: { categoryId: catId } });
  if (count > 0) return { error: `No se puede eliminar: tiene ${count} producto(s). Muévelos a otra categoría primero.` };
  await db.category.delete({ where: { id: catId } }).catch(() => null);
  return done("Categoría eliminada.");
}

// ---------- Tallas ----------

const sizeSchema = z.object({ id, name: z.string().trim().min(1, "Escribe la talla.").max(20), sortOrder: order });

export async function saveSize(_p: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const r = sizeSchema.safeParse(Object.fromEntries(fd));
  if (!r.success) return { error: firstError(r.error) };
  const { id: sizeId, ...data } = r.data;
  try {
    if (sizeId) await db.size.update({ where: { id: sizeId }, data });
    else await db.size.create({ data });
  } catch (e) {
    if (isUniqueError(e)) return { error: `La talla "${data.name}" ya existe.` };
    throw e;
  }
  return done("Talla guardada.");
}

export async function deleteSize(_p: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const sizeId = Number(fd.get("id"));
  const count = await db.variant.count({ where: { sizeId } });
  if (count > 0) return { error: `No se puede eliminar: la usan ${count} variante(s) de productos.` };
  await db.size.delete({ where: { id: sizeId } }).catch(() => null);
  return done("Talla eliminada.");
}

// ---------- Colores ----------

const colorSchema = z.object({
  id,
  name: z.string().trim().min(2, "Escribe el nombre del color.").max(30),
  hex: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, "El color debe tener el formato #RRGGBB.").or(z.literal("")),
});

export async function saveColor(_p: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const r = colorSchema.safeParse(Object.fromEntries(fd));
  if (!r.success) return { error: firstError(r.error) };
  const { id: colorId, name, hex } = r.data;
  const data = { name, hex: hex || null };
  try {
    if (colorId) await db.color.update({ where: { id: colorId }, data });
    else await db.color.create({ data });
  } catch (e) {
    if (isUniqueError(e)) return { error: `El color "${name}" ya existe.` };
    throw e;
  }
  return done("Color guardado.");
}

export async function deleteColor(_p: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const colorId = Number(fd.get("id"));
  const count = await db.variant.count({ where: { colorId } });
  if (count > 0) return { error: `No se puede eliminar: lo usan ${count} variante(s) de productos.` };
  await db.color.delete({ where: { id: colorId } }).catch(() => null);
  return done("Color eliminado.");
}

// ---------- Banners ----------

const bannerSchema = z.object({
  id,
  eyebrow: z.string().trim().max(60),
  title: z.string().trim().min(3, "El título es obligatorio.").max(120),
  subtitle: z.string().trim().max(300),
  // Solo enlaces internos de la tienda: evita usar el banner para mandar a sitios externos.
  linkUrl: z.string().trim().regex(/^\/[^\s/][^\s]*$|^\/$/, "El enlace debe ser una ruta de la tienda, p. ej. /catalogo"),
  linkLabel: z.string().trim().min(2).max(40),
  sortOrder: order,
  active: z.preprocess((v) => v === "on", z.boolean()),
});

export async function saveBanner(_p: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const r = bannerSchema.safeParse({ ...Object.fromEntries(fd), active: fd.get("active") });
  if (!r.success) return { error: firstError(r.error) };
  const { id: bannerId, ...data } = r.data;

  let imageUrl: string | undefined;
  try {
    [imageUrl] = await saveImages(filesFrom(fd, "image").slice(0, 1));
  } catch (e) {
    return { error: (e as Error).message };
  }
  const old = bannerId ? await db.banner.findUnique({ where: { id: bannerId } }) : null;
  const removeImage = fd.get("removeImage") === "on";

  const imageData = imageUrl ? { imageUrl } : removeImage ? { imageUrl: null } : {};
  if (bannerId) await db.banner.update({ where: { id: bannerId }, data: { ...data, ...imageData } });
  else await db.banner.create({ data: { ...data, ...imageData } });
  if (old?.imageUrl && (imageUrl || removeImage)) await deleteImage(old.imageUrl);

  return done("Banner guardado.");
}

export async function deleteBanner(_p: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const banner = await db.banner.findUnique({ where: { id: Number(fd.get("id")) } });
  if (!banner) return null;
  await db.banner.delete({ where: { id: banner.id } });
  if (banner.imageUrl) await deleteImage(banner.imageUrl);
  return done("Banner eliminado.");
}
