"use client";

import { useState } from "react";

import { AreaDeTexto } from "@/components/AreaDeTexto";
import { Botao } from "@/components/Botao";
import { Card } from "@/components/Card";
import { Erro } from "@/components/Erro";
import { apiPost, type Post } from "@/lib/api";

const LIMITE_TEXTO = 500;

export function NovoPost({ onCriado }: { onCriado?: (post: Post) => void }) {
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function postar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    try {
      const post = await apiPost<Post>("/posts", { texto });
      setTexto("");
      setErro(null);
      onCriado?.(post);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "erro ao postar");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Card>
      <form onSubmit={postar} className="space-y-3">
        <AreaDeTexto
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Como foi o treino hoje?"
          aria-label="Novo post"
          maxLength={LIMITE_TEXTO}
          rows={2}
        />
        <div className="flex items-center justify-between">
          <span className="text-xs tabular-nums text-suave">
            {texto.length}/{LIMITE_TEXTO}
          </span>
          <Botao type="submit" variante="escuro" disabled={enviando || !texto.trim()}>
            {enviando ? "Postando..." : "Postar"}
          </Botao>
        </div>
        {erro && <Erro>{erro}</Erro>}
      </form>
    </Card>
  );
}
