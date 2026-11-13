import type { Metadata } from "next";
import { CartView } from "@/components/tienda/CartView";
import { storeConfig } from "@/services/store-config";

export const metadata: Metadata = {
  title: "Carrito",
  robots: { index: false },
};

export default function CartPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="font-serif text-4xl sm:text-5xl">Tu carrito</h1>
      <CartView locale={storeConfig.locale} currency={storeConfig.currency} />
    </div>
  );
}
