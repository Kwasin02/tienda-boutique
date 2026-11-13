import { storeConfig } from "@/services/store-config";

const formatter = new Intl.NumberFormat(storeConfig.locale, {
  style: "currency",
  currency: storeConfig.currency,
  maximumFractionDigits: 0,
});

export function formatPrice(amount: number) {
  return formatter.format(amount);
}
