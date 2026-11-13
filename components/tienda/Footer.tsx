import Link from "next/link";
import { navLinks } from "@/components/tienda/Header";
import { getCategories } from "@/services/catalog";
import { storeConfig } from "@/services/store-config";

export async function Footer() {
  const categories = await getCategories();
  return (
    <footer className="mt-24 border-t border-arena bg-arena/50">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div>
          <p className="font-serif text-2xl uppercase tracking-[0.12em]">{storeConfig.name}</p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-musgo">
            Moda contemporánea. Pedidos y asesoría personalizada por WhatsApp.
          </p>
        </div>
        <FooterList title="Tienda" links={navLinks} />
        <FooterList title="Categorías" links={categories.map((c) => ({ href: `/catalogo?categoria=${c.slug}`, label: c.name }))} />
        <FooterList
          title="Ayuda"
          links={[
            { href: "/contacto#preguntas-frecuentes", label: "Preguntas frecuentes" },
            { href: "/contacto", label: "Horarios y contacto" },
            { href: "/carrito", label: "Mi carrito" },
          ]}
        />
      </div>
      <p className="border-t border-arena px-4 py-6 text-center text-xs text-musgo">
        © {storeConfig.name}. Los productos marcados como DEMO son contenido de demostración.
      </p>
    </footer>
  );
}

function FooterList({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h2 className="text-xs font-medium uppercase tracking-[0.15em]">{title}</h2>
      <ul className="mt-4 space-y-1 text-sm">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="inline-block py-1.5 text-musgo hover:text-bosque">{l.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
