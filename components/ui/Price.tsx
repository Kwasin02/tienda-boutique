import { isOnSale } from "@/models/product";
import { formatPrice } from "@/services/format";

export function Price({ price, compareAtPrice }: { price: number; compareAtPrice?: number }) {
  const sale = isOnSale({ price, compareAtPrice });
  return (
    <p className="flex items-baseline gap-2">
      <span className="font-medium">{formatPrice(price)}</span>
      {sale && (
        <s className="text-sm text-musgo">
          <span className="sr-only">Antes </span>
          {formatPrice(compareAtPrice!)}
        </s>
      )}
    </p>
  );
}
