import type { MetadataRoute } from "next";
import { getAllProducts, getCategories } from "@/services/catalog";
import { storeConfig } from "@/services/store-config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([getAllProducts(), getCategories()]);
  const url = (path: string) => new URL(path, storeConfig.url).toString();
  return [
    { url: url("/"), changeFrequency: "daily", priority: 1 },
    { url: url("/catalogo"), changeFrequency: "daily", priority: 0.9 },
    { url: url("/contacto"), changeFrequency: "monthly", priority: 0.5 },
    ...categories.map((c) => ({ url: url(`/catalogo?categoria=${c.slug}`), changeFrequency: "weekly" as const, priority: 0.7 })),
    ...products.filter((p) => !p.demo).map((p) => ({ url: url(`/producto/${p.slug}`), lastModified: p.createdAt, priority: 0.8 })),
  ];
}
