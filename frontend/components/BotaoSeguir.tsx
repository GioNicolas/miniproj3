"use client";

// Botão Seguir / Deixar de seguir do perfil. Passa pelo lib/seguindo.ts para que
// o "Seguir" dos posts da mesma pessoa apareça ou suma junto, sem recarregar.
// Quem usa passa o estado inicial (`eu_sigo` do GET /usuarios/{username}) e
// recebe +1/-1 em `aoMudar` para atualizar o contador de seguidores.

import { useState } from "react";

import { Botao } from "@/components/Botao";
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
      <Botao variante={euSigo ? "contorno" : "principal"} onClick={alternar} disabled={enviando} className="w-full">
        {euSigo ? "Deixar de seguir" : "Seguir"}
      </Botao>
      {erro && <p className="text-xs text-perigo">{erro}</p>}
    </div>
  );
}
