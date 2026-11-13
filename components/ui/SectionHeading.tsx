import Link from "next/link";

export function SectionHeading({ title, href, linkLabel = "Ver todo" }: { title: string; href?: string; linkLabel?: string }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <h2 className="font-serif text-3xl leading-tight sm:text-4xl">{title}</h2>
      {href && (
        <Link href={href} className="shrink-0 py-2 text-sm underline underline-offset-4 hover:text-musgo">
          {linkLabel}
        </Link>
      )}
    </div>
  );
}
