"use client";

// Confirmação de ação que não tem volta (apagar post, desfazer treino): uma janela no
// centro da tela, sobre o fundo escurecido, para não se misturar com o resto da tela.
// Usa o <dialog> nativo: showModal() escurece o fundo, prende o foco dentro da janela
// e fecha com Esc. Tocar fora da janela também cancela.

import { useEffect, useId, useRef } from "react";

import { Botao } from "@/components/Botao";
import { Erro } from "@/components/Erro";

type Props = {
  aberta: boolean;
  titulo: string;
  texto: string;
  rotuloConfirmar?: string;
  rotuloCancelar?: string;
  ocupado?: boolean;
  erro?: string | null;
  aoConfirmar: () => void;
  aoCancelar: () => void;
};

export function Confirmacao({
  aberta,
  titulo,
  texto,
  rotuloConfirmar = "Apagar",
  rotuloCancelar = "Manter",
  ocupado = false,
  erro = null,
  aoConfirmar,
  aoCancelar,
}: Props) {
  const janela = useRef<HTMLDialogElement>(null);
  const idTitulo = useId();
  const idTexto = useId();

  useEffect(() => {
    const d = janela.current;
    if (!d) return;
    if (aberta && !d.open) d.showModal();
    if (!aberta && d.open) d.close();
  }, [aberta]);

  return (
    <dialog
      ref={janela}
      role="alertdialog"
      aria-labelledby={idTitulo}
      aria-describedby={idTexto}
      // Esc: o navegador fecharia sozinho; quem decide é o estado de fora
      onCancel={(e) => {
        e.preventDefault();
        if (!ocupado) aoCancelar();
      }}
      // toque no fundo escurecido (fora da caixa) cancela
      onClick={(e) => {
        if (e.target === e.currentTarget && !ocupado) aoCancelar();
      }}
      className="m-auto w-[min(24rem,calc(100%-2.5rem))] rounded-2xl bg-elevado p-0 text-tinta shadow-[0_16px_48px_rgba(20,20,20,0.22)] backdrop:bg-tinta/50 backdrop:backdrop-blur-[2px] open:animate-surgir"
    >
      <div className="flex flex-col gap-4 p-5">
        <div>
          <h2 id={idTitulo} className="text-[19px] font-bold leading-tight tracking-[-0.02em]">
            {titulo}
          </h2>
          <p id={idTexto} className="mt-2 text-[15px] leading-snug text-pretty text-suave">
            {texto}
          </p>
        </div>
        {erro && <Erro>{erro}</Erro>}
        <div className="grid grid-cols-2 gap-2">
          <Botao variante="contorno" onClick={aoCancelar} disabled={ocupado} autoFocus>
            {rotuloCancelar}
          </Botao>
          <button
            type="button"
            onClick={aoConfirmar}
            disabled={ocupado}
            className="inline-flex min-h-11 items-center justify-center rounded-[10px] bg-brasa px-4 text-sm font-semibold text-sobre-destaque transition-[transform,filter] duration-150 hover:brightness-110 active:scale-[0.97] disabled:opacity-60"
          >
            {ocupado ? "Apagando..." : rotuloConfirmar}
          </button>
        </div>
      </div>
    </dialog>
  );
}
