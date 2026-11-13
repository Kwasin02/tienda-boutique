import { AdminForm, ConfirmButton, Field, SubmitButton } from "@/components/admin/forms";
import { db } from "@/database/client";
import { requireAdmin } from "@/services/auth/session";
import { deleteCategory, saveCategory } from "../catalog-actions";

// El panel depende de la sesión de cada petición: se renderiza siempre en el servidor, sin prerender.
export const instant = false;

export const metadata = { title: "Categorías" };

export default async function CategoriesPage() {
  await requireAdmin();
  const categories = await db.category.findMany({ orderBy: { sortOrder: "asc" }, include: { _count: { select: { products: true } } } });

  return (
    <div className="max-w-4xl space-y-8">
      <h1 className="font-serif text-4xl">Categorías</h1>

      <ul className="space-y-4">
        {categories.map((c) => (
          <li key={c.id} className="rounded-lg bg-blanco p-5">
            <AdminForm action={saveCategory} className="grid gap-4 sm:grid-cols-2">
              <input type="hidden" name="id" value={c.id} />
              <Field label="Nombre" name="name" required maxLength={60} defaultValue={c.name} />
              <Field label="URL" name="slug" maxLength={60} defaultValue={c.slug} />
              <Field label="Descripción corta" name="description" maxLength={200} defaultValue={c.description} />
              <Field label="Orden" name="sortOrder" type="number" min={0} max={999} defaultValue={c.sortOrder} />
              <div className="flex items-center gap-3 sm:col-span-2">
                <SubmitButton variant="secondary">Guardar</SubmitButton>
                <span className="text-sm text-musgo">{c._count.products} producto(s)</span>
              </div>
            </AdminForm>
            <AdminForm action={deleteCategory} className="mt-2">
              <input type="hidden" name="id" value={c.id} />
              <ConfirmButton message={`¿Eliminar la categoría "${c.name}"?`}>Eliminar</ConfirmButton>
            </AdminForm>
          </li>
        ))}
      </ul>

      <section className="rounded-lg border border-dashed border-bosque/40 p-5">
        <h2 className="mb-4 font-serif text-2xl">Nueva categoría</h2>
        <AdminForm action={saveCategory} className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre" name="name" required maxLength={60} />
          <Field label="URL (opcional)" name="slug" maxLength={60} hint="Se genera del nombre si la dejas vacía." />
          <Field label="Descripción corta" name="description" maxLength={200} />
          <Field label="Orden" name="sortOrder" type="number" min={0} max={999} defaultValue={categories.length} />
          <div className="sm:col-span-2"><SubmitButton>Crear categoría</SubmitButton></div>
        </AdminForm>
      </section>
    </div>
  );
}
