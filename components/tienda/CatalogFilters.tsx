import Link from "next/link";
import { button } from "@/components/ui/button";
import type { Category } from "@/models/product";
import { sortOptions, type CatalogFilters } from "@/services/catalog-filters";

// Formulario GET: funciona sin JavaScript y deja URLs compartibles (/catalogo?categoria=vestidos&talla=M).
export function CatalogFiltersForm({
  filters,
  categories,
  sizes,
  colors,
}: {
  filters: CatalogFilters;
  categories: Category[];
  sizes: string[];
  colors: string[];
}) {
  const field = "h-11 w-full rounded-lg border border-arena bg-blanco px-3 text-sm focus:border-bosque focus:outline-none";
  const label = "mb-1.5 block text-xs font-medium uppercase tracking-[0.12em]";

  return (
    <form action="/catalogo" className="space-y-5">
      {filters.q && <input type="hidden" name="q" value={filters.q} />}

      <div>
        <label htmlFor="orden" className={label}>Ordenar por</label>
        <select id="orden" name="orden" defaultValue={filters.orden} className={field}>
          {Object.entries(sortOptions).map(([value, text]) => (
            <option key={value} value={value}>{text}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="categoria" className={label}>Categoría</label>
        <select id="categoria" name="categoria" defaultValue={filters.categoria ?? ""} className={field}>
          <option value="">Todas</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>{c.name}</option>
          ))}
        </select>
      </div>

      <fieldset>
        <legend className={label}>Talla</legend>
        <div className="flex flex-wrap gap-2">
          <Chip name="talla" value="" text="Todas" checked={!filters.talla} />
          {sizes.map((s) => (
            <Chip key={s} name="talla" value={s} text={s} checked={filters.talla === s} />
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className={label}>Color</legend>
        <div className="flex flex-wrap gap-2">
          <Chip name="color" value="" text="Todos" checked={!filters.color} />
          {colors.map((c) => (
            <Chip key={c} name="color" value={c} text={c} checked={filters.color === c} />
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className={label}>Precio (COP)</legend>
        <div className="grid grid-cols-2 gap-2">
          <input aria-label="Precio mínimo" name="min" type="number" inputMode="numeric" min={0} step={1000} placeholder="Mínimo" defaultValue={filters.min} className={field} />
          <input aria-label="Precio máximo" name="max" type="number" inputMode="numeric" min={0} step={1000} placeholder="Máximo" defaultValue={filters.max} className={field} />
        </div>
      </fieldset>

      <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
        <input type="checkbox" name="promocion" value="1" defaultChecked={filters.promocion} className="size-5 accent-bosque" />
        Solo promociones
      </label>

      <div className="flex flex-wrap gap-2 pt-1">
        <button type="submit" className={`${button.primary} flex-1`}>Aplicar</button>
        <Link href="/catalogo" className={button.secondary}>Limpiar</Link>
      </div>
    </form>
  );
}

function Chip({ name, value, text, checked }: { name: string; value: string; text: string; checked: boolean }) {
  return (
    <label className="cursor-pointer">
      <input type="radio" name={name} value={value} defaultChecked={checked} className="peer sr-only" />
      <span className="flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-arena bg-blanco px-3 text-sm peer-checked:border-bosque peer-checked:bg-bosque peer-checked:text-marfil peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-bosque">
        {text}
      </span>
    </label>
  );
}
