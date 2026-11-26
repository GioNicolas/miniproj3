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
  const [enviandoInicial, setEnviandoInicial] = useState(true);

  async function alternar() {
    setEnviandoInicial(false);
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

  // Ocupa metade do rodapé do post; a chama acende em preto e dá um pulo quando você manda.
  return (
    <button
      type="button"
      onClick={alternar}
      disabled={enviando}
      aria-pressed={euCurti}
      aria-label={`Mandar ${GLOSSARIO.curtida.toLowerCase()}. ${curtidas} ${curtidas === 1 ? "pessoa já mandou" : "pessoas já mandaram"}`}
      className={`flex min-h-11 w-full items-center justify-center gap-2 rounded-xl text-[14px] transition-[background-color,color,transform] duration-150 active:scale-[0.97] ${
        euCurti ? "font-semibold text-destaque hover:bg-destaque-fundo" : "font-medium text-suave hover:bg-superficie hover:text-tinta"
      }`}
    >
      <svg
        key={euCurti ? "aceso" : "apagado"}
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill={euCurti ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={euCurti && !enviandoInicial ? "animate-pulo" : ""}
      >
        <path d="M12 3c.6 3 4.5 4.8 4.5 9.2a4.5 4.5 0 0 1-9 0c0-1.7.7-2.9 1.8-3.9.2 1.4.9 2.2 1.9 2.4-.6-2.4-.2-5.1.8-7.7z" />
      </svg>
      {falhou ? (
        <span role="alert" className="text-brasa">
          Não deu, tenta de novo
        </span>
      ) : (
        <>
          <span>{GLOSSARIO.curtida}</span>
          {curtidas > 0 && <span className="tabular-nums">{curtidas}</span>}
        </>
      )}
    </button>
  );
}
