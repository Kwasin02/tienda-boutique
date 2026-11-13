import { describe, expect, it } from "vitest";
import { faqToText, parseFaq, parseProductForm, parseVariants } from "@/services/admin-forms";
import { slugify } from "@/services/slug";

const form = (o: Record<string, string>) => {
  const fd = new FormData();
  for (const [k, v] of Object.entries(o)) fd.set(k, v);
  return fd;
};
const valid = { name: "Vestido Lino", categoryId: "1", price: "96000", active: "on" };

describe("slugify", () => {
  it("crea URLs limpias sin tildes", () => {
    expect(slugify("  Vestido Midi de Lino Ñandú! ")).toBe("vestido-midi-de-lino-nandu");
  });
});

describe("formulario de producto", () => {
  it("acepta datos válidos y genera el slug", () => {
    const r = parseProductForm(form(valid));
    expect(r.success && r.data).toMatchObject({ slug: "vestido-lino", price: 96000, active: true, featured: false, compareAtPrice: undefined });
  });
  it("rechaza precios con decimales o negativos", () => {
    expect(parseProductForm(form({ ...valid, price: "96000.5" })).success).toBe(false);
    expect(parseProductForm(form({ ...valid, price: "-1" })).success).toBe(false);
  });
  it("exige que el precio anterior sea mayor", () => {
    expect(parseProductForm(form({ ...valid, compareAtPrice: "90000" })).success).toBe(false);
    expect(parseProductForm(form({ ...valid, compareAtPrice: "120000" })).success).toBe(true);
  });
  it("exige categoría y nombre", () => {
    expect(parseProductForm(form({ ...valid, categoryId: "" })).success).toBe(false);
    expect(parseProductForm(form({ ...valid, name: "a" })).success).toBe(false);
  });
});

describe("variantes", () => {
  it("vacío = no existe, 0 = agotada", () => {
    expect(parseVariants(form({ stock_1_2: "3", stock_1_3: "", stock_2_2: "0", otro: "x" }))).toEqual([
      { sizeId: 1, colorId: 2, stock: 3 },
      { sizeId: 2, colorId: 2, stock: 0 },
    ]);
  });
  it("rechaza stock inválido", () => {
    expect(() => parseVariants(form({ stock_1_1: "-2" }))).toThrow();
    expect(() => parseVariants(form({ stock_1_1: "1.5" }))).toThrow();
  });
});

describe("preguntas frecuentes", () => {
  it("convierte bloques de texto en preguntas y respuestas, ida y vuelta", () => {
    const faq = parseFaq("¿Hacen envíos?\nSí, a todo el país.\n\n¿Cambios?\nHasta 30 días.\nCon etiqueta.\n\n\n");
    expect(faq).toEqual([
      { q: "¿Hacen envíos?", a: "Sí, a todo el país." },
      { q: "¿Cambios?", a: "Hasta 30 días.\nCon etiqueta." },
    ]);
    expect(parseFaq(faqToText(faq))).toEqual(faq);
  });
});
