import type { MetadataRoute } from "next";
import { storeConfig } from "@/services/store-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/carrito"] },
    sitemap: new URL("/sitemap.xml", storeConfig.url).toString(),
  };
}
