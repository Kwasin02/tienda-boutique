import { describe, expect, it } from "vitest";
import { discountPercent, isOnSale, totalStock } from "@/models/product";
import { whatsappLink } from "@/services/whatsapp";

describe("precios y promociones", () => {
  it("calcula el descuento redondeado", () => {
    expect(discountPercent({ price: 48, compareAtPrice: 60 })).toBe(20);
    expect(discountPercent({ price: 2, compareAtPrice: 3 })).toBe(33);
  });
  it("no marca promoción si el precio anterior no es mayor", () => {
    expect(isOnSale({ price: 50 })).toBe(false);
    expect(isOnSale({ price: 50, compareAtPrice: 50 })).toBe(false);
    expect(discountPercent({ price: 60, compareAtPrice: 48 })).toBe(0);
  });
  it("suma el stock de todas las variantes", () => {
    expect(totalStock({ variants: [{ size: "S", color: "A", stock: 2 }, { size: "M", color: "A", stock: 0 }] })).toBe(2);
  });
});

describe("enlace de WhatsApp", () => {
  it("usa wa.me y codifica el mensaje", () => {
    expect(whatsappLink("Hola & talla M?", "573001112233")).toBe("https://wa.me/573001112233?text=Hola%20%26%20talla%20M%3F");
  });
  it("devuelve null sin número configurado", () => {
    expect(whatsappLink("Hola", "")).toBeNull();
  });
});
