import type { Metadata } from "next";
import { button } from "@/components/ui/button";
import { WhatsappIcon } from "@/components/ui/icons";
import { getStoreSettings } from "@/services/store-settings";
import { storeConfig } from "@/services/store-config";
import { whatsappLink } from "@/services/whatsapp";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Escríbenos por WhatsApp, consulta horarios de atención y preguntas frecuentes.",
  alternates: { canonical: "/contacto" },
};

export default async function ContactPage() {
  const s = await getStoreSettings();
  const wa = whatsappLink("Hola, quisiera hacer una consulta.");
  const socials = [
    { label: "Instagram", href: s.instagram },
    { label: "Facebook", href: s.facebook },
    { label: "TikTok", href: s.tiktok },
  ].filter((x) => x.href);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="font-serif text-5xl">Contacto</h1>
      {s.about && <p className="mt-4 max-w-2xl leading-relaxed text-musgo">{s.about}</p>}

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <section className="rounded-lg bg-blanco p-6">
          <h2 className="font-serif text-2xl">Escríbenos</h2>
          {wa ? (
            <>
              <p className="mt-2 text-sm text-musgo">La forma más rápida: WhatsApp +{storeConfig.whatsappNumber}</p>
              <a href={wa} target="_blank" rel="noopener noreferrer" className={`${button.primary} mt-5`}>
                <WhatsappIcon /> Abrir WhatsApp
              </a>
            </>
          ) : (
            <p className="mt-2 text-sm text-musgo">Muy pronto podrás escribirnos por WhatsApp.</p>
          )}
          <dl className="mt-6 space-y-3 text-sm">
            {s.email && (
              <div>
                <dt className="font-medium">Correo</dt>
                <dd><a href={`mailto:${s.email}`} className="underline underline-offset-4">{s.email}</a></dd>
              </div>
            )}
            {s.address && (
              <div>
                <dt className="font-medium">Ubicación</dt>
                <dd className="text-musgo">{s.address}</dd>
              </div>
            )}
            {socials.length > 0 && (
              <div>
                <dt className="font-medium">Redes sociales</dt>
                <dd className="mt-1 flex flex-wrap gap-2">
                  {socials.map((x) => (
                    <a key={x.label} href={x.href} target="_blank" rel="noopener noreferrer" className="rounded-full border border-arena px-4 py-2 hover:border-bosque">
                      {x.label}
                    </a>
                  ))}
                </dd>
              </div>
            )}
          </dl>
        </section>

        <section className="rounded-lg bg-blanco p-6">
          <h2 className="font-serif text-2xl">Horarios de atención</h2>
          {s.hours.length > 0 ? (
            <ul className="mt-3 space-y-1 text-sm">{s.hours.map((h) => <li key={h}>{h}</li>)}</ul>
          ) : (
            <p className="mt-2 text-sm text-musgo">Escríbenos cuando quieras; respondemos lo antes posible.</p>
          )}
        </section>
      </div>

      {s.faq.length > 0 && (
        <section id="preguntas-frecuentes" className="mt-16 scroll-mt-24">
          <h2 className="font-serif text-4xl">Preguntas frecuentes</h2>
          <div className="mt-6 divide-y divide-arena border-y border-arena">
            {s.faq.map((f) => (
              <details key={f.q} className="group py-2">
                <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 font-medium [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span aria-hidden="true" className="text-xl transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="whitespace-pre-line pb-4 text-sm leading-relaxed text-musgo">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
