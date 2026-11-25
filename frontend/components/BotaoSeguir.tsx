"use client";

// Botão Seguir / Deixar de seguir. Quem usa (a página de perfil) passa o estado
// inicial (`eu_sigo` do GET /usuarios/{username}) e recebe +1/-1 em `aoMudar`
// para atualizar o contador de seguidores sem recarregar a página.

import { useState } from "react";

import { apiDelete, apiPost } from "@/lib/api";

type Props = {
  username: string;
  euSigoInicial: boolean;
  aoMudar?: (delta: 1 | -1) => void;
};

export function BotaoSeguir({ username, euSigoInicial, aoMudar }: Props) {
  const [euSigo, setEuSigo] = useState(euSigoInicial);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function alternar() {
    setEnviando(true);
    setErro(null);
    try {
      if (euSigo) {
        await apiDelete(`/usuarios/${username}/follow`);
        aoMudar?.(-1);
      } else {
        await apiPost(`/usuarios/${username}/follow`);
        aoMudar?.(1);
      }
      setEuSigo(!euSigo);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "não deu para seguir agora");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={alternar}
        disabled={enviando}
        className={
          euSigo
            ? "min-h-11 rounded-lg border border-borda-forte bg-transparent px-3 text-sm font-semibold text-tinta hover:bg-superficie-2 disabled:opacity-50"
            : "min-h-11 rounded-lg bg-superficie-2 px-3 text-sm font-semibold text-tinta hover:brightness-125 disabled:opacity-50"
        }
      >
        {euSigo ? "Deixar de seguir" : "Seguir"}
      </button>
      {erro && <p className="text-xs text-brasa">{erro}</p>}
    </div>
  );
}
