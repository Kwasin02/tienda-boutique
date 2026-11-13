"use server";

import { createRateLimiter } from "@/services/auth/rate-limit";
import { getProductsForCheckout } from "@/services/catalog";
import { buildOrderMessage, MAX_LINES, validateCart, type OrderLine } from "@/services/checkout";
import { formatPrice } from "@/services/format";
import { registerOrder } from "@/services/orders";
import { clientIp } from "@/services/request";
import { storeConfig } from "@/services/store-config";
import { whatsappLink } from "@/services/whatsapp";

// Evita llenar la base con pedidos falsos: 10 pedidos por IP cada hora.
const orderLimiter = createRateLimiter(10, 60 * 60_000);

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

  const ip = await clientIp();
  if (orderLimiter.isBlocked(ip)) {
    return { lines, issues, url: null, error: "Has preparado muchos pedidos seguidos. Espera un momento o escríbenos directamente por WhatsApp." };
  }

  try {
    const code = await registerOrder(lines);
    orderLimiter.hit(ip);
    const message = buildOrderMessage(lines, storeConfig.name, formatPrice, code);
    return { lines, issues, url: whatsappLink(message), message };
  } catch (e) {
    console.error("No se pudo registrar el pedido", e);
    return { lines, issues, url: null, error: "No pudimos preparar tu pedido. Inténtalo de nuevo en unos minutos." };
  }
}
