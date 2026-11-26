import type { ReactNode } from "react";

type Props = { titulo: string; texto?: string; acao?: ReactNode };

// Estado vazio: título curto que diz o que falta, o porquê, e o próximo passo.
export function EstadoVazio({ titulo, texto, acao }: Props) {
  return (
    <div className="flex flex-col gap-3 py-8">
      <h2 className="text-2xl font-bold leading-tight tracking-[-0.02em]">{titulo}</h2>
      {texto && <p className="text-[15px] leading-normal text-pretty text-suave">{texto}</p>}
      {acao && <div className="mt-2 flex flex-col gap-2">{acao}</div>}
    </div>
  );
}
