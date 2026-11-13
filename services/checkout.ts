// Checkout por WhatsApp: el carrito del navegador NO es confiable, así que aquí se reconstruye
// cada línea con el precio y el stock actuales del catálogo antes de armar el mensaje.

import { MAX_PER_LINE, type Product } from "@/models/product";

export type OrderLine = {
  slug: string;
  name: string;
  size: string;
  color: string;
  quantity: number;
  unitPrice: number;
  maxStock: number;
  image?: string;
};

export const MAX_LINES = 50;

export function validateCart(raw: unknown, products: Product[]) {
  const lines: OrderLine[] = [];
  const issues: string[] = [];
  if (!Array.isArray(raw)) return { lines, issues: ["El carrito no es válido."] };

  for (const item of raw.slice(0, MAX_LINES)) {
    if (!item || typeof item.slug !== "string" || typeof item.size !== "string" || typeof item.color !== "string") continue;
    const wanted = Number.isInteger(item.quantity) ? Math.min(Math.max(item.quantity, 1), MAX_PER_LINE) : 1;
    const product = products.find((p) => p.slug === item.slug);
    const variant = product?.variants.find((v) => v.size === item.size && v.color === item.color);

    if (!product || !variant) {
      issues.push("Un producto de tu carrito ya no está disponible y lo quitamos.");
      continue;
    }
    if (variant.stock === 0) {
      issues.push(`${product.name} (${item.size}, ${item.color}) se agotó y lo quitamos.`);
      continue;
    }
    const quantity = Math.min(wanted, variant.stock);
    if (quantity < wanted) issues.push(`Solo quedan ${variant.stock} de ${product.name} (${item.size}, ${item.color}); ajustamos la cantidad.`);
    if (typeof item.price === "number" && item.price !== product.price) issues.push(`El precio de ${product.name} cambió; lo actualizamos.`);

    lines.push({
      slug: product.slug,
      name: product.name,
      size: variant.size,
      color: variant.color,
      quantity,
      unitPrice: product.price,
      maxStock: variant.stock,
      image: product.images[0],
    });
  }
  return { lines, issues };
}

export const orderTotal = (lines: OrderLine[]) => lines.reduce((n, l) => n + l.unitPrice * l.quantity, 0);

export function buildOrderMessage(lines: OrderLine[], storeName: string, format: (n: number) => string, code?: string) {
  const units = lines.reduce((n, l) => n + l.quantity, 0);
  const body = lines
    .map(
      (l, i) =>
        `${i + 1}. ${l.name}\n` +
        `   Talla: ${l.size} · Color: ${l.color}\n` +
        `   ${l.quantity} × ${format(l.unitPrice)} = ${format(l.unitPrice * l.quantity)}`,
    )
    .join("\n\n");

  return [
    `Hola, quiero hacer este pedido en ${storeName}:`,
    ...(code ? [`Pedido #${code}`] : []),
    "",
    body,
    "",
    `Subtotal (${units} ${units === 1 ? "artículo" : "artículos"}): ${format(orderTotal(lines))}`,
    "Envío: por confirmar",
    `*Total: ${format(orderTotal(lines))}*`,
    "",
    "¿Me confirman disponibilidad y forma de pago? Gracias.",
  ].join("\n");
}
