// Lectura y validación (zod) de los formularios del panel. Funciones puras: se prueban sin servidor.

import { z } from "zod";
import { slugify } from "@/services/slug";

const money = z.coerce.number().int("Usa pesos enteros, sin decimales.").min(0).max(100_000_000);
const optionalMoney = z.preprocess((v) => (v === "" || v === null ? undefined : v), money.optional());
const checkbox = z.preprocess((v) => v === "on", z.boolean());
const text = (max: number) => z.string().trim().max(max);

export const productSchema = z
  .object({
    name: text(120).min(2, "Escribe un nombre de al menos 2 caracteres."),
    slug: text(80),
    description: text(4000),
    categoryId: z.coerce.number().int().positive("Elige una categoría."),
    price: money,
    compareAtPrice: optionalMoney,
    featured: checkbox,
    bestSeller: checkbox,
    active: checkbox,
    demo: checkbox,
  })
  .transform((p) => ({ ...p, slug: slugify(p.slug || p.name) }))
  .refine((p) => p.slug.length > 0, { message: "El nombre necesita letras o números para crear la URL." })
  .refine((p) => p.compareAtPrice === undefined || p.compareAtPrice > p.price, {
    message: "El precio anterior debe ser mayor que el precio actual (o déjalo vacío si no hay promoción).",
  });

export function parseProductForm(fd: FormData) {
  const raw = Object.fromEntries(
    ["name", "slug", "description", "categoryId", "price", "compareAtPrice", "featured", "bestSeller", "active", "demo"].map((k) => [k, fd.get(k) ?? ""]),
  );
  return productSchema.safeParse(raw);
}

/** Campos stock_<tallaId>_<colorId>: vacío = la variante no existe; 0 = existe pero agotada. */
export function parseVariants(fd: FormData) {
  const variants: { sizeId: number; colorId: number; stock: number }[] = [];
  for (const [key, value] of fd.entries()) {
    const m = /^stock_(\d+)_(\d+)$/.exec(key);
    if (!m || typeof value !== "string" || value.trim() === "") continue;
    const stock = Number(value);
    if (!Number.isInteger(stock) || stock < 0 || stock > 99_999) throw new Error("El stock debe ser un número entero entre 0 y 99.999.");
    variants.push({ sizeId: Number(m[1]), colorId: Number(m[2]), stock });
  }
  return variants;
}

export const firstError = (e: z.ZodError) => e.issues[0]?.message ?? "Revisa los datos del formulario.";

/** FAQ escrita como bloques separados por una línea en blanco: primera línea = pregunta, resto = respuesta. */
export function parseFaq(text: string) {
  return text
    .split(/\n\s*\n/)
    .map((block) => block.trim().split("\n"))
    .filter((lines) => lines[0]?.trim())
    .map(([q, ...a]) => ({ q: q.trim().slice(0, 300), a: a.join("\n").trim().slice(0, 2000) }))
    .slice(0, 50);
}

export const faqToText = (faq: { q: string; a: string }[]) => faq.map((f) => `${f.q}\n${f.a}`).join("\n\n");
