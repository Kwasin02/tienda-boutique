// Clases compartidas para <button> y <Link>, así ambos se ven igual sin un componente envoltorio.
const base =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50";

export const button = {
  primary: `${base} bg-bosque text-marfil hover:bg-bosque/90`,
  secondary: `${base} border border-bosque text-bosque hover:bg-arena/60`,
  ghost: `${base} text-bosque underline-offset-4 hover:underline`,
};
