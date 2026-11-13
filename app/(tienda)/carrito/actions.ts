"use server";

import { getProductsForCheckout } from "@/services/catalog";
import { buildOrderMessage, MAX_LINES, validateCart, type OrderLine } from "@/services/checkout";
import { formatPrice } from "@/services/format";
import { registerOrder } from "@/services/orders";
import { storeConfig } from "@/services/store-config";
import { whatsappLink } from "@/services/whatsapp";

export type CheckoutResult = { lines: OrderLine[]; issues: string[]; url: string | null; message?: string; error?: string };

// Recibe el carrito del navegador (no confiable), lo valida contra la base de datos,
// registra el pedido y devuelve el enlace wa.me con el resumen.
export async function prepareCheckout(rawCart: unknown): Promise<CheckoutResult> {
  const slugs = Array.isArray(rawCart)
    ? rawCart.slice(0, MAX_LINES).flatMap((i) => (typeof i?.slug === "string" ? [i.slug.slice(0, 120)] : []))
    : [];
  const { lines, issues } = validateCart(rawCart, slugs.length ? await getProductsForCheckout(slugs) : []);
  if (lines.length === 0) return { lines, issues, url: null, error: "Tu carrito está vacío." };
  if (!storeConfig.whatsappNumber) {
    return { lines, issues, url: null, error: "Los pedidos por WhatsApp no están disponibles en este momento." };
  }
  // Si algo cambió, el cliente revisa el carrito corregido antes de registrar el pedido.
  if (issues.length > 0) return { lines, issues, url: null };

  try {
    const code = await registerOrder(lines);
    const message = buildOrderMessage(lines, storeConfig.name, formatPrice, code);
    return { lines, issues, url: whatsappLink(message), message };
  } catch (e) {
    console.error("No se pudo registrar el pedido", e);
    return { lines, issues, url: null, error: "No pudimos preparar tu pedido. Inténtalo de nuevo en unos minutos." };
  }
}
