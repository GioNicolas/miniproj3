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
      <button
        type="button"
        onClick={alternar}
        disabled={enviando}
        aria-pressed={euCurti}
        className={`min-h-11 ${euCurti ? "font-semibold text-destaque-texto" : "hover:text-tinta"}`}
      >
        {GLOSSARIO.curtida} · {curtidas}
      </button>
      {falhou && (
        <span role="alert" className="text-perigo">
          não deu, tenta de novo
        </span>
      )}
    </span>
  );
}
