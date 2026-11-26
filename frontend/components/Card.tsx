import type { HTMLAttributes } from "react";

type Props = HTMLAttributes<HTMLDivElement> & { escuro?: boolean };

// Cards não têm borda: a superfície mais clara que o fundo já separa.
// escuro: um degrau acima, para destacar um bloco dentro de outro card.
export function Card({ escuro = false, className = "", ...props }: Props) {
  const cor = escuro ? "bg-superficie-2" : "bg-superficie";
  return <div className={`rounded-[14px] p-4 text-tinta ${cor} ${className}`} {...props} />;
}
