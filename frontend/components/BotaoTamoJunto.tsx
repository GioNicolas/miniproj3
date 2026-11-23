"use client";

// Curtida de um post ("Tamo junto" no glossário). Atualização otimista: a tela
// muda na hora do clique e volta atrás se o backend recusar.

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

  async function alternar() {
    const antes = { curtidas, euCurti };
    setEuCurti(!euCurti);
    setCurtidas(curtidas + (euCurti ? -1 : 1));
    setEnviando(true);
    try {
      if (antes.euCurti) {
        await apiDelete(`/posts/${postId}/curtir`);
      } else {
        await apiPost(`/posts/${postId}/curtir`);
      }
    } catch {
      setEuCurti(antes.euCurti);
      setCurtidas(antes.curtidas);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <button
      type="button"
      onClick={alternar}
      disabled={enviando}
      aria-pressed={euCurti}
      className={euCurti ? "font-semibold text-destaque-texto" : "hover:text-tinta"}
    >
      {GLOSSARIO.curtida} · {curtidas}
    </button>
  );
}
