export type Category = {
  slug: string;
  name: string;
  description: string;
};

export type Variant = {
  size: string;
  color: string;
  stock: number;
};

export type Product = {
  slug: string;
  name: string;
  description: string;
  categorySlug: string;
  /** Precio en unidades enteras de la moneda (sin decimales flotantes). */
  price: number;
  /** Precio anterior si hay promoción. */
  compareAtPrice?: number;
  images: string[];
  variants: Variant[];
  featured: boolean;
  bestSeller: boolean;
  createdAt: string;
  /** Producto de demostración, no es mercancía real. */
  demo: boolean;
};

export function isOnSale(p: Pick<Product, "price" | "compareAtPrice">) {
  return p.compareAtPrice !== undefined && p.compareAtPrice > p.price;
}

export function discountPercent(p: Pick<Product, "price" | "compareAtPrice">) {
  if (!isOnSale(p)) return 0;
  return Math.round((1 - p.price / p.compareAtPrice!) * 100);
}

export function totalStock(p: Pick<Product, "variants">) {
  return p.variants.reduce((sum, v) => sum + v.stock, 0);
}
