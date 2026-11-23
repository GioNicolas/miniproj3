export function Carregando({ texto = "Chocando…" }: { texto?: string }) {
  return (
    <div role="status" className="flex items-center justify-center gap-2 py-10 text-sm text-suave">
      <span className="h-2 w-2 animate-pulse rounded-full motion-reduce:animate-none bg-destaque" aria-hidden="true" />
      {texto}
    </div>
  );
}
