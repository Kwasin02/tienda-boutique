// Única puerta de acceso al catálogo para la tienda. Lee de la base de datos y cachea con 'use cache';
// el panel admin invalida la caché con updateTag(CATALOG_TAG) al guardar cambios.

import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/database/client";
import type { Prisma } from "@/database/generated/client";
import { isOnSale, type Category, type Product } from "@/models/product";

export const CATALOG_TAG = "catalogo";

const productInclude = {
  category: { select: { slug: true } },
  images: { orderBy: { sortOrder: "asc" } },
  variants: {
    include: { size: true, color: true },
    orderBy: [{ size: { sortOrder: "asc" } }, { color: { name: "asc" } }],
  },
} satisfies Prisma.ProductInclude;

type DbProduct = Prisma.ProductGetPayload<{ include: typeof productInclude }>;

function toProduct(p: DbProduct): Product {
  return {
    slug: p.slug,
    name: p.name,
    description: p.description,
    categorySlug: p.category.slug,
    price: p.price,
    compareAtPrice: p.compareAtPrice ?? undefined,
    images: p.images.map((i) => i.url),
    variants: p.variants.map((v) => ({ size: v.size.name, color: v.color.name, stock: v.stock })),
    featured: p.featured,
    bestSeller: p.bestSeller,
    createdAt: p.createdAt.toISOString(),
    demo: p.demo,
  };
}

// shortcut: se carga el catálogo activo completo y se filtra en memoria (cacheado); sirve para cientos
// de productos. Si pasa de ~2.000, mover filtros y paginación a consultas SQL.
export async function getAllProducts(): Promise<Product[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_TAG);
  const rows = await db.product.findMany({
    where: { active: true },
    include: productInclude,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toProduct);
}

export async function getCategories(): Promise<Category[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_TAG);
  return db.category.findMany({ orderBy: { sortOrder: "asc" }, select: { slug: true, name: true, description: true } });
}

export async function getActiveBanner() {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_TAG);
  return db.banner.findFirst({ where: { active: true }, orderBy: { sortOrder: "asc" } });
}

export async function getFeaturedProducts(limit = 4) {
  return (await getAllProducts()).filter((p) => p.featured).slice(0, limit);
}

export async function getBestSellers(limit = 4) {
  return (await getAllProducts()).filter((p) => p.bestSeller).slice(0, limit);
}

export async function getNewArrivals(limit = 4) {
  return (await getAllProducts()).slice(0, limit); // ya vienen ordenados por fecha
}

export async function getOnSale(limit = 4) {
  return (await getAllProducts()).filter(isOnSale).slice(0, limit);
}

export async function getProductBySlug(slug: string) {
  return (await getAllProducts()).find((p) => p.slug === slug) ?? null;
}

export async function getRelatedProducts(product: Product, limit = 4) {
  const others = (await getAllProducts()).filter((p) => p.slug !== product.slug);
  return [...others.filter((p) => p.categorySlug === product.categorySlug), ...others.filter((p) => p.categorySlug !== product.categorySlug)].slice(0, limit);
}

/** Sin caché: el checkout necesita precio y stock al instante. */
export async function getProductsForCheckout(slugs: string[]): Promise<Product[]> {
  const rows = await db.product.findMany({ where: { slug: { in: slugs }, active: true }, include: productInclude });
  return rows.map(toProduct);
}
