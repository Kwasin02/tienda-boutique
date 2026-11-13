import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/services/auth/session";
import { loadProduct, ProductForm } from "../ProductForm";

// El panel depende de la sesión de cada petición: se renderiza siempre en el servidor, sin prerender.
export const instant = false;

export const metadata = { title: "Editar producto" };

export default async function EditProductPage({ params, searchParams }: PageProps<"/admin/productos/[id]">) {
  await requireAdmin();
  const [{ id }, { creado }] = await Promise.all([params, searchParams]);
  const product = Number.isInteger(Number(id)) ? await loadProduct(Number(id)) : null;
  if (!product) notFound();

  return (
    <div className="max-w-4xl space-y-6">
      <Link href="/admin/productos" className="text-sm text-musgo underline underline-offset-4">← Productos</Link>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-serif text-4xl">{product.name}</h1>
        {product.active && (
          <Link href={`/producto/${product.slug}`} target="_blank" className="text-sm underline underline-offset-4">Ver en la tienda ↗</Link>
        )}
      </div>
      {creado && <p className="rounded-lg bg-salvia/40 px-4 py-3 text-sm">Producto creado. Ya se ve en la tienda.</p>}
      <ProductForm product={product} />
    </div>
  );
}
