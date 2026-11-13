import { storeConfig } from "@/services/store-config";

// shortcut: sin decimales, correcto para COP; si se usa una moneda con centavos, quitar maximumFractionDigits.
export function makePriceFormatter(locale: string, currency: string) {
  const f = new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 0 });
  return (amount: number) => f.format(amount);
}

export const formatPrice = makePriceFormatter(storeConfig.locale, storeConfig.currency);
