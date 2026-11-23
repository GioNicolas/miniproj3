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
      setErro(err instanceof Error ? err.message : "erro ao postar");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={postar} className="space-y-2 rounded-lg border bg-white p-3">
      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Como foi o treino hoje?"
        maxLength={LIMITE_TEXTO}
        rows={3}
        className="w-full rounded border px-2 py-1"
      />
      <div className="flex items-center justify-between">
        <span className="text-sm text-zinc-500">
          {texto.length}/{LIMITE_TEXTO}
        </span>
        <button
          type="submit"
          disabled={enviando || !texto.trim()}
          className="rounded bg-zinc-900 px-3 py-1.5 text-sm text-white disabled:opacity-50"
        >
          {enviando ? "postando..." : "postar"}
        </button>
      </div>
      {erro && <p className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{erro}</p>}
    </form>
  );
}
