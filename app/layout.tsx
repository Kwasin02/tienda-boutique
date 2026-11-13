import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { storeConfig } from "@/services/store-config";
import "@/styles/globals.css";

// next/font descarga las fuentes en el build y las sirve desde el propio dominio.
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-cormorant",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(storeConfig.url),
  title: { default: `${storeConfig.name} · Moda contemporánea`, template: `%s · ${storeConfig.name}` },
  description: "Tienda online de ropa. Explora el catálogo y finaliza tu pedido por WhatsApp.",
  openGraph: { type: "website", siteName: storeConfig.name, locale: "es" },
};

export const viewport: Viewport = { themeColor: "#f8f6f0" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${inter.variable} ${cormorant.variable}`}>
      <body className="flex min-h-dvh flex-col">{children}</body>
    </html>
  );
}
