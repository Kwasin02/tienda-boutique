import Link from "next/link";
import { Footer } from "@/components/tienda/Footer";
import { Header } from "@/components/tienda/Header";
import { button } from "@/components/ui/button";

export const metadata = { title: "Página no encontrada" };

export default function NotFound() {
  return (
    <>
      <Header />
      <main id="contenido" className="flex-1">
        <section className="mx-auto flex max-w-xl flex-col items-center px-4 py-28 text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-musgo">Error 404</p>
          <h1 className="mt-4 font-serif text-4xl sm:text-5xl">No encontramos esta página</h1>
          <p className="mt-4 text-musgo">Puede que el enlace haya cambiado o que el producto ya no esté disponible.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/catalogo" className={button.primary}>Ver catálogo</Link>
            <Link href="/" className={button.secondary}>Ir al inicio</Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
