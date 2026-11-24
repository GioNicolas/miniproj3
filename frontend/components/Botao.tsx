import type { ButtonHTMLAttributes } from "react";

type Variante = "principal" | "contorno" | "escuro";

const ESTILOS: Record<Variante, string> = {
  principal: "bg-destaque text-sobre-destaque hover:brightness-105",
  contorno: "border border-borda-forte bg-transparent text-tinta hover:bg-superficie-2",
  escuro: "bg-superficie-2 text-destaque hover:brightness-125",
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variante?: Variante };

// type="button" por padrão: dentro de um <form>, o padrão do HTML seria "submit".
// Para enviar formulário, passe type="submit".
// active:scale-[0.97]: o botão afunda de leve ao apertar, para a pessoa sentir que o toque pegou.
export function Botao({ variante = "principal", type = "button", className = "", ...props }: Props) {
  return (
    <button
      type={type}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 font-titulo text-sm transition-[transform,filter,background-color] duration-150 ease-out active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 ${ESTILOS[variante]} ${className}`}
      {...props}
    />
  );
}
