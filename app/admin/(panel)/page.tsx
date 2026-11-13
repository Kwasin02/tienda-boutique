import Link from "next/link";
import { db } from "@/database/client";
import { requireAdmin } from "@/services/auth/session";
import { formatPrice } from "@/services/format";
import { statusInfo } from "@/services/order-status";

// El panel depende de la sesión de cada petición: se renderiza siempre en el servidor, sin prerender.
export const instant = false;

export const metadata = { title: "Inicio" };

export default async function AdminHome() {
  const admin = await requireAdmin();
  const [pending, products, soldOut, demo, recent] = await Promise.all([
    db.order.count({ where: { status: "pendiente" } }),
    db.product.count({ where: { active: true } }),
    db.product.count({ where: { active: true, variants: { none: { stock: { gt: 0 } } } } }),
    db.product.count({ where: { demo: true } }),
    db.order.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  const stats = [
    { label: "Pedidos pendientes", value: pending, href: "/admin/pedidos?estado=pendiente" },
    { label: "Productos visibles", value: products, href: "/admin/productos" },
    { label: "Productos agotados", value: soldOut, href: "/admin/productos" },
  ];

  return (
    <div className="max-w-5xl space-y-8">
      <div>
        <h1 className="font-serif text-4xl">Hola</h1>
        <p className="mt-1 text-sm text-musgo">Sesión iniciada como {admin.email}</p>
      </div>

      {demo > 0 && (
        <p className="rounded-lg bg-arena px-4 py-3 text-sm">
          Hay {demo} producto(s) de demostración. Cuando cargues tus productos reales, elimínalos o desmarca «Producto DEMO» desde{" "}
          <Link href="/admin/productos" className="underline underline-offset-4">Productos</Link>.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="rounded-lg bg-blanco p-5 hover:bg-arena/40">
            <p className="text-sm text-musgo">{s.label}</p>
            <p className="mt-1 text-3xl font-medium">{s.value}</p>
          </Link>
        ))}
      </div>

      <section>
        <div className="mb-3 flex items-end justify-between">
          <h2 className="font-serif text-2xl">Últimos pedidos</h2>
          <Link href="/admin/pedidos" className="text-sm underline underline-offset-4">Ver todos</Link>
        </div>
        {recent.length === 0 ? (
          <p className="rounded-lg bg-blanco p-6 text-sm text-musgo">Aún no hay pedidos.</p>
        ) : (
          <ul className="divide-y divide-arena rounded-lg bg-blanco">
            {recent.map((o) => (
              <li key={o.id} className="flex items-center justify-between gap-3 p-4 text-sm">
                <Link href={`/admin/pedidos?q=${o.code}`} className="font-mono font-medium underline-offset-4 hover:underline">{o.code}</Link>
                <span className={`rounded-full px-2.5 py-1 text-xs ${statusInfo(o.status).className}`}>{statusInfo(o.status).label}</span>
                <span className="ml-auto font-medium">{formatPrice(o.total)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
