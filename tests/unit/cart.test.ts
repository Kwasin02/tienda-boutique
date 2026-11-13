import { describe, expect, it } from "vitest";
import { addToCart, cartCount, cartTotal, itemKey, MAX_PER_LINE, parseStoredCart, removeFromCart, setQuantity } from "@/services/cart";

const base = { slug: "vestido", name: "Vestido", price: 90000, size: "M", color: "Arena", maxStock: 3 };

describe("carrito", () => {
  it("agrupa la misma variante y respeta el stock", () => {
    let items = addToCart([], base, 2);
    items = addToCart(items, base, 5);
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(3);
  });
  it("separa variantes distintas", () => {
    const items = addToCart(addToCart([], base, 1), { ...base, size: "L" }, 1);
    expect(items).toHaveLength(2);
    expect(cartCount(items)).toBe(2);
    expect(cartTotal(items)).toBe(180000);
  });
  it("limita la cantidad por línea", () => {
    const items = addToCart([], { ...base, maxStock: 99 }, 50);
    expect(items[0].quantity).toBe(MAX_PER_LINE);
  });
  it("cambia cantidades y elimina con cantidad 0", () => {
    const items = addToCart([], base, 1);
    const key = itemKey(base);
    expect(setQuantity(items, key, 2)[0].quantity).toBe(2);
    expect(setQuantity(items, key, 0)).toEqual([]);
    expect(removeFromCart(items, key)).toEqual([]);
  });
  it("descarta datos corruptos o manipulados en localStorage", () => {
    expect(parseStoredCart("no-json")).toEqual([]);
    expect(parseStoredCart('{"a":1}')).toEqual([]);
    expect(parseStoredCart(JSON.stringify([{ ...base, quantity: -1 }, { ...base, price: "gratis", quantity: 1 }]))).toEqual([]);
    expect(parseStoredCart(JSON.stringify([{ ...base, quantity: 1 }]))).toHaveLength(1);
  });
});
