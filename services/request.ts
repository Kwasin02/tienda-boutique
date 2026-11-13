import { headers } from "next/headers";

/** IP del cliente. Detrás de un proxy (Vercel, Nginx, Railway) llega en x-forwarded-for. */
export async function clientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "local";
}
