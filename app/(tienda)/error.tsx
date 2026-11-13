"use client";

import Link from "next/link";
import { useEffect } from "react";
import { button } from "@/components/ui/button";

export default function StoreError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => console.error(error), [error]);
  return (
    <section className="mx-auto flex max-w-xl flex-col items-center px-4 py-28 text-center">
      <h1 className="font-serif text-4xl">Algo no salió bien</h1>
      <p className="mt-4 text-musgo">No pudimos cargar esta página. Inténtalo de nuevo en unos segundos.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={() => retry()} className={button.primary}>Reintentar</button>
        <Link href="/" className={button.secondary}>Ir al inicio</Link>
      </div>
    </section>
  );
}
