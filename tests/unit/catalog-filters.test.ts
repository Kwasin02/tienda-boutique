import { describe, expect, it } from "vitest";
import type { Product } from "@/models/product";
import { applyFilters, parseFilters } from "@/services/catalog-filters";

const make = (o: Partial<Product>): Product => ({
  slug: "x",
  name: "X",
  description: "",
  categorySlug: "c",
  price: 100,
  images: [],
  variants: [],
  featured: false,
  bestSeller: false,
  createdAt: "2026-01-01",
  demo: true,
  ...o,
});

const camisa = make({ slug: "camisa", name: "Camisa de algodón", categorySlug: "blusas", price: 50, createdAt: "2026-02-01", variants: [{ size: "M", color: "Blanco", stock: 2 }] });
const vestido = make({ slug: "vestido", name: "Vestido", categorySlug: "vestidos", price: 90, compareAtPrice: 120, featured: true, variants: [{ size: "S", color: "Arena", stock: 0 }, { size: "M", color: "Arena", stock: 1 }] });
const all = [camisa, vestido];
const slugs = (ps: Product[]) => ps.map((p) => p.slug);

describe("parseFilters", () => {
  it("ignora valores inválidos", () => {
    const f = parseFilters({ min: "-5", max: "abc", orden: "hackeo", q: "   " });
    expect(f).toMatchObject({ min: undefined, max: undefined, orden: "relevancia", q: undefined, promocion: false });
  });
  it("lee el primer valor si llegan repetidos y recorta textos largos", () => {
    expect(parseFilters({ talla: ["M", "L"] }).talla).toBe("M");
    expect(parseFilters({ q: "a".repeat(200) }).q).toHaveLength(80);
  });
});

describe("applyFilters", () => {
  const base = parseFilters({});
  it("busca sin distinguir tildes ni mayúsculas", () => {
    expect(slugs(applyFilters(all, { ...base, q: "ALGODON" }))).toEqual(["camisa"]);
  });
  it("filtra por categoría, rango de precio y promoción", () => {
    expect(slugs(applyFilters(all, { ...base, categoria: "vestidos" }))).toEqual(["vestido"]);
    expect(slugs(applyFilters(all, { ...base, min: 60, max: 100 }))).toEqual(["vestido"]);
    expect(slugs(applyFilters(all, { ...base, promocion: true }))).toEqual(["vestido"]);
  });
  it("filtra talla y color solo con stock en la misma variante", () => {
    expect(slugs(applyFilters(all, { ...base, talla: "S" }))).toEqual([]);
    expect(slugs(applyFilters(all, { ...base, talla: "M", color: "Arena" }))).toEqual(["vestido"]);
    expect(slugs(applyFilters(all, { ...base, talla: "M", color: "Rojo" }))).toEqual([]);
  });
  it("ordena por precio y novedades", () => {
    expect(slugs(applyFilters(all, { ...base, orden: "precio-desc" }))).toEqual(["vestido", "camisa"]);
    expect(slugs(applyFilters(all, { ...base, orden: "precio-asc" }))).toEqual(["camisa", "vestido"]);
    expect(slugs(applyFilters(all, { ...base, orden: "novedades" }))).toEqual(["camisa", "vestido"]);
  });
  it("no modifica la lista original", () => {
    applyFilters(all, { ...base, orden: "precio-desc" });
    expect(slugs(all)).toEqual(["camisa", "vestido"]);
  });
});
