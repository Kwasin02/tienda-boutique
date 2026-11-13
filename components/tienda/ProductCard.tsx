import Link from "next/link";
import { Price } from "@/components/ui/Price";
import { ProductImage } from "@/components/ui/ProductImage";
import { discountPercent, totalStock, type Product } from "@/models/product";

export function ProductCard({ product }: { product: Product }) {
  const discount = discountPercent(product);
  const soldOut = totalStock(product) === 0;

  return (
    <article className="group relative">
      <div className="relative">
        <ProductImage src={product.images[0]} alt={product.name} />
        <div className="absolute left-3 top-3 flex flex-col items-start gap-1">
          {discount > 0 && <span className="rounded-full bg-salvia px-2.5 py-1 text-xs font-medium">−{discount}%</span>}
          {product.demo && <span className="rounded-full bg-blanco px-2.5 py-1 text-xs font-medium">DEMO</span>}
        </div>
      </div>
      <div className="space-y-1 pt-3">
        <h3 className="text-sm">
          {/* El enlace cubre toda la tarjeta para una zona táctil grande. */}
          <Link href={`/producto/${product.slug}`} className="after:absolute after:inset-0 group-hover:underline underline-offset-4">
            {product.name}
          </Link>
        </h3>
        <Price price={product.price} compareAtPrice={product.compareAtPrice} />
        <p className="text-xs text-musgo">{soldOut ? "Agotado" : "Disponible"}</p>
      </div>
    </article>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
      {products.map((p) => (
        <ProductCard key={p.slug} product={p} />
      ))}
    </div>
  );
}
