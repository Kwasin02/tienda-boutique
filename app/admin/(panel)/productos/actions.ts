"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import type { ActionState } from "@/components/admin/forms";
import { db } from "@/database/client";
import { firstError, parseProductForm, parseVariants } from "@/services/admin-forms";
import { requireAdmin } from "@/services/auth/session";
import { CATALOG_TAG } from "@/services/catalog";
import { deleteImage, filesFrom, saveImages } from "@/services/uploads";

export async function saveProduct(_prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = Number(fd.get("id")) || null;

  const parsed = parseProductForm(fd);
  if (!parsed.success) return { error: firstError(parsed.error) };
  const data = parsed.data;

  let variants;
  try {
    variants = parseVariants(fd);
  } catch (e) {
    return { error: (e as Error).message };
  }

  const clash = await db.product.findUnique({ where: { slug: data.slug }, select: { id: true } });
  if (clash && clash.id !== id) return { error: `Ya existe otro producto con la URL "${data.slug}". Cambia el nombre o la URL.` };

  let newUrls: string[];
  try {
    newUrls = await saveImages(filesFrom(fd, "images"));
  } catch (e) {
    return { error: (e as Error).message };
  }

  const removeIds = fd.getAll("removeImage").map(Number).filter(Number.isInteger);
  let removedUrls: string[] = [];

  const saved = await db.$transaction(async (tx) => {
    const product = id ? await tx.product.update({ where: { id }, data }) : await tx.product.create({ data });

    await tx.variant.deleteMany({ where: { productId: product.id } });
    if (variants.length) await tx.variant.createMany({ data: variants.map((v) => ({ ...v, productId: product.id })) });

    if (removeIds.length) {
      const toRemove = await tx.productImage.findMany({ where: { productId: product.id, id: { in: removeIds } } });
      removedUrls = toRemove.map((i) => i.url);
      await tx.productImage.deleteMany({ where: { id: { in: toRemove.map((i) => i.id) } } });
    }
    const last = await tx.productImage.aggregate({ where: { productId: product.id }, _max: { sortOrder: true } });
    const start = (last._max.sortOrder ?? -1) + 1;
    if (newUrls.length) {
      await tx.productImage.createMany({
        data: newUrls.map((url, i) => ({ productId: product.id, url, alt: data.name, sortOrder: start + i })),
      });
    }
    return product;
  });

  await Promise.all(removedUrls.map(deleteImage));
  updateTag(CATALOG_TAG);

  if (!id) redirect(`/admin/productos/${saved.id}?creado=1`);
  return { ok: "Cambios guardados. Ya se ven en la tienda." };
}

export async function deleteProduct(fd: FormData) {
  await requireAdmin();
  const id = Number(fd.get("id"));
  if (!Number.isInteger(id)) return;
  const images = await db.productImage.findMany({ where: { productId: id } });
  await db.product.delete({ where: { id } }).catch(() => null);
  await Promise.all(images.map((i) => deleteImage(i.url)));
  updateTag(CATALOG_TAG);
  redirect("/admin/productos?eliminado=1");
}
