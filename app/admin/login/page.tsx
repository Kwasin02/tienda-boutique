import type { Metadata } from "next";
import { AdminForm, Field, SubmitButton } from "@/components/admin/forms";
import { login } from "./actions";

export const metadata: Metadata = { title: "Acceso administrador", robots: { index: false } };

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-sm px-4 py-20">
      <h1 className="font-serif text-4xl">Panel de la tienda</h1>
      <p className="mt-2 text-sm text-musgo">Acceso solo para administradores.</p>
      <div className="mt-8 rounded-lg bg-blanco p-6">
        <AdminForm action={login}>
          <Field label="Correo" name="email" type="email" autoComplete="username" required maxLength={200} />
          <Field label="Contraseña" name="password" type="password" autoComplete="current-password" required maxLength={200} />
          <SubmitButton>Entrar</SubmitButton>
        </AdminForm>
      </div>
    </div>
  );
}
