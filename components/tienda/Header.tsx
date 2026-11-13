import Link from "next/link";
import { CartLink } from "@/components/tienda/CartLink";
import { MenuIcon, SearchIcon } from "@/components/ui/icons";
import { storeConfig } from "@/services/store-config";

export const navLinks = [
  { href: "/catalogo?orden=novedades", label: "Novedades" },
  { href: "/catalogo", label: "Catálogo" },
  { href: "/catalogo?promocion=1", label: "Promociones" },
  { href: "/contacto", label: "Contacto" },
];

function SearchForm({ id }: { id: string }) {
  return (
    <form action="/catalogo" role="search" className="relative">
      <label htmlFor={id} className="sr-only">Buscar productos</label>
      <input
        id={id}
        name="q"
        type="search"
        placeholder="Buscar"
        maxLength={80}
        className="h-11 w-full rounded-full border border-arena bg-blanco pl-4 pr-11 text-sm placeholder:text-musgo focus:border-bosque focus:outline-none"
      />
      <button type="submit" className="absolute right-0 top-0 flex size-11 items-center justify-center" aria-label="Buscar">
        <SearchIcon />
      </button>
    </form>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-arena bg-marfil/95 backdrop-blur">
      <a href="#contenido" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:rounded focus:bg-blanco focus:px-3 focus:py-2">
        Saltar al contenido
      </a>
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:h-20">
        {/* Menú móvil sin JavaScript: <details> nativo. */}
        <details className="group lg:hidden">
          <summary className="flex size-11 cursor-pointer list-none items-center justify-center [&::-webkit-details-marker]:hidden" aria-label="Abrir menú">
            <MenuIcon className="size-6" />
          </summary>
          <nav aria-label="Menú móvil" className="absolute inset-x-0 top-16 border-b border-arena bg-marfil px-4 pb-6 pt-2 shadow-sm">
            <SearchForm id="buscar-movil" />
            <ul className="mt-4">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="block border-b border-arena py-4 text-base">{l.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </details>

        <Link href="/" className="truncate whitespace-nowrap font-serif text-xl tracking-[0.12em] uppercase sm:text-2xl max-lg:mx-auto">
          {storeConfig.name}
        </Link>

        <nav aria-label="Principal" className="ml-10 hidden lg:block">
          <ul className="flex gap-8 text-sm">
            {navLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="py-2 underline-offset-8 hover:underline">{l.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto hidden w-64 lg:block">
          <SearchForm id="buscar" />
        </div>

        <CartLink />
      </div>
    </header>
  );
}
