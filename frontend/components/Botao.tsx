import type { ButtonHTMLAttributes } from "react";

type Variante = "principal" | "contorno" | "escuro";

const ESTILOS: Record<Variante, string> = {
  principal: "bg-destaque text-tinta hover:brightness-95",
  contorno: "border border-tinta bg-superficie text-tinta hover:bg-fundo",
  escuro: "bg-superficie-escura text-destaque hover:brightness-125",
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variante?: Variante };

// type="button" por padrão: dentro de um <form>, o padrão do HTML seria "submit".
// Para enviar formulário, passe type="submit".
export function Botao({ variante = "principal", type = "button", className = "", ...props }: Props) {
  return (
    <button
      type={type}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 font-titulo text-xl tracking-wide transition disabled:cursor-not-allowed disabled:opacity-50 ${ESTILOS[variante]} ${className}`}
      {...props}
    />
  );
}
