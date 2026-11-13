"use client";

import { createContext, startTransition, useActionState, useContext, useEffect, useRef, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { button } from "@/components/ui/button";

export type ActionState = { error?: string; ok?: string } | null;
type Action = (prev: ActionState, formData: FormData) => Promise<ActionState>;

const Pending = createContext(false);

/** Formulario del panel con mensajes de error/éxito y botón con estado de envío. */
export function AdminForm({ action, children, className = "space-y-5" }: { action: Action; children: ReactNode; className?: string }) {
  const [state, formAction, isPending] = useActionState(action, null);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const form = ref.current;
    if (!state?.ok || !form) return;
    // Formularios de alta (sin id) se vacían; en edición solo se limpian los archivos ya subidos.
    if (!form.querySelector('input[name="id"]')) form.reset();
    else form.querySelectorAll<HTMLInputElement>('input[type="file"]').forEach((i) => (i.value = ""));
  }, [state]);

  return (
    <form
      ref={ref}
      action={formAction}
      // React vacía el formulario tras cada acción; lo evitamos para no perder lo escrito si hay un error.
      onSubmit={(e) => {
        const submitter = (e.nativeEvent as SubmitEvent).submitter;
        if (submitter?.hasAttribute("formaction")) return; // botones con acción propia (eliminar)
        e.preventDefault();
        const fd = new FormData(e.currentTarget, submitter);
        startTransition(() => formAction(fd));
      }}
      className={className}
    >
      <Pending value={isPending}>{children}</Pending>
      <div aria-live="polite">
        {state?.error && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-900">{state.error}</p>}
        {state?.ok && <p className="rounded-lg bg-salvia/40 px-4 py-3 text-sm">{state.ok}</p>}
      </div>
    </form>
  );
}

export function SubmitButton({ children, variant = "primary" }: { children: ReactNode; variant?: keyof typeof button }) {
  const fromForm = useContext(Pending);
  const { pending: native } = useFormStatus();
  const pending = fromForm || native;
  return (
    <button type="submit" disabled={pending} className={button[variant]}>
      {pending ? "Guardando…" : children}
    </button>
  );
}

/** Botón de envío que pide confirmación (para borrar). */
export function ConfirmButton({ children, message, formAction }: { children: ReactNode; message: string; formAction?: (fd: FormData) => void }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      formAction={formAction}
      disabled={pending}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
      className="min-h-11 rounded-full px-4 text-sm text-red-900 underline underline-offset-4 hover:bg-red-50"
    >
      {children}
    </button>
  );
}

const fieldClass =
  "w-full rounded-lg border border-arena bg-blanco px-3 py-2.5 text-sm focus:border-bosque focus:outline-none";

export function Field({
  label,
  hint,
  ...props
}: { label: string; hint?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      <input {...props} className={`${fieldClass} min-h-11 ${props.className ?? ""}`} />
      {hint && <span className="mt-1 block text-xs text-musgo">{hint}</span>}
    </label>
  );
}

export function TextArea({ label, hint, ...props }: { label: string; hint?: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      <textarea rows={4} {...props} className={fieldClass} />
      {hint && <span className="mt-1 block text-xs text-musgo">{hint}</span>}
    </label>
  );
}

export function Check({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
      <input type="checkbox" {...props} className="size-5 accent-bosque" />
      {label}
    </label>
  );
}

export const selectClass = `${fieldClass} min-h-11`;
