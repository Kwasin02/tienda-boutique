import Image from "next/image";

// Foto 3:4 con lazy loading de next/image. Sin foto, muestra un marcador neutro.
export function ProductImage({
  src,
  alt,
  priority = false,
  sizes = "(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw",
}: {
  src?: string;
  alt: string;
  priority?: boolean;
  sizes?: string;
}) {
  return (
    <div className="relative aspect-[3/4] overflow-hidden bg-arena">
      {src ? (
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
      ) : (
        <div className="flex h-full items-center justify-center px-2 text-center font-serif text-base text-musgo" role="img" aria-label={`${alt} (sin fotografía)`}>
          Sin fotografía
        </div>
      )}
    </div>
  );
}
