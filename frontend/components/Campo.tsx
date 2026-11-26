import type { InputHTMLAttributes, ReactNode } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  rotulo: string;
  dica?: string;
  // Algo que fica dentro do campo, encostado na direita (ex.: botão "Mostrar" da senha).
  fim?: ReactNode;
};

// Campo de formulário com rótulo. O visual dos inputs da rede mora só aqui.
// Contorno #66749A (3:1 no fundo); aria-invalid="true" pinta a borda de brasa;
// o foco ganha anel de milho. text-base (16px) evita o zoom do iPhone ao tocar.
export function Campo({ rotulo, dica, fim, className = "", ...props }: Props) {
  return (
    <label className="flex flex-col gap-2 text-[13px] font-semibold">
      {rotulo}
      <span className="relative flex">
        <input
          className={`min-h-12 w-full rounded-[10px] border border-borda-forte bg-superficie px-4 text-base font-normal text-tinta outline-none placeholder:text-suave focus-visible:ring-2 focus-visible:ring-destaque focus-visible:ring-offset-2 focus-visible:ring-offset-fundo aria-[invalid=true]:border-brasa ${fim ? "pr-24" : ""} ${className}`}
          {...props}
        />
        {fim && <span className="absolute inset-y-0 right-0 flex items-center">{fim}</span>}
      </span>
      {dica && <span className="text-[13px] font-normal text-suave">{dica}</span>}
    </label>
  );
}
