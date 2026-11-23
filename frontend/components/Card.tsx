import type { HTMLAttributes } from "react";

type Props = HTMLAttributes<HTMLDivElement> & { escuro?: boolean };

export function Card({ escuro = false, className = "", ...props }: Props) {
  const cor = escuro
    ? "bg-superficie-escura text-tinta-clara"
    : "border border-borda bg-superficie text-tinta";
  return <div className={`rounded-2xl p-4 ${cor} ${className}`} {...props} />;
}
