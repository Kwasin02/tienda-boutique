import { Footer } from "@/components/tienda/Footer";
import { Header } from "@/components/tienda/Header";

export default function StoreLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Header />
      <main id="contenido" className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  );
}
