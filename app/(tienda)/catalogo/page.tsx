import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CatalogFiltersForm } from "@/components/tienda/CatalogFilters";
import { ProductGrid } from "@/components/tienda/ProductCard";
import { button } from "@/components/ui/button";
import { applyFilters, facetValues, parseFilters } from "@/services/catalog-filters";
import { getAllProducts, getCategories } from "@/services/catalog";

export const metadata: Metadata = {
  title: "Catálogo",
  description: "Explora toda la colección: filtra por categoría, talla, color y precio.",
  alternates: { canonical: "/catalogo" },
};

export default function CatalogPage({ searchParams }: PageProps<"/catalogo">) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="font-serif text-4xl sm:text-5xl">Catálogo</h1>
      {/* searchParams solo existe en tiempo de petición: el resto de la página se sirve estático. */}
      <Suspense fallback={<CatalogSkeleton />}>
        <CatalogResults searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function CatalogResults({ searchParams }: { searchParams: PageProps<"/catalogo">["searchParams"] }) {
  const filters = parseFilters(await searchParams);
  const [products, categories] = await Promise.all([getAllProducts(), getCategories()]);
  const results = applyFilters(products, filters);
  const { sizes, colors } = facetValues(products);
  const category = categories.find((c) => c.slug === filters.categoria);

  const form = <CatalogFiltersForm filters={filters} categories={categories} sizes={sizes} colors={colors} />;

  return (
    <>
      <p className="mt-2 text-sm text-musgo" aria-live="polite">
        {filters.q && <>Resultados para «{filters.q}» · </>}
        {category && <>{category.name} · </>}
        {results.length} {results.length === 1 ? "producto" : "productos"}
      </p>

      <div className="mt-8 grid gap-10 lg:grid-cols-[16rem_1fr]">
        <details className="rounded-lg border border-arena bg-blanco/60 lg:hidden">
          <summary className="flex min-h-12 cursor-pointer items-center px-4 text-sm font-medium">Filtrar y ordenar</summary>
          <div className="border-t border-arena p-4">{form}</div>
        </details>
        <aside aria-label="Filtros" className="hidden lg:block">{form}</aside>

        <div>
          {results.length > 0 ? (
            <ProductGrid products={results} />
          ) : (
            <div className="rounded-lg bg-blanco px-6 py-16 text-center">
              <h2 className="font-serif text-3xl">Ningún producto coincide</h2>
              <p className="mt-2 text-musgo">Prueba con menos filtros o con otra búsqueda.</p>
              <Link href="/catalogo" className={`${button.secondary} mt-6`}>Ver todo el catálogo</Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function CatalogSkeleton() {
  return (
    <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4" aria-busy="true" aria-label="Cargando productos">
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className="aspect-[3/4] animate-pulse bg-arena/70" />
      ))}
    </div>
  );
}
