import { AdminForm, Field, SubmitButton, TextArea } from "@/components/admin/forms";
import { db } from "@/database/client";
import { faqToText } from "@/services/admin-forms";
import { MIN_PASSWORD_LENGTH } from "@/services/auth/password";
import { requireAdmin } from "@/services/auth/session";
import { storeConfig } from "@/services/store-config";
import { changePassword, saveSettings } from "./actions";

// El panel depende de la sesión de cada petición: se renderiza siempre en el servidor, sin prerender.
export const instant = false;

export const metadata = { title: "Ajustes" };

export default async function SettingsPage() {
  await requireAdmin();
  const s = await db.storeSettings.findUnique({ where: { id: 1 } });
  let faq: { q: string; a: string }[] = [];
  try {
    faq = JSON.parse(s?.faq ?? "[]");
  } catch {}

  return (
    <div className="max-w-3xl space-y-10">
      <h1 className="font-serif text-4xl">Ajustes</h1>

      <section className="rounded-lg bg-blanco p-6">
        <h2 className="font-serif text-2xl">Contacto y página de contacto</h2>
        <p className="mt-1 text-sm text-musgo">
          WhatsApp: {storeConfig.whatsappNumber ? `+${storeConfig.whatsappNumber}` : "sin configurar"} · Se cambia en la variable WHATSAPP_NUMBER del servidor.
        </p>
        <AdminForm action={saveSettings} className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <TextArea label="Sobre la tienda" name="about" maxLength={1000} rows={3} defaultValue={s?.about} />
          </div>
          <Field label="Correo de contacto" name="email" type="email" maxLength={200} defaultValue={s?.email} />
          <Field label="Dirección o ciudad" name="address" maxLength={300} defaultValue={s?.address} />
          <Field label="Instagram" name="instagram" type="url" placeholder="https://instagram.com/tutienda" maxLength={200} defaultValue={s?.instagram} />
          <Field label="Facebook" name="facebook" type="url" placeholder="https://facebook.com/tutienda" maxLength={200} defaultValue={s?.facebook} />
          <Field label="TikTok" name="tiktok" type="url" placeholder="https://tiktok.com/@tutienda" maxLength={200} defaultValue={s?.tiktok} />
          <div className="sm:col-span-2">
            <TextArea label="Horarios de atención" name="hours" maxLength={1000} rows={3} defaultValue={s?.hours} hint="Una línea por horario. Ej.: Lunes a viernes: 9:00 a 18:00" />
          </div>
          <div className="sm:col-span-2">
            <TextArea
              label="Preguntas frecuentes"
              name="faq"
              maxLength={20000}
              rows={10}
              defaultValue={faqToText(faq)}
              hint="Primera línea: la pregunta. Debajo: la respuesta. Deja una línea en blanco entre preguntas."
            />
          </div>
          <div className="sm:col-span-2"><SubmitButton>Guardar ajustes</SubmitButton></div>
        </AdminForm>
      </section>

      <section className="rounded-lg bg-blanco p-6">
        <h2 className="font-serif text-2xl">Cambiar contraseña</h2>
        <AdminForm action={changePassword} className="mt-5 grid max-w-sm gap-4">
          <Field label="Contraseña actual" name="current" type="password" autoComplete="current-password" required />
          <Field label="Nueva contraseña" name="next" type="password" autoComplete="new-password" required minLength={MIN_PASSWORD_LENGTH} hint={`Mínimo ${MIN_PASSWORD_LENGTH} caracteres.`} />
          <Field label="Repite la nueva contraseña" name="confirm" type="password" autoComplete="new-password" required minLength={MIN_PASSWORD_LENGTH} />
          <SubmitButton>Cambiar contraseña</SubmitButton>
        </AdminForm>
      </section>
    </div>
  );
}
