"use client";

import Link from "next/link";
import { useState, useSyncExternalStore, useTransition } from "react";
import { prepareCheckout, type CheckoutResult } from "@/app/carrito/actions";
import { button } from "@/components/ui/button";
import { WhatsappIcon } from "@/components/ui/icons";
import { ProductImage } from "@/components/ui/ProductImage";
import { cart, cartCount, cartTotal, itemKey, MAX_PER_LINE, useCart, type CartItem } from "@/services/cart";
import { makePriceFormatter } from "@/services/format";

const noop = () => () => {};
const useHydrated = () => useSyncExternalStore(noop, () => true, () => false);

export function CartView({ locale, currency }: { locale: string; currency: string }) {
  const items = useCart();
  const hydrated = useHydrated();
  const format = makePriceFormatter(locale, currency);
  const [checkout, setCheckout] = useState<CheckoutResult | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [pending, startTransition] = useTransition();
  const [failed, setFailed] = useState(false);

  // Cualquier cambio en el carrito invalida el resumen ya preparado.
  const edit = (fn: () => void) => {
    fn();
    setCheckout(null);
  };

  function review() {
    setFailed(false);
    startTransition(async () => {
      try {
        const result = await prepareCheckout(items);
        cart.replace(result.lines.map((l) => ({ ...l, price: l.unitPrice })));
        setCheckout(result);
      } catch {
        setFailed(true);
      }
    });
  }

  if (!hydrated) {
    return <div className="mt-10 h-64 animate-pulse rounded-lg bg-arena/60" aria-busy="true" aria-label="Cargando carrito" />;
  }

  if (items.length === 0) {
    return (
      <div className="mt-10 rounded-lg bg-blanco px-6 py-16 text-center">
        {checkout?.issues.map((m) => <p key={m} className="mb-2 text-sm text-musgo">{m}</p>)}
        <h2 className="font-serif text-3xl">Tu carrito está vacío</h2>
        <p className="mt-2 text-musgo">Explora el catálogo y agrega tus prendas favoritas.</p>
        <Link href="/catalogo" className={`${button.primary} mt-6`}>Ver catálogo</Link>
      </div>
    );
  }

  const count = cartCount(items);

  return (
    <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_22rem]">
      <section aria-label="Productos en el carrito">
        <ul className="divide-y divide-arena border-y border-arena">
          {items.map((item) => (
            <CartLine key={itemKey(item)} item={item} format={format} edit={edit} />
          ))}
        </ul>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <Link href="/catalogo" className={button.ghost}>← Continuar comprando</Link>
          {confirmClear ? (
            <div className="flex flex-wrap items-center gap-2 text-sm" role="alert">
              <span className="w-full sm:w-auto">¿Vaciar el carrito? Se quitarán todos los productos.</span>
              <button type="button" className={button.secondary} onClick={() => edit(() => { cart.clear(); setConfirmClear(false); })}>Sí, vaciar</button>
              <button type="button" className={button.ghost} onClick={() => setConfirmClear(false)}>Cancelar</button>
            </div>
          ) : (
            <button type="button" className={button.ghost} onClick={() => setConfirmClear(true)}>Vaciar carrito</button>
          )}
        </div>
      </section>

      <aside aria-label="Resumen del pedido" className="h-fit rounded-lg bg-blanco p-6 lg:sticky lg:top-28">
        <h2 className="font-serif text-2xl">Resumen</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between"><dt>Subtotal ({count} {count === 1 ? "artículo" : "artículos"})</dt><dd>{format(cartTotal(items))}</dd></div>
          <div className="flex justify-between text-musgo"><dt>Envío</dt><dd>Por confirmar</dd></div>
          <div className="flex justify-between border-t border-arena pt-3 text-base font-medium"><dt>Total</dt><dd>{format(cartTotal(items))}</dd></div>
        </dl>

        <div aria-live="polite" className="mt-5 space-y-3">
          {failed && <p className="rounded-lg bg-arena px-4 py-3 text-sm">No pudimos preparar tu pedido. Revisa tu conexión e inténtalo de nuevo.</p>}
          {checkout?.error && <p className="rounded-lg bg-arena px-4 py-3 text-sm">{checkout.error}</p>}
          {checkout && checkout.issues.length > 0 && (
            <ul className="space-y-1 rounded-lg bg-arena px-4 py-3 text-sm">
              {checkout.issues.map((m) => <li key={m}>{m}</li>)}
              {!checkout.url && <li className="pt-1 font-medium">Revisa tu carrito y vuelve a pulsar Finalizar.</li>}
            </ul>
          )}
        </div>

        {checkout?.url ? (
          <div className="mt-4">
            <p className="text-sm font-medium">Este es el mensaje que se enviará:</p>
            <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap rounded-lg bg-marfil p-3 font-sans text-xs leading-relaxed">{checkout.message}</pre>
            <a href={checkout.url} target="_blank" rel="noopener noreferrer" className={`${button.primary} mt-4 w-full`}>
              <WhatsappIcon /> Abrir WhatsApp
            </a>
            <p className="mt-3 text-xs leading-relaxed text-musgo">
              Se abrirá WhatsApp con el mensaje listo. Podrás revisarlo y lo envías tú; no se envía solo.
            </p>
          </div>
        ) : (
          <button type="button" onClick={review} disabled={pending} className={`${button.primary} mt-5 w-full`}>
            <WhatsappIcon /> {pending ? "Preparando pedido…" : "Finalizar pedido por WhatsApp"}
          </button>
        )}
      </aside>
    </div>
  );
}

function CartLine({ item, format, edit }: { item: CartItem; format: (n: number) => string; edit: (fn: () => void) => void }) {
  const key = itemKey(item);
  const max = Math.min(item.maxStock, MAX_PER_LINE);
  return (
    <li className="flex gap-4 py-5">
      <Link href={`/producto/${item.slug}`} className="w-24 shrink-0 sm:w-28" tabIndex={-1} aria-hidden="true">
        <ProductImage src={item.image} alt={item.name} sizes="112px" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex justify-between gap-3">
          <div>
            <h3><Link href={`/producto/${item.slug}`} className="hover:underline underline-offset-4">{item.name}</Link></h3>
            <p className="mt-1 text-sm text-musgo">Talla {item.size} · {item.color}</p>
            <p className="mt-1 text-sm text-musgo">{format(item.price)} c/u</p>
          </div>
          <p className="shrink-0 font-medium">{format(item.price * item.quantity)}</p>
        </div>
        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          <div className="flex h-11 items-center rounded-full border border-arena bg-blanco">
            <button type="button" className="size-11" aria-label={`Restar uno de ${item.name}`} onClick={() => edit(() => cart.setQuantity(key, item.quantity - 1))}>−</button>
            <span className="w-8 text-center text-sm" aria-label={`Cantidad: ${item.quantity}`}>{item.quantity}</span>
            <button
              type="button"
              className="size-11 disabled:opacity-40"
              aria-label={`Sumar uno de ${item.name}`}
              disabled={item.quantity >= max}
              onClick={() => edit(() => cart.setQuantity(key, item.quantity + 1))}
            >
              +
            </button>
          </div>
          <button type="button" className="min-h-11 text-sm text-musgo underline underline-offset-4 hover:text-bosque" onClick={() => edit(() => cart.remove(key))}>
            Eliminar
          </button>
        </div>
      </div>
    </li>
  );
}
