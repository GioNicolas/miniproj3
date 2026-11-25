import type { InputHTMLAttributes, ReactNode } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  rotulo: string;
  dica?: string;
  // Algo que fica dentro do campo, encostado na direita (ex.: botão "Mostrar" da senha).
  fim?: ReactNode;
};

// Campo de formulário com rótulo. O visual dos inputs da rede mora só aqui.
// aria-invalid="true" pinta a borda de brasa; o foco pelo teclado ganha anel de milho.
export function Campo({ rotulo, dica, fim, className = "", ...props }: Props) {
  return (
    <label className="flex flex-col gap-1 text-sm font-semibold">
      {rotulo}
      <span className="relative flex">
        <input
          className={`min-h-11 w-full rounded-lg border border-borda-forte bg-superficie-2 px-3 font-normal text-tinta outline-none placeholder:text-suave focus:border-destaque focus-visible:ring-2 focus-visible:ring-destaque/60 aria-[invalid=true]:border-brasa ${fim ? "pr-24" : ""} ${className}`}
          {...props}
        />
        {fim && <span className="absolute inset-y-0 right-0 flex items-center">{fim}</span>}
      </span>
      {dica && <span className="text-xs font-normal text-suave">{dica}</span>}
    </label>
  );
}
