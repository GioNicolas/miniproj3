"use client";

// No celular, quando o teclado fecha, o Safari às vezes deixa a página rolada para
// onde o teclado empurrou, com o topo escondido ou um vão embaixo. Ao sair de um
// campo (sem ir para outro), este ajuste volta login e cadastro para o topo e, nas
// outras telas, tira só o deslocamento que sobrou além do fim da página.

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { ROTAS_PUBLICAS } from "@/lib/sessao";

const CAMPO = "input, textarea, select";

export function AjusteDoTeclado() {
  const caminho = usePathname();

  useEffect(() => {
    const aoSairDoCampo = (e: FocusEvent) => {
      if (!(e.target instanceof HTMLElement) || !e.target.matches(CAMPO)) return;
      // espera o teclado fechar e confere se o foco não foi para outro campo
      window.setTimeout(() => {
        if (document.activeElement instanceof HTMLElement && document.activeElement.matches(CAMPO)) return;
        const fim = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
        const topo = ROTAS_PUBLICAS.includes(caminho) ? 0 : Math.min(window.scrollY, fim);
        window.scrollTo({ top: topo, behavior: "smooth" });
      }, 150);
    };
    document.addEventListener("focusout", aoSairDoCampo);
    return () => document.removeEventListener("focusout", aoSairDoCampo);
  }, [caminho]);

  return null;
}
