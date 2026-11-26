"use client";

// Curtida de um post ("Tamo junto" no glossário). Atualização otimista: a tela
// muda na hora do clique e volta atrás se o backend recusar, com um aviso.
// Quem usa passa key={`${post.id}-${post.curtidas}`}, para o número inicial
// ser lido de novo quando o post chega atualizado.

import { useState } from "react";

import { apiDelete, apiPost } from "@/lib/api";
import { GLOSSARIO } from "@/lib/glossario";

type Props = {
  postId: number;
  curtidasIniciais: number;
  euCurtiInicial: boolean;
};

export function BotaoTamoJunto({ postId, curtidasIniciais, euCurtiInicial }: Props) {
  const [curtidas, setCurtidas] = useState(curtidasIniciais);
  const [euCurti, setEuCurti] = useState(euCurtiInicial);
  const [enviando, setEnviando] = useState(false);
  const [falhou, setFalhou] = useState(false);

  async function alternar() {
    const antes = { curtidas, euCurti };
    setEuCurti(!euCurti);
    setCurtidas(curtidas + (euCurti ? -1 : 1));
    setEnviando(true);
    setFalhou(false);
    try {
      if (antes.euCurti) {
        await apiDelete(`/posts/${postId}/curtir`);
      } else {
        await apiPost(`/posts/${postId}/curtir`);
      }
    } catch {
      setEuCurti(antes.euCurti);
      setCurtidas(antes.curtidas);
      setFalhou(true);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      {/* Pílula: só contorno; depois de mandar fica preenchida (elevado). A chama é o milho. */}
      <button
        type="button"
        onClick={alternar}
        disabled={enviando}
        aria-pressed={euCurti}
        aria-label={`Mandar ${GLOSSARIO.curtida.toLowerCase()}. ${curtidas} ${curtidas === 1 ? "pessoa já mandou" : "pessoas já mandaram"}`}
        className={`flex min-h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-3 text-[13px] text-tinta transition-colors ${
          euCurti ? "border-elevado bg-elevado" : "border-borda-forte bg-transparent hover:bg-superficie"
        }`}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-destaque">
          <path d="M12 3c.6 3 4.5 4.8 4.5 9.2a4.5 4.5 0 0 1-9 0c0-1.7.7-2.9 1.8-3.9.2 1.4.9 2.2 1.9 2.4-.6-2.4-.2-5.1.8-7.7z" />
        </svg>
        <span className="font-semibold">{GLOSSARIO.curtida}</span>
        <span className="font-medium tabular-nums text-suave">{curtidas}</span>
      </button>
      {falhou && (
        <span role="alert" className="text-xs text-brasa">
          não deu, tenta de novo
        </span>
      )}
    </span>
  );
}
