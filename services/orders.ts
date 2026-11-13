import { randomInt } from "node:crypto";
import { db } from "@/database/client";
import { orderTotal, type OrderLine } from "@/services/checkout";

// Sin 0/O/1/I para que el código se lea sin confusiones al dictarlo por chat.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const newOrderCode = () => "P-" + Array.from({ length: 6 }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");

/** Guarda el pedido como "pendiente" (intención de compra; se confirma en WhatsApp). Devuelve su código. */
export async function registerOrder(lines: OrderLine[]) {
  const data = {
    status: "pendiente",
    total: orderTotal(lines),
    itemsCount: lines.reduce((n, l) => n + l.quantity, 0),
    items: {
      create: lines.map((l) => ({
        productSlug: l.slug,
        productName: l.name,
        size: l.size,
        color: l.color,
        quantity: l.quantity,
        unitPrice: l.unitPrice,
      })),
    },
  };
  // 32^6 ≈ mil millones de códigos: un choque es muy improbable, pero se reintenta por si acaso.
  for (let attempt = 0; ; attempt++) {
    try {
      const order = await db.order.create({ data: { ...data, code: newOrderCode() } });
      return order.code;
    } catch (e) {
      if (attempt >= 2 || (e as { code?: string }).code !== "P2002") throw e;
    }
  }
}
