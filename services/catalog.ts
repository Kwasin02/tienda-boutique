// Única puerta de acceso al catálogo. En la Fase 5 estas funciones leerán de la base de datos;
// las páginas no tendrán que cambiar.

import { demoCategories, demoProducts } from "@/database/demo-data";
import { isOnSale, type Product } from "@/models/product";

export async function getCategories() {
  return demoCategories;
}

export async function getFeaturedProducts(limit = 4) {
  return demoProducts.filter((p) => p.featured).slice(0, limit);
}

export async function getBestSellers(limit = 4) {
  return demoProducts.filter((p) => p.bestSeller).slice(0, limit);
}

export async function getNewArrivals(limit = 4) {
  return [...demoProducts].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit);
}

export async function getOnSale(limit = 4) {
  return demoProducts.filter(isOnSale).slice(0, limit);
}

export async function getAllProducts() {
  return demoProducts;
}

export async function getProductBySlug(slug: string) {
  return demoProducts.find((p) => p.slug === slug) ?? null;
}

export async function getRelatedProducts(product: Product, limit = 4) {
  return demoProducts
    .filter((p) => p.slug !== product.slug && p.categorySlug === product.categorySlug)
    .concat(demoProducts.filter((p) => p.slug !== product.slug && p.categorySlug !== product.categorySlug))
    .slice(0, limit);
}
