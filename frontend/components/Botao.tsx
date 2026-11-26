import type { ButtonHTMLAttributes } from "react";

// principal: milho, fonte de impacto. Um por tela, só na ação que a tela existe para fazer.
// contorno: ação secundária (Cancelar, Carregar mais). escuro: ação pequena dentro de um card.
type Variante = "principal" | "contorno" | "escuro";

const ESTILOS: Record<Variante, string> = {
  principal: "min-h-[52px] rounded-xl bg-destaque font-titulo text-[17px] text-sobre-destaque hover:brightness-105",
  contorno: "min-h-11 rounded-[10px] border border-borda-forte bg-transparent text-sm font-semibold text-tinta hover:bg-superficie-2",
  escuro: "min-h-11 rounded-[10px] bg-elevado text-sm font-semibold text-tinta hover:brightness-110",
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variante?: Variante };

// type="button" por padrão: dentro de um <form>, o padrão do HTML seria "submit".
// Para enviar formulário, passe type="submit".
// active:scale-[0.97]: o botão afunda de leve ao apertar, para a pessoa sentir que o toque pegou.
export function Botao({ variante = "principal", type = "button", className = "", ...props }: Props) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 px-4 transition-[transform,filter,background-color] duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-destaque active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100 disabled:cursor-not-allowed disabled:active:scale-100 ${ESTILOS[variante]} ${variante === "principal" ? "disabled:bg-elevado disabled:text-suave disabled:brightness-100" : "disabled:opacity-50"} ${className}`}
      {...props}
    />
  );
}
