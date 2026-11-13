import Link from "next/link";
import { requireAdmin } from "@/services/auth/session";
import { ProductForm } from "../ProductForm";

// El panel depende de la sesión de cada petición: se renderiza siempre en el servidor, sin prerender.
export const instant = false;

export const metadata = { title: "Nuevo producto" };

export default async function NewProductPage() {
  await requireAdmin();
  return (
    <div className="max-w-4xl space-y-6">
      <Link href="/admin/productos" className="text-sm text-musgo underline underline-offset-4">← Productos</Link>
      <h1 className="font-serif text-4xl">Nuevo producto</h1>
      <ProductForm />
    </div>
  );
}
