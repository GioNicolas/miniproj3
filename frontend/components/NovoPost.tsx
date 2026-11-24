"use client";

import { useState } from "react";

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
      setErro(err instanceof Error ? err.message : "não deu pra postar");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={postar} className="space-y-2 rounded-2xl border border-borda bg-superficie p-3">
      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Como foi o treino hoje?"
        aria-label="Texto do post"
        maxLength={LIMITE_TEXTO}
        rows={3}
        className="w-full rounded-lg border border-borda-forte bg-superficie-2 px-3 py-2 text-tinta outline-none placeholder:text-suave focus:border-destaque"
      />
      <div className="flex items-center justify-between">
        <span className="font-placar text-sm text-suave">
          {texto.length}/{LIMITE_TEXTO}
        </span>
        <button
          type="submit"
          disabled={enviando || !texto.trim()}
          className="min-h-11 rounded-lg bg-destaque px-4 font-titulo text-sm text-sobre-destaque transition-transform duration-150 ease-out active:scale-[0.97] disabled:opacity-50 motion-reduce:transition-none"
        >
          {enviando ? "Postando..." : "Postar"}
        </button>
      </div>
      {erro && <p role="alert" className="rounded-lg bg-brasa-fundo px-3 py-2 text-sm text-brasa">{erro}</p>}
    </form>
  );
}
