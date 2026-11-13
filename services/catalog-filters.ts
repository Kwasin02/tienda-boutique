// Filtros del catálogo: lectura segura de la URL + aplicación sobre la lista de productos.
// Funciones puras para poder probarlas sin servidor.

import { isOnSale, type Product } from "@/models/product";

export const sortOptions = {
  relevancia: "Destacados",
  novedades: "Novedades",
  "precio-asc": "Precio: menor a mayor",
  "precio-desc": "Precio: mayor a menor",
} as const;

export type SortKey = keyof typeof sortOptions;

export type CatalogFilters = {
  q?: string;
  categoria?: string;
  talla?: string;
  color?: string;
  min?: number;
  max?: number;
  promocion: boolean;
  orden: SortKey;
};

type RawParams = Record<string, string | string[] | undefined>;

const text = (v: string | string[] | undefined) => {
  const s = (Array.isArray(v) ? v[0] : v)?.trim().slice(0, 80);
  return s || undefined;
};

const amount = (v: string | string[] | undefined) => {
  const n = Number(text(v));
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : undefined;
};

export function parseFilters(params: RawParams): CatalogFilters {
  const orden = text(params.orden);
  return {
    q: text(params.q),
    categoria: text(params.categoria),
    talla: text(params.talla),
    color: text(params.color),
    min: amount(params.min),
    max: amount(params.max),
    promocion: text(params.promocion) === "1",
    orden: orden && orden in sortOptions ? (orden as SortKey) : "relevancia",
  };
}

/** Minúsculas y sin tildes: "Algodón" coincide con "algodon". */
export const normalize = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

export function applyFilters(products: Product[], f: CatalogFilters): Product[] {
  const q = f.q && normalize(f.q);
  const result = products.filter((p) => {
    if (q && !normalize(p.name).includes(q)) return false;
    if (f.categoria && p.categorySlug !== f.categoria) return false;
    if (f.min !== undefined && p.price < f.min) return false;
    if (f.max !== undefined && p.price > f.max) return false;
    if (f.promocion && !isOnSale(p)) return false;
    // Talla y color filtran por variantes con stock, que es lo que el cliente puede comprar.
    if (f.talla || f.color) {
      const match = p.variants.some(
        (v) => v.stock > 0 && (!f.talla || v.size === f.talla) && (!f.color || v.color === f.color),
      );
      if (!match) return false;
    }
    return true;
  });

  const sorters: Record<SortKey, (a: Product, b: Product) => number> = {
    relevancia: (a, b) => Number(b.featured) - Number(a.featured),
    novedades: (a, b) => b.createdAt.localeCompare(a.createdAt),
    "precio-asc": (a, b) => a.price - b.price,
    "precio-desc": (a, b) => b.price - a.price,
  };
  return result.sort(sorters[f.orden]);
}

/** Tallas y colores que existen en el catálogo, para construir los filtros. */
export function facetValues(products: Product[]) {
  const sizes = new Set<string>();
  const colors = new Set<string>();
  for (const p of products) {
    for (const v of p.variants) {
      sizes.add(v.size);
      colors.add(v.color);
    }
  }
  return { sizes: [...sizes], colors: [...colors].sort() };
}
