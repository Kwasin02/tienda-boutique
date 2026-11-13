import { describe, expect, it } from "vitest";
import type { Product } from "@/models/product";
import { buildOrderMessage, validateCart } from "@/services/checkout";
import { makePriceFormatter } from "@/services/format";

const vestido: Product = {
  slug: "vestido",
  name: "Vestido",
  description: "",
  categorySlug: "v",
  price: 96000,
  images: [],
  variants: [
    { size: "M", color: "Arena", stock: 2 },
    { size: "L", color: "Arena", stock: 0 },
  ],
  featured: false,
  bestSeller: false,
  createdAt: "2026-01-01",
  demo: true,
};
const item = (o: object) => ({ slug: "vestido", size: "M", color: "Arena", quantity: 1, price: 96000, ...o });

describe("validateCart", () => {
  it("usa el precio del catálogo, no el del navegador", () => {
    const { lines, issues } = validateCart([item({ price: 1 })], [vestido]);
    expect(lines[0].unitPrice).toBe(96000);
    expect(issues).toHaveLength(1);
  });
  it("ajusta la cantidad al stock y quita variantes agotadas o inexistentes", () => {
    const { lines, issues } = validateCart(
      [item({ quantity: 5 }), item({ size: "L" }), item({ slug: "nada" }), item({ color: "Rojo" })],
      [vestido],
    );
    expect(lines).toHaveLength(1);
    expect(lines[0].quantity).toBe(2);
    expect(issues).toHaveLength(4);
  });
  it("rechaza entradas que no son una lista o tienen campos inválidos", () => {
    expect(validateCart("hola", [vestido]).lines).toEqual([]);
    expect(validateCart([{ slug: 1 }, null], [vestido]).lines).toEqual([]);
  });
});

describe("buildOrderMessage", () => {
  it("incluye producto, talla, color, cantidades, precios y total", () => {
    const { lines } = validateCart([item({ quantity: 2 })], [vestido]);
    const msg = buildOrderMessage(lines, "Mi tienda", makePriceFormatter("es-CO", "COP"), "P-ABC234");
    expect(msg).toContain("pedido en Mi tienda");
    expect(msg).toContain("Pedido #P-ABC234");
    expect(msg).toContain("1. Vestido");
    expect(msg).toContain("Talla: M · Color: Arena");
    expect(msg).toMatch(/2 × \$\s96\.000 = \$\s192\.000/);
    expect(msg).toMatch(/Subtotal \(2 artículos\): \$\s192\.000/);
    expect(msg).toMatch(/\*Total: \$\s192\.000\*/);
  });
});
