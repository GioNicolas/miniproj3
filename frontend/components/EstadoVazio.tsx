import type { ReactNode } from "react";

type Props = { titulo: string; texto?: string; acao?: ReactNode };

export function EstadoVazio({ titulo, texto, acao }: Props) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-borda px-6 py-10 text-center">
      <p className="font-titulo text-2xl tracking-wide">{titulo}</p>
      {texto && <p className="max-w-xs text-sm text-suave">{texto}</p>}
      {acao && <div className="mt-2">{acao}</div>}
    </div>
  );
}
