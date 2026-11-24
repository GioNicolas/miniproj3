import type { HTMLAttributes } from "react";

type Props = HTMLAttributes<HTMLDivElement> & { escuro?: boolean };

// escuro: um degrau acima da superfície, para destacar um bloco dentro de outro card.
export function Card({ escuro = false, className = "", ...props }: Props) {
  const cor = escuro ? "bg-superficie-2 text-tinta" : "border border-borda bg-superficie text-tinta";
  return <div className={`rounded-2xl p-4 ${cor} ${className}`} {...props} />;
}
