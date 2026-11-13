"use client";

import { useEffect } from "react";
import { button } from "@/components/ui/button";

export default function AdminError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => console.error(error), [error]);
  return (
    <div className="max-w-xl rounded-lg bg-blanco p-8">
      <h1 className="font-serif text-3xl">No se pudo completar la acción</h1>
      <p className="mt-3 text-sm text-musgo">
        Puede ser un problema momentáneo con la base de datos. Inténtalo de nuevo; si persiste, revisa los registros del servidor.
      </p>
      <button type="button" onClick={() => retry()} className={`${button.primary} mt-6`}>Reintentar</button>
    </div>
  );
}
