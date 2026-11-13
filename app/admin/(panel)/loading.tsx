export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Cargando" className="space-y-4">
      <div className="h-10 w-48 animate-pulse rounded-lg bg-arena/70" />
      <div className="h-64 animate-pulse rounded-lg bg-arena/50" />
    </div>
  );
}
