import Image from "next/image";
import Link from "next/link";
import { button } from "@/components/ui/button";
import { db } from "@/database/client";
import { requireAdmin } from "@/services/auth/session";
import { formatPrice } from "@/services/format";

// El panel depende de la sesión de cada petición: se renderiza siempre en el servidor, sin prerender.
export const instant = false;

export const metadata = { title: "Productos" };

export default async function ProductsPage({ searchParams }: PageProps<"/admin/productos">) {
  await requireAdmin();
  const { eliminado } = await searchParams;
  const products = await db.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true, images: { take: 1, orderBy: { sortOrder: "asc" } }, variants: { select: { stock: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-4xl">Productos</h1>
        <Link href="/admin/productos/nuevo" className={button.primary}>Nuevo producto</Link>
      </div>
      {eliminado && <p className="rounded-lg bg-salvia/40 px-4 py-3 text-sm">Producto eliminado.</p>}

      {products.length === 0 ? (
        <p className="rounded-lg bg-blanco p-8 text-center text-musgo">Aún no hay productos. Crea el primero.</p>
      ) : (
        <ul className="divide-y divide-arena rounded-lg bg-blanco">
          {products.map((p) => {
            const stock = p.variants.reduce((n, v) => n + v.stock, 0);
            return (
              <li key={p.id}>
                <Link href={`/admin/productos/${p.id}`} className="flex items-center gap-4 p-4 hover:bg-marfil">
                  <div className="relative aspect-[3/4] w-12 shrink-0 overflow-hidden bg-arena">
                    {p.images[0] && <Image src={p.images[0].url} alt="" fill sizes="48px" className="object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{p.name}</p>
                    <p className="text-sm text-musgo">
                      {p.category.name} · {formatPrice(p.price)}
                      {p.compareAtPrice ? <s className="ml-1">{formatPrice(p.compareAtPrice)}</s> : null}
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5 text-xs">
                      {!p.active && <span className="rounded-full bg-arena px-2 py-1">Oculto</span>}
                      {p.demo && <span className="rounded-full bg-arena px-2 py-1">DEMO</span>}
                      {p.featured && <span className="rounded-full bg-salvia/50 px-2 py-1">Destacado</span>}
                      <span className={`rounded-full px-2 py-1 ${stock === 0 ? "bg-red-50 text-red-900" : "bg-marfil"}`}>
                        {stock === 0 ? "Agotado" : `${stock} uds.`}
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
