import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/tienda/ProductCard";
import { ProductGallery } from "@/components/tienda/ProductGallery";
import { ProductPurchase } from "@/components/tienda/ProductPurchase";
import { Price } from "@/components/ui/Price";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { discountPercent, totalStock } from "@/models/product";
import { getAllProducts, getCategories, getProductBySlug, getRelatedProducts } from "@/services/catalog";
import { storeConfig } from "@/services/store-config";

// Ruta bloqueante a propósito: así un slug inexistente responde 404 real (bueno para SEO)
// en lugar de un 200 con contenido en streaming. Los productos conocidos se sirven prerenderizados.
export const instant = false;

export async function generateStaticParams() {
  const products = await getAllProducts();
  // Next.js 16 exige al menos un resultado; con la tienda aún vacía se usa uno que da 404.
  return products.length ? products.map((p) => ({ slug: p.slug })) : [{ slug: "sin-productos" }];
}

export async function generateMetadata({ params }: PageProps<"/producto/[slug]">): Promise<Metadata> {
  const product = await getProductBySlug((await params).slug);
  if (!product) return { title: "Producto no encontrado" };
  return {
    title: product.name,
    description: product.description,
    alternates: { canonical: `/producto/${product.slug}` },
    // Los productos de demostración no deben aparecer en buscadores.
    ...(product.demo && { robots: { index: false } }),
    openGraph: { title: product.name, description: product.description, images: product.images.slice(0, 1) },
  };
}

export default async function ProductPage({ params }: PageProps<"/producto/[slug]">) {
  const product = await getProductBySlug((await params).slug);
  if (!product) notFound();

  const [categories, related] = await Promise.all([getCategories(), getRelatedProducts(product)]);
  const category = categories.find((c) => c.slug === product.categorySlug);
  const discount = discountPercent(product);
  const productUrl = new URL(`/producto/${product.slug}`, storeConfig.url).toString();

  // Datos estructurados para buscadores (schema.org/Product).
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: storeConfig.currency,
      availability: totalStock(product) > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: productUrl,
    },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <nav aria-label="Ruta de navegación" className="mb-6 text-sm text-musgo">
        <ol className="flex flex-wrap gap-2">
          <li><Link href="/" className="hover:text-bosque">Inicio</Link> /</li>
          <li><Link href="/catalogo" className="hover:text-bosque">Catálogo</Link> /</li>
          {category && (
            <li><Link href={`/catalogo?categoria=${category.slug}`} className="hover:text-bosque">{category.name}</Link> /</li>
          )}
          <li aria-current="page" className="text-bosque">{product.name}</li>
        </ol>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
        <ProductGallery images={product.images} name={product.name} />

        <div className="lg:sticky lg:top-28 lg:self-start">
          <div className="flex flex-wrap gap-2">
            {product.demo && <span className="rounded-full bg-blanco px-2.5 py-1 text-xs font-medium">DEMO · producto de demostración</span>}
            {discount > 0 && <span className="rounded-full bg-salvia px-2.5 py-1 text-xs font-medium">−{discount}%</span>}
          </div>
          <h1 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">{product.name}</h1>
          <div className="mt-3 text-lg">
            <Price price={product.price} compareAtPrice={product.compareAtPrice} />
          </div>
          <p className="mt-5 leading-relaxed text-musgo">{product.description}</p>

          <div className="mt-8 border-t border-arena pt-8">
            <ProductPurchase
              product={{ slug: product.slug, name: product.name, price: product.price, variants: product.variants, images: product.images }}
              whatsappNumber={storeConfig.whatsappNumber}
              productUrl={productUrl}
            />
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-24">
          <SectionHeading title="También te puede gustar" />
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}
