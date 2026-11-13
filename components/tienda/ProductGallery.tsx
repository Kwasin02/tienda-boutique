"use client";

import Image from "next/image";
import { useState } from "react";
import { ProductImage } from "@/components/ui/ProductImage";

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const sizes = "(min-width: 1024px) 50vw, 100vw";

  return (
    <div className="space-y-3">
      <ProductImage src={images[active]} alt={name} priority sizes={sizes} />
      {images.length > 1 && (
        <ul className="grid grid-cols-5 gap-2" aria-label="Fotografías del producto">
          {images.map((src, i) => (
            <li key={src}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Ver foto ${i + 1} de ${images.length}`}
                aria-current={i === active}
                className={`relative block aspect-[3/4] w-full overflow-hidden bg-arena ring-offset-2 ${i === active ? "ring-1 ring-bosque" : ""}`}
              >
                <Image src={src} alt="" fill sizes="20vw" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
