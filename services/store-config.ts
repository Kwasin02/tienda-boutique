// Datos de la tienda leídos de variables de entorno (ver .env.example).
// En la Fase 6 los datos editables (horarios, redes, FAQ) pasarán al panel admin.

export const storeConfig = {
  name: process.env.STORE_NAME || "Nombre de tu tienda",
  url: process.env.STORE_URL || "http://localhost:3000",
  locale: process.env.STORE_LOCALE || "es-CO",
  currency: process.env.STORE_CURRENCY || "COP",
  // Solo dígitos con código de país. Vacío = botones de WhatsApp desactivados.
  whatsappNumber: (process.env.WHATSAPP_NUMBER || "").replace(/\D/g, ""),
};
