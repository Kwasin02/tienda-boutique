"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { button } from "@/components/ui/button";
import { WhatsappIcon } from "@/components/ui/icons";
import type { Product } from "@/models/product";
import { cart, MAX_PER_LINE } from "@/services/cart";

type Props = {
  product: Pick<Product, "slug" | "name" | "price" | "variants" | "images">;
  whatsappNumber: string;
  productUrl: string;
};

const unique = (xs: string[]) => [...new Set(xs)];

export function ProductPurchase({ product, whatsappNumber, productUrl }: Props) {
  const colors = unique(product.variants.map((v) => v.color));
  const sizes = unique(product.variants.map((v) => v.size));
  const [color, setColor] = useState(colors.length === 1 ? colors[0] : "");
  const [size, setSize] = useState(sizes.length === 1 ? sizes[0] : "");
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);
  const ids = useId();

  const stockOf = (s: string, c: string) =>
    product.variants.filter((v) => (!s || v.size === s) && (!c || v.color === c)).reduce((n, v) => n + v.stock, 0);
  const variantStock = size && color ? stockOf(size, color) : null;
  const maxQty = Math.max(1, Math.min(variantStock ?? MAX_PER_LINE, MAX_PER_LINE));
  const soldOut = stockOf("", "") === 0;

  function choose(kind: "size" | "color", value: string) {
    if (kind === "size") setSize(value);
    else setColor(value);
    setQuantity(1);
    setError("");
    setAdded(false);
  }

  function addToCart() {
    if (!color) return setError("Elige un color para continuar.");
    if (!size) return setError("Elige una talla para continuar.");
    if (!variantStock) return setError("Esta combinación está agotada. Prueba con otra talla o color.");
    cart.add(
      { slug: product.slug, name: product.name, price: product.price, size, color, maxStock: variantStock, image: product.images[0] },
      quantity,
    );
    setAdded(true);
  }

  const selection = [size && `talla ${size}`, color && `color ${color}`].filter(Boolean).join(", ");
  const waHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        `Hola, me interesa este producto: ${product.name}${selection ? ` (${selection})` : ""}.\n${productUrl}`,
      )}`
    : null;

  const option = "flex min-h-11 min-w-11 items-center justify-center rounded-lg border px-3 text-sm transition-colors";

  return (
    <div className="space-y-6">
      <fieldset>
        <legend className="mb-2 text-sm">
          Color{color && <span className="text-musgo">: {color}</span>}
        </legend>
        <div className="flex flex-wrap gap-2">
          {colors.map((c) => {
            const available = stockOf(size, c) > 0;
            return (
              <button
                key={c}
                type="button"
                aria-pressed={color === c}
                onClick={() => choose("color", c)}
                className={`${option} ${color === c ? "border-bosque bg-bosque text-marfil" : "border-arena bg-blanco hover:border-bosque"} ${available ? "" : "text-musgo line-through"}`}
              >
                {c}
                {!available && <span className="sr-only"> (agotado)</span>}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-sm">
          Talla{size && <span className="text-musgo">: {size}</span>}
        </legend>
        <div className="flex flex-wrap gap-2">
          {sizes.map((s) => {
            const available = stockOf(s, color) > 0;
            return (
              <button
                key={s}
                type="button"
                aria-pressed={size === s}
                onClick={() => choose("size", s)}
                className={`${option} ${size === s ? "border-bosque bg-bosque text-marfil" : "border-arena bg-blanco hover:border-bosque"} ${available ? "" : "text-musgo line-through"}`}
              >
                {s}
                {!available && <span className="sr-only"> (agotada)</span>}
              </button>
            );
          })}
        </div>
      </fieldset>

      <p className="text-sm text-musgo" aria-live="polite">
        {soldOut
          ? "Producto agotado."
          : variantStock === null
            ? "Selecciona talla y color para ver la disponibilidad."
            : variantStock === 0
              ? "Agotado en esta combinación."
              : variantStock <= 3
                ? `Últimas ${variantStock} unidades.`
                : "Disponible."}
      </p>

      <div className="flex items-end gap-3">
        <div>
          <label htmlFor={`${ids}-qty`} className="mb-2 block text-sm">Cantidad</label>
          <div className="flex h-12 items-center rounded-full border border-arena bg-blanco">
            <button type="button" className="size-12 text-lg" aria-label="Restar uno" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>−</button>
            <input
              id={`${ids}-qty`}
              type="number"
              inputMode="numeric"
              min={1}
              max={maxQty}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Math.min(maxQty, Math.floor(Number(e.target.value)) || 1)))}
              className="w-10 bg-transparent text-center text-sm [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button type="button" className="size-12 text-lg" aria-label="Sumar uno" onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}>+</button>
          </div>
        </div>
        <button type="button" onClick={addToCart} disabled={soldOut} className={`${button.primary} flex-1`}>
          {soldOut ? "Agotado" : "Agregar al carrito"}
        </button>
      </div>

      <div aria-live="assertive">
        {error && <p className="rounded-lg bg-arena px-4 py-3 text-sm" id={`${ids}-error`}>{error}</p>}
        {added && (
          <p className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-salvia/40 px-4 py-3 text-sm">
            Agregado al carrito.
            <Link href="/carrito" className="font-medium underline underline-offset-4">Ver carrito</Link>
          </p>
        )}
      </div>

      {waHref && (
        <a href={waHref} target="_blank" rel="noopener noreferrer" className={`${button.secondary} w-full`}>
          <WhatsappIcon /> Consultar por WhatsApp
        </a>
      )}
    </div>
  );
}
