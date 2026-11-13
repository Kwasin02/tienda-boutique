import { AdminForm, ConfirmButton, Field, SubmitButton } from "@/components/admin/forms";
import { db } from "@/database/client";
import { requireAdmin } from "@/services/auth/session";
import { deleteColor, deleteSize, saveColor, saveSize } from "../catalog-actions";

// El panel depende de la sesión de cada petición: se renderiza siempre en el servidor, sin prerender.
export const instant = false;

export const metadata = { title: "Tallas y colores" };

export default async function SizesColorsPage() {
  await requireAdmin();
  const [sizes, colors] = await Promise.all([
    db.size.findMany({ orderBy: { sortOrder: "asc" } }),
    db.color.findMany({ orderBy: { name: "asc" } }),
  ]);
  const row = "flex flex-wrap items-end gap-3 rounded-lg bg-blanco p-4";

  return (
    <div className="grid max-w-5xl gap-10 lg:grid-cols-2">
      <section className="space-y-3">
        <h1 className="font-serif text-4xl">Tallas</h1>
        <p className="text-sm text-musgo">El orden define cómo aparecen en la tienda (XS, S, M…).</p>
        {sizes.map((s) => (
          <div key={s.id} className={row}>
            <AdminForm action={saveSize} className="flex flex-wrap items-end gap-3">
              <input type="hidden" name="id" value={s.id} />
              <Field label="Talla" name="name" required maxLength={20} defaultValue={s.name} className="w-24" />
              <Field label="Orden" name="sortOrder" type="number" min={0} max={999} defaultValue={s.sortOrder} className="w-20" />
              <SubmitButton variant="secondary">Guardar</SubmitButton>
            </AdminForm>
            <AdminForm action={deleteSize}>
              <input type="hidden" name="id" value={s.id} />
              <ConfirmButton message={`¿Eliminar la talla ${s.name}?`}>Eliminar</ConfirmButton>
            </AdminForm>
          </div>
        ))}
        <AdminForm action={saveSize} className={`${row} border border-dashed border-bosque/40`}>
          <Field label="Nueva talla" name="name" required maxLength={20} className="w-24" />
          <Field label="Orden" name="sortOrder" type="number" min={0} max={999} defaultValue={sizes.length} className="w-20" />
          <SubmitButton>Agregar</SubmitButton>
        </AdminForm>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-4xl">Colores</h2>
        <p className="text-sm text-musgo">El código de color es opcional y se usa como muestra.</p>
        {colors.map((c) => (
          <div key={c.id} className={row}>
            <AdminForm action={saveColor} className="flex flex-wrap items-end gap-3">
              <input type="hidden" name="id" value={c.id} />
              <Field label="Color" name="name" required maxLength={30} defaultValue={c.name} className="w-36" />
              <Field label="Código" name="hex" type="color" defaultValue={c.hex ?? "#ffffff"} className="w-16 px-1" />
              <SubmitButton variant="secondary">Guardar</SubmitButton>
            </AdminForm>
            <AdminForm action={deleteColor}>
              <input type="hidden" name="id" value={c.id} />
              <ConfirmButton message={`¿Eliminar el color ${c.name}?`}>Eliminar</ConfirmButton>
            </AdminForm>
          </div>
        ))}
        <AdminForm action={saveColor} className={`${row} border border-dashed border-bosque/40`}>
          <Field label="Nuevo color" name="name" required maxLength={30} className="w-36" />
          <Field label="Código" name="hex" type="color" defaultValue="#e8e2d7" className="w-16 px-1" />
          <SubmitButton>Agregar</SubmitButton>
        </AdminForm>
      </section>
    </div>
  );
}
