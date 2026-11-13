"use client";

import Link from "next/link";
import { BagIcon } from "@/components/ui/icons";
import { cartCount, useCart } from "@/services/cart";

export function CartLink() {
  const count = cartCount(useCart());
  return (
    <Link href="/carrito" className="relative flex size-11 items-center justify-center lg:ml-2" aria-label={`Carrito, ${count} ${count === 1 ? "artículo" : "artículos"}`}>
      <BagIcon className="size-6" />
      {count > 0 && (
        <span aria-hidden="true" className="absolute right-0.5 top-0.5 flex min-w-5 items-center justify-center rounded-full bg-bosque px-1 text-[11px] font-medium leading-5 text-marfil">
          {count}
        </span>
      )}
    </Link>
  );
}
