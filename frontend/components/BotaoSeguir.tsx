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
            ? "rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm hover:bg-zinc-100 disabled:opacity-50"
            : "rounded bg-zinc-900 px-3 py-1.5 text-sm text-white hover:bg-zinc-700 disabled:opacity-50"
        }
      >
        {euSigo ? "Deixar de seguir" : "Seguir"}
      </button>
      {erro && <p className="text-xs text-red-600">{erro}</p>}
    </div>
  );
}
