import Link from "next/link";
import { logout } from "@/app/admin/login/actions";
import { storeConfig } from "@/services/store-config";

export const metadata = { title: { default: "Panel", template: `%s · Panel · ${storeConfig.name}` }, robots: { index: false } };

const links = [
  { href: "/admin", label: "Inicio" },
  { href: "/admin/pedidos", label: "Pedidos" },
  { href: "/admin/productos", label: "Productos" },
  { href: "/admin/categorias", label: "Categorías" },
  { href: "/admin/tallas-colores", label: "Tallas y colores" },
  { href: "/admin/banners", label: "Banners" },
  { href: "/admin/ajustes", label: "Ajustes" },
];

// Las páginas del panel validan la sesión con requireAdmin(); este layout es solo navegación.
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="min-h-dvh bg-marfil lg:grid lg:grid-cols-[15rem_1fr]">
      <aside className="border-b border-arena bg-blanco lg:min-h-dvh lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-4 py-4 lg:block lg:px-6 lg:py-8">
          <Link href="/admin" className="font-serif text-xl uppercase tracking-[0.1em]">Panel</Link>
          <Link href="/" className="text-sm text-musgo underline underline-offset-4 lg:mt-1 lg:block" target="_blank">Ver tienda ↗</Link>
        </div>
        <nav aria-label="Panel" className="overflow-x-auto px-2 pb-2 lg:px-3">
          <ul className="flex gap-1 lg:flex-col">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="block whitespace-nowrap rounded-lg px-3 py-2.5 text-sm hover:bg-arena/60">{l.label}</Link>
              </li>
            ))}
            <li className="lg:mt-6">
              <form action={logout}>
                <button type="submit" className="w-full whitespace-nowrap rounded-lg px-3 py-2.5 text-left text-sm text-musgo hover:bg-arena/60">Cerrar sesión</button>
              </form>
            </li>
          </ul>
        </nav>
      </aside>
      <main id="contenido" className="min-w-0 px-4 py-8 sm:px-8 lg:py-10">{children}</main>
    </div>
  );
}
