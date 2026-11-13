import Image from "next/image";
import { AdminForm, Check, ConfirmButton, Field, SubmitButton } from "@/components/admin/forms";
import { db } from "@/database/client";
import type { Banner } from "@/database/generated/client";
import { requireAdmin } from "@/services/auth/session";
import { deleteBanner, saveBanner } from "../catalog-actions";

// El panel depende de la sesión de cada petición: se renderiza siempre en el servidor, sin prerender.
export const instant = false;

export const metadata = { title: "Banners" };

export default async function BannersPage() {
  await requireAdmin();
  const banners = await db.banner.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="font-serif text-4xl">Banners</h1>
        <p className="mt-2 text-sm text-musgo">La portada muestra el primer banner activo según el orden.</p>
      </div>
      {banners.map((b) => (
        <section key={b.id} className="rounded-lg bg-blanco p-5">
          <BannerForm banner={b} />
          <AdminForm action={deleteBanner} className="mt-2">
            <input type="hidden" name="id" value={b.id} />
            <ConfirmButton message={`¿Eliminar el banner "${b.title}"?`}>Eliminar banner</ConfirmButton>
          </AdminForm>
        </section>
      ))}
      <section className="rounded-lg border border-dashed border-bosque/40 p-5">
        <h2 className="mb-4 font-serif text-2xl">Nuevo banner</h2>
        <BannerForm />
      </section>
    </div>
  );
}

function BannerForm({ banner }: { banner?: Banner }) {
  return (
    <AdminForm action={saveBanner} className="grid gap-4 sm:grid-cols-2">
      {banner && <input type="hidden" name="id" value={banner.id} />}
      <Field label="Antetítulo" name="eyebrow" maxLength={60} defaultValue={banner?.eyebrow} hint="Texto pequeño sobre el título." />
      <Field label="Título" name="title" required maxLength={120} defaultValue={banner?.title} />
      <div className="sm:col-span-2">
        <Field label="Subtítulo" name="subtitle" maxLength={300} defaultValue={banner?.subtitle} />
      </div>
      <Field label="Enlace del botón" name="linkUrl" required maxLength={200} defaultValue={banner?.linkUrl ?? "/catalogo"} hint="Ruta de la tienda, p. ej. /catalogo?categoria=vestidos" />
      <Field label="Texto del botón" name="linkLabel" required maxLength={40} defaultValue={banner?.linkLabel ?? "Ver catálogo"} />
      <Field label="Orden" name="sortOrder" type="number" min={0} max={999} defaultValue={banner?.sortOrder ?? 0} />
      <Check label="Activo" name="active" defaultChecked={banner?.active ?? true} />
      <div className="space-y-2 sm:col-span-2">
        {banner?.imageUrl && (
          <div className="flex items-center gap-4">
            <div className="relative aspect-[4/5] w-20 overflow-hidden bg-arena">
              <Image src={banner.imageUrl} alt="" fill sizes="80px" className="object-cover" />
            </div>
            <Check label="Quitar imagen" name="removeImage" />
          </div>
        )}
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">{banner?.imageUrl ? "Cambiar imagen" : "Imagen (opcional)"}</span>
          <input type="file" name="image" accept="image/jpeg,image/png,image/webp" className="block w-full text-sm file:mr-4 file:min-h-11 file:rounded-full file:border-0 file:bg-arena file:px-5" />
          <span className="mt-1 block text-xs text-musgo">Vertical 4:5 recomendada. Sin imagen se muestra una forma decorativa.</span>
        </label>
      </div>
      <div className="sm:col-span-2"><SubmitButton>{banner ? "Guardar banner" : "Crear banner"}</SubmitButton></div>
    </AdminForm>
  );
}
