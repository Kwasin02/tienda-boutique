import { storeConfig } from "@/services/store-config";

/** Enlace oficial wa.me con mensaje precargado. Devuelve null si no hay número configurado. */
export function whatsappLink(message: string, number = storeConfig.whatsappNumber) {
  if (!number) return null;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
