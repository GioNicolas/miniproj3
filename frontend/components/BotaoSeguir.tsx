"use client";

// Botão Seguir / Seguindo do perfil. Passa pelo lib/seguindo.ts para que
// o "Seguir" dos posts da mesma pessoa apareça ou suma junto, sem recarregar.
// Quem usa passa o estado inicial (`eu_sigo` do GET /usuarios/{username}) e
// recebe +1/-1 em `aoMudar` para atualizar o contador de seguidores.

import { useState } from "react";

import { deixarDeSeguir, seguir } from "@/lib/seguindo";

type Props = {
  username: string;
  euSigoInicial: boolean;
  aoMudar?: (delta: 1 | -1) => void;
  className?: string;
};

export function BotaoSeguir({ username, euSigoInicial, aoMudar, className = "" }: Props) {
  const [euSigo, setEuSigo] = useState(euSigoInicial);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function alternar() {
    setEnviando(true);
    setErro(null);
    try {
      if (euSigo) {
        await deixarDeSeguir(username);
        aoMudar?.(-1);
      } else {
        await seguir(username);
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
    <div className={`flex flex-col gap-1 ${className}`}>
      {/* Seguindo fica preenchido (elevado); Seguir fica só com contorno */}
      <button
        type="button"
        onClick={alternar}
        disabled={enviando}
        aria-pressed={euSigo}
        aria-label={euSigo ? `Deixar de seguir @${username}` : `Seguir @${username}`}
        className={`min-h-11 min-w-24 w-full shrink-0 rounded-full border px-4 text-sm font-semibold text-tinta transition-colors disabled:opacity-50 ${
          euSigo ? "border-elevado bg-elevado" : "border-borda-forte bg-transparent hover:bg-superficie-2"
        }`}
      >
        {euSigo ? "Seguindo" : "Seguir"}
      </button>
      {erro && <p className="text-xs text-brasa">{erro}</p>}
    </div>
  );
}
