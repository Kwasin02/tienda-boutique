import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/database/client";
import { CATALOG_TAG } from "@/services/catalog";

export type Faq = { q: string; a: string }[];

function parseFaqJson(json: string): Faq {
  try {
    const v = JSON.parse(json);
    return Array.isArray(v) ? v.filter((f) => typeof f?.q === "string" && typeof f?.a === "string") : [];
  } catch {
    return [];
  }
}

/** Ajustes editables desde el panel (contacto, redes, horarios, FAQ). */
export async function getStoreSettings() {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_TAG);
  const s = await db.storeSettings.findUnique({ where: { id: 1 } });
  return {
    about: s?.about ?? "",
    email: s?.email ?? "",
    address: s?.address ?? "",
    instagram: s?.instagram ?? "",
    facebook: s?.facebook ?? "",
    tiktok: s?.tiktok ?? "",
    hours: (s?.hours ?? "").split("\n").map((l) => l.trim()).filter(Boolean),
    faq: parseFaqJson(s?.faq ?? "[]"),
  };
}
