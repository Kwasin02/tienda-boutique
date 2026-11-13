"use server";

import { getAllProducts } from "@/services/catalog";
import { buildOrderMessage, validateCart, type OrderLine } from "@/services/checkout";
import { formatPrice } from "@/services/format";
import { storeConfig } from "@/services/store-config";
import { whatsappLink } from "@/services/whatsapp";

export type CheckoutResult = { lines: OrderLine[]; issues: string[]; url: string | null; message?: string; error?: string };

// Recibe el carrito del navegador (no confiable), lo valida contra el catálogo y devuelve el enlace wa.me.
// En la Fase 5 aquí también se registrará el pedido en la base de datos.
export async function prepareCheckout(rawCart: unknown): Promise<CheckoutResult> {
  const { lines, issues } = validateCart(rawCart, await getAllProducts());
  if (lines.length === 0) return { lines, issues, url: null, error: "Tu carrito está vacío." };

  const message = buildOrderMessage(lines, storeConfig.name, formatPrice);
  const url = whatsappLink(message);
  if (!url) return { lines, issues, url: null, error: "Los pedidos por WhatsApp no están disponibles en este momento." };

  return { lines, issues, url, message };
}
