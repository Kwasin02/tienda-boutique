import Image from "next/image";
import { AdminForm, Check, ConfirmButton, Field, selectClass, SubmitButton, TextArea } from "@/components/admin/forms";
import { db } from "@/database/client";
import { MAX_FILES_PER_UPLOAD } from "@/services/uploads";
import { deleteProduct, saveProduct } from "./actions";

type Editable = NonNullable<Awaited<ReturnType<typeof loadProduct>>>;

export function loadProduct(id: number) {
  return db.product.findUnique({ where: { id }, include: { images: { orderBy: { sortOrder: "asc" } }, variants: true } });
}

export async function ProductForm({ product }: { product?: Editable }) {
  const [categories, sizes, colors] = await Promise.all([
    db.category.findMany({ orderBy: { sortOrder: "asc" } }),
    db.size.findMany({ orderBy: { sortOrder: "asc" } }),
    db.color.findMany({ orderBy: { name: "asc" } }),
  ]);
  const stockOf = (sizeId: number, colorId: number) =>
    product?.variants.find((v) => v.sizeId === sizeId && v.colorId === colorId)?.stock;

  return (
    <AdminForm action={saveProduct} className="space-y-8">
      {product && <input type="hidden" name="id" value={product.id} />}

      <section className="grid gap-5 rounded-lg bg-blanco p-6 md:grid-cols-2">
        <h2 className="font-serif text-2xl md:col-span-2">Información</h2>
        <Field label="Nombre" name="name" required minLength={2} maxLength={120} defaultValue={product?.name} />
        <Field label="URL (opcional)" name="slug" maxLength={80} defaultValue={product?.slug} hint="Se genera del nombre si lo dejas vacío." />
        <div className="md:col-span-2">
          <TextArea label="Descripción" name="description" maxLength={4000} rows={5} defaultValue={product?.description} />
        </div>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Categoría</span>
          <select name="categoryId" required defaultValue={product?.categoryId ?? ""} className={selectClass}>
            <option value="" disabled>Elige una categoría</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <div className="flex flex-wrap gap-x-6">
          <Check label="Visible en la tienda" name="active" defaultChecked={product?.active ?? true} />
          <Check label="Destacado" name="featured" defaultChecked={product?.featured} />
          <Check label="Más vendido" name="bestSeller" defaultChecked={product?.bestSeller} />
          <Check label="Producto DEMO" name="demo" defaultChecked={product?.demo} />
        </div>
      </section>

      <section className="grid gap-5 rounded-lg bg-blanco p-6 md:grid-cols-2">
        <h2 className="font-serif text-2xl md:col-span-2">Precio y promoción</h2>
        <Field label="Precio (COP)" name="price" type="number" inputMode="numeric" min={0} step={1} required defaultValue={product?.price} />
        <Field
          label="Precio anterior (COP)"
          name="compareAtPrice"
          type="number"
          inputMode="numeric"
          min={0}
          step={1}
          defaultValue={product?.compareAtPrice ?? ""}
          hint="Para mostrar una promoción. Debe ser mayor que el precio. Vacío = sin promoción."
        />
      </section>

      <section className="rounded-lg bg-blanco p-6">
        <h2 className="font-serif text-2xl">Tallas, colores y stock</h2>
        <p className="mt-1 text-sm text-musgo">Escribe las unidades disponibles. Vacío = esa combinación no existe. 0 = agotada (se muestra tachada).</p>
        <div className="mt-4 overflow-x-auto">
          <table className="text-sm">
            <thead>
              <tr>
                <th className="p-2 text-left font-medium">Talla</th>
                {colors.map((c) => (
                  <th key={c.id} className="p-2 text-left font-medium">
                    <span className="flex items-center gap-2 whitespace-nowrap">
                      {c.hex && <span className="size-3 rounded-full border border-arena" style={{ background: c.hex }} aria-hidden="true" />}
                      {c.name}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sizes.map((s) => (
                <tr key={s.id}>
                  <th scope="row" className="p-2 text-left font-medium">{s.name}</th>
                  {colors.map((c) => (
                    <td key={c.id} className="p-1">
                      <input
                        name={`stock_${s.id}_${c.id}`}
                        type="number"
                        inputMode="numeric"
                        min={0}
                        step={1}
                        aria-label={`Stock talla ${s.name}, color ${c.name}`}
                        defaultValue={stockOf(s.id, c.id) ?? ""}
                        className="h-11 w-20 rounded-lg border border-arena bg-marfil px-2 focus:border-bosque focus:outline-none"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-lg bg-blanco p-6">
        <h2 className="font-serif text-2xl">Fotografías</h2>
        {product && product.images.length > 0 && (
          <ul className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
            {product.images.map((img, i) => (
              <li key={img.id} className="space-y-2">
                <div className="relative aspect-[3/4] overflow-hidden bg-arena">
                  <Image src={img.url} alt={img.alt} fill sizes="160px" className="object-cover" />
                </div>
                <p className="text-xs text-musgo">{i === 0 ? "Principal" : `Foto ${i + 1}`}</p>
                <Check label="Quitar" name="removeImage" value={String(img.id)} />
              </li>
            ))}
          </ul>
        )}
        <label className="mt-4 block">
          <span className="mb-1.5 block text-sm font-medium">Agregar fotos</span>
          <input
            type="file"
            name="images"
            multiple
            accept="image/jpeg,image/png,image/webp"
            className="block w-full text-sm file:mr-4 file:min-h-11 file:rounded-full file:border-0 file:bg-arena file:px-5 file:text-sm"
          />
          <span className="mt-1 block text-xs text-musgo">
            JPG, PNG o WebP · máximo {MAX_FILES_PER_UPLOAD} por vez y {process.env.MAX_UPLOAD_MB || 5} MB cada una. La primera foto es la principal. Recomendado: vertical 3:4.
          </span>
        </label>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <SubmitButton>{product ? "Guardar cambios" : "Crear producto"}</SubmitButton>
        {product && (
          <ConfirmButton formAction={deleteProduct} message={`¿Eliminar "${product.name}"? Esta acción no se puede deshacer.`}>
            Eliminar producto
          </ConfirmButton>
        )}
      </div>
    </AdminForm>
  );
}
