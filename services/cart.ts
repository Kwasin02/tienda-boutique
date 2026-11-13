// Carrito en el navegador, persistido en localStorage (sobrevive a recargas y se sincroniza entre pestañas).
// Los precios guardados son solo para mostrar: en el checkout (Fase 4/5) el servidor los vuelve a validar.

import { useSyncExternalStore } from "react";
import { MAX_PER_LINE } from "@/models/product";

export type CartItem = {
  slug: string;
  name: string;
  price: number;
  size: string;
  color: string;
  quantity: number;
  maxStock: number;
  image?: string;
};

export { MAX_PER_LINE };
const STORAGE_KEY = "tienda.carrito.v1";

export const itemKey = (i: Pick<CartItem, "slug" | "size" | "color">) => `${i.slug}|${i.size}|${i.color}`;
const limit = (i: Pick<CartItem, "maxStock">) => Math.min(i.maxStock, MAX_PER_LINE);

// --- Operaciones puras (probadas en tests/unit/cart.test.ts) ---

export function addToCart(items: CartItem[], item: Omit<CartItem, "quantity">, quantity: number): CartItem[] {
  const key = itemKey(item);
  const existing = items.find((i) => itemKey(i) === key);
  const wanted = (existing?.quantity ?? 0) + quantity;
  const next = { ...item, quantity: Math.max(1, Math.min(wanted, limit(item))) };
  return existing ? items.map((i) => (itemKey(i) === key ? next : i)) : [...items, next];
}

export function setQuantity(items: CartItem[], key: string, quantity: number): CartItem[] {
  if (quantity < 1) return removeFromCart(items, key);
  return items.map((i) => (itemKey(i) === key ? { ...i, quantity: Math.min(Math.floor(quantity), limit(i)) } : i));
}

export function removeFromCart(items: CartItem[], key: string): CartItem[] {
  return items.filter((i) => itemKey(i) !== key);
}

export const cartCount = (items: CartItem[]) => items.reduce((n, i) => n + i.quantity, 0);
export const cartTotal = (items: CartItem[]) => items.reduce((n, i) => n + i.price * i.quantity, 0);

/** localStorage es editable por el usuario: se descarta todo lo que no tenga la forma esperada. */
export function parseStoredCart(raw: string | null): CartItem[] {
  try {
    const data: unknown = JSON.parse(raw ?? "[]");
    if (!Array.isArray(data)) return [];
    return data.filter(
      (i): i is CartItem =>
        i && typeof i.slug === "string" && typeof i.name === "string" && typeof i.size === "string" &&
        typeof i.color === "string" && Number.isInteger(i.price) && i.price >= 0 &&
        Number.isInteger(i.quantity) && i.quantity > 0 && Number.isInteger(i.maxStock) && i.maxStock > 0,
    );
  } catch {
    return [];
  }
}

// --- Store para React ---

const EMPTY: CartItem[] = [];
let snapshot: CartItem[] | null = null;
const listeners = new Set<() => void>();

function read() {
  if (snapshot === null) {
    try {
      snapshot = parseStoredCart(localStorage.getItem(STORAGE_KEY));
    } catch {
      snapshot = EMPTY; // almacenamiento bloqueado (modo privado estricto)
    }
  }
  return snapshot;
}

function write(items: CartItem[]) {
  snapshot = items;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Sin almacenamiento el carrito sigue funcionando en memoria durante la visita.
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      snapshot = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useCart() {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export const cart = {
  add: (item: Omit<CartItem, "quantity">, quantity: number) => write(addToCart(read(), item, quantity)),
  setQuantity: (key: string, quantity: number) => write(setQuantity(read(), key, quantity)),
  remove: (key: string) => write(removeFromCart(read(), key)),
  clear: () => write([]),
  /** Sustituye el carrito por la versión validada por el servidor. */
  replace: (items: CartItem[]) => write(items),
};
