import Link from "next/link";
import { button } from "@/components/ui/button";
import { selectClass } from "@/components/admin/forms";
import { db } from "@/database/client";
import { requireAdmin } from "@/services/auth/session";
import { formatPrice } from "@/services/format";
import { ORDER_STATUSES, statusInfo } from "@/services/order-status";
import { updateOrderStatus } from "./actions";

// El panel depende de la sesión de cada petición: se renderiza siempre en el servidor, sin prerender.
export const instant = false;

export const metadata = { title: "Pedidos" };

const PAGE_SIZE = 50;
const dateFmt = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Bogota" });

export default async function OrdersPage({ searchParams }: PageProps<"/admin/pedidos">) {
  await requireAdmin();
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim().toUpperCase().slice(0, 20) : "";
  const estado = typeof sp.estado === "string" && sp.estado in ORDER_STATUSES ? sp.estado : "";

  const orders = await db.order.findMany({
    where: { ...(q && { code: { contains: q } }), ...(estado && { status: estado }) },
    orderBy: { createdAt: "desc" },
    take: PAGE_SIZE,
    include: { items: true },
  });

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="font-serif text-4xl">Pedidos</h1>
        <p className="mt-2 text-sm text-musgo">
          Cada pedido se registra cuando el cliente prepara su mensaje de WhatsApp. Confírmalo en el chat y actualiza su estado aquí.
        </p>
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-lg bg-blanco p-4" role="search">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Código</span>
          <input name="q" defaultValue={q} placeholder="P-ABC234" maxLength={20} className={`${selectClass} w-40 uppercase`} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Estado</span>
          <select name="estado" defaultValue={estado} className={`${selectClass} w-40`}>
            <option value="">Todos</option>
            {Object.entries(ORDER_STATUSES).map(([v, s]) => <option key={v} value={v}>{s.label}</option>)}
          </select>
        </label>
        <button type="submit" className={button.secondary}>Buscar</button>
        {(q || estado) && <Link href="/admin/pedidos" className={button.ghost}>Limpiar</Link>}
      </form>

      {orders.length === 0 ? (
        <p className="rounded-lg bg-blanco p-8 text-center text-musgo">{q || estado ? "Ningún pedido coincide." : "Aún no hay pedidos."}</p>
      ) : (
        <ul className="space-y-3">
          {orders.map((o) => (
            <li key={o.id} className="rounded-lg bg-blanco p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-lg font-medium">{o.code}</p>
                  <p className="text-sm text-musgo">{dateFmt.format(o.createdAt)} · {o.itemsCount} artículo(s)</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-medium">{formatPrice(o.total)}</p>
                  <span className={`inline-block rounded-full px-2.5 py-1 text-xs ${statusInfo(o.status).className}`}>{statusInfo(o.status).label}</span>
                </div>
              </div>
              <ul className="mt-3 space-y-1 border-t border-arena pt-3 text-sm">
                {o.items.map((i) => (
                  <li key={i.id} className="flex justify-between gap-3">
                    <span>{i.quantity} × {i.productName} <span className="text-musgo">({i.size}, {i.color})</span></span>
                    <span className="shrink-0">{formatPrice(i.unitPrice * i.quantity)}</span>
                  </li>
                ))}
              </ul>
              <form action={updateOrderStatus} className="mt-4 flex flex-wrap items-center gap-2">
                <input type="hidden" name="code" value={o.code} />
                <label className="sr-only" htmlFor={`estado-${o.id}`}>Estado del pedido {o.code}</label>
                <select id={`estado-${o.id}`} name="status" defaultValue={o.status} className={`${selectClass} w-44`}>
                  {Object.entries(ORDER_STATUSES).map(([v, s]) => <option key={v} value={v}>{s.label}</option>)}
                </select>
                <button type="submit" className={button.secondary}>Actualizar estado</button>
              </form>
            </li>
          ))}
        </ul>
      )}
      {orders.length === PAGE_SIZE && <p className="text-sm text-musgo">Se muestran los {PAGE_SIZE} más recientes. Usa la búsqueda para encontrar pedidos anteriores.</p>}
    </div>
  );
}
