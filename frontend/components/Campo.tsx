import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & { rotulo: string; dica?: string };

// Campo de formulário com rótulo. O visual dos inputs da rede mora só aqui.
export function Campo({ rotulo, dica, className = "", ...props }: Props) {
  return (
    <label className="flex flex-col gap-1 text-sm font-semibold">
      {rotulo}
      <input
        className={`min-h-11 rounded-lg border border-borda bg-superficie px-3 font-normal text-tinta outline-none focus:border-destaque ${className}`}
        {...props}
      />
      {dica && <span className="text-xs font-normal text-suave">{dica}</span>}
    </label>
  );
}
