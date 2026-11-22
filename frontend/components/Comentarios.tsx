"use client";

import { useCallback, useEffect, useState } from "react";

import { Avatar } from "@/components/Avatar";
import { apiGet, apiPost, type Comentario, type Page } from "@/lib/api";
import { tempoRelativo } from "@/lib/tempo";

const POR_PAGINA = 50;
const LIMITE_TEXTO = 500;

type Props = {
  postId: number;
  onComentou?: () => void;
};

export function Comentarios({ postId, onComentou }: Props) {
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [total, setTotal] = useState(0);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(
    async (offset: number) => {
      try {
        const pagina = await apiGet<Page<Comentario>>(
          `/posts/${postId}/comentarios?offset=${offset}&limit=${POR_PAGINA}`
        );
        setComentarios((atuais) => (offset === 0 ? pagina.items : [...atuais, ...pagina.items]));
        setTotal(pagina.total);
        setErro(null);
      } catch (err) {
        setErro(err instanceof Error ? err.message : "erro ao carregar os comentários");
      }
    },
    [postId]
  );

  useEffect(() => {
    carregar(0);
  }, [carregar]);

  async function comentar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    try {
      const novo = await apiPost<Comentario>(`/posts/${postId}/comentarios`, { texto });
      setComentarios((atuais) => [...atuais, novo]);
      setTotal((t) => t + 1);
      setTexto("");
      setErro(null);
      onComentou?.();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "erro ao comentar");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section className="space-y-3">
      <h2 className="font-semibold">Comentários ({total})</h2>

      <ul className="space-y-2">
        {comentarios.map((c) => (
          <li key={c.id} className="flex gap-3 rounded-lg border bg-white p-3">
            <Avatar name={c.autor.name} avatarUrl={c.autor.avatar_url} />
            <div className="min-w-0">
              <p className="text-sm text-zinc-500">
                <span className="font-medium text-zinc-900">{c.autor.name}</span> @{c.autor.username} ·{" "}
                <time dateTime={c.created_at}>{tempoRelativo(c.created_at)}</time>
              </p>
              <p className="whitespace-pre-wrap break-words">{c.texto}</p>
            </div>
          </li>
        ))}
      </ul>

      {comentarios.length < total && (
        <button
          type="button"
          onClick={() => carregar(comentarios.length)}
          className="text-sm text-zinc-600 underline hover:text-zinc-900"
        >
          carregar mais
        </button>
      )}

      <form onSubmit={comentar} className="space-y-2 rounded-lg border bg-white p-3">
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Manda a dica ou a dúvida"
          maxLength={LIMITE_TEXTO}
          rows={2}
          className="w-full rounded border px-2 py-1"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={enviando || !texto.trim()}
            className="rounded bg-zinc-900 px-3 py-1.5 text-sm text-white disabled:opacity-50"
          >
            {enviando ? "comentando..." : "comentar"}
          </button>
        </div>
      </form>

      {erro && <p className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{erro}</p>}
    </section>
  );
}
