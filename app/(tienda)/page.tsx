import Image from "next/image";
import Link from "next/link";
import { ProductGrid } from "@/components/tienda/ProductCard";
import { button } from "@/components/ui/button";
import { WhatsappIcon } from "@/components/ui/icons";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getActiveBanner, getBestSellers, getCategories, getFeaturedProducts, getNewArrivals, getOnSale } from "@/services/catalog";
import { whatsappLink } from "@/services/whatsapp";

export default async function HomePage() {
  const [banner, categories, featured, bestSellers, newArrivals, onSale] = await Promise.all([
    getActiveBanner(),
    getCategories(),
    getFeaturedProducts(),
    getBestSellers(),
    getNewArrivals(),
    getOnSale(),
  ]);
  const waHref = whatsappLink("Hola, quisiera hacer una consulta sobre la tienda.");

  return (
    <>
      {/* Banner principal: se edita desde el panel admin. */}
      {banner && (
        <section className="bg-arena">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-2 lg:py-32">
            <div>
              {banner.eyebrow && <p className="text-xs uppercase tracking-[0.25em] text-musgo">{banner.eyebrow}</p>}
              <h1 className="mt-5 font-serif text-5xl leading-[1.05] sm:text-6xl lg:text-7xl">{banner.title}</h1>
              {banner.subtitle && <p className="mt-6 max-w-md leading-relaxed text-musgo">{banner.subtitle}</p>}
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href={banner.linkUrl} className={button.primary}>{banner.linkLabel}</Link>
                <Link href="/catalogo?orden=novedades" className={button.secondary}>Novedades</Link>
              </div>
            </div>
            {banner.imageUrl ? (
              <div className="relative aspect-[4/5] overflow-hidden rounded-t-full max-lg:hidden">
                <Image src={banner.imageUrl} alt="" fill priority sizes="50vw" className="object-cover" />
              </div>
            ) : (
              <div aria-hidden="true" className="hidden aspect-[4/5] rounded-t-full bg-salvia/60 lg:block" />
            )}
          </div>
        </section>
      )}

      <div className="mx-auto max-w-7xl space-y-20 px-4 pt-16 sm:px-6 sm:pt-20">
        <section aria-labelledby="colecciones">
          <SectionHeading title="Colecciones" />
          <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4" id="colecciones">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/catalogo?categoria=${c.slug}`}
                  className="flex aspect-[4/5] flex-col justify-end rounded-sm bg-blanco p-5 transition-colors hover:bg-arena/60"
                >
                  <span className="font-serif text-2xl">{c.name}</span>
                  <span className="mt-1 text-sm text-musgo">{c.description}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <SectionHeading title="Destacados" href="/catalogo" />
          <ProductGrid products={featured} />
        </section>

        <section>
          <SectionHeading title="Más vendidos" href="/catalogo" />
          <ProductGrid products={bestSellers} />
        </section>

        <section>
          <SectionHeading title="Novedades" href="/catalogo?orden=novedades" />
          <ProductGrid products={newArrivals} />
        </section>

        {onSale.length > 0 && (
          <section className="rounded-sm bg-salvia/35 px-4 py-12 sm:px-10">
            <SectionHeading title="Promociones" href="/catalogo?promocion=1" linkLabel="Ver promociones" />
            <ProductGrid products={onSale} />
          </section>
        )}

        <section className="grid gap-8 border-t border-arena pt-16 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="font-serif text-4xl">¿Te ayudamos a elegir?</h2>
            <p className="mt-3 max-w-md leading-relaxed text-musgo">
              Escríbenos para consultar tallas, disponibilidad o envíos. Respondemos en nuestro horario de atención.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            {waHref && (
              <a href={waHref} target="_blank" rel="noopener noreferrer" className={button.primary}>
                <WhatsappIcon /> Escribir por WhatsApp
              </a>
            )}
            <Link href="/contacto" className={button.secondary}>Ver contacto y horarios</Link>
          </div>
        </section>
      </div>
    </>
  );
}
