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
        setErro(err instanceof Error ? err.message : "não deu pra carregar os comentários");
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
      setErro(err instanceof Error ? err.message : "não deu pra comentar");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section className="space-y-3">
      <h2 className="font-titulo text-base">
        Comentários <span className="font-placar text-lg not-italic text-suave">{total}</span>
      </h2>

      <ul className="space-y-2">
        {comentarios.map((c) => (
          <li key={c.id} className="flex gap-3 rounded-2xl border border-borda bg-superficie p-3">
            <Avatar name={c.autor.name} avatarUrl={c.autor.avatar_url} />
            <div className="min-w-0">
              <p className="text-sm text-suave">
                <span className="font-semibold text-tinta">{c.autor.name}</span> @{c.autor.username} ·{" "}
                <time dateTime={c.created_at}>{tempoRelativo(c.created_at)}</time>
              </p>
              <p className="whitespace-pre-wrap break-words leading-relaxed">{c.texto}</p>
            </div>
          </li>
        ))}
      </ul>

      {comentarios.length < total && (
        <button
          type="button"
          onClick={() => carregar(comentarios.length)}
          className="min-h-11 text-sm font-semibold text-ceu hover:underline"
        >
          Ver comentários mais antigos
        </button>
      )}

      <form onSubmit={comentar} className="space-y-2 rounded-2xl border border-ceu-borda bg-ceu-fundo p-3">
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Manda a dica ou a dúvida"
          aria-label="Seu comentário"
          maxLength={LIMITE_TEXTO}
          rows={2}
          className="w-full rounded-lg border border-borda-forte bg-superficie-2 px-3 py-2 text-tinta outline-none placeholder:text-suave focus:border-ceu"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={enviando || !texto.trim()}
            className="min-h-11 rounded-lg bg-ceu px-4 font-titulo text-sm text-sobre-destaque transition-transform duration-150 ease-out active:scale-[0.97] disabled:opacity-50 motion-reduce:transition-none"
          >
            {enviando ? "Comentando..." : "Comentar"}
          </button>
        </div>
      </form>

      {erro && <p role="alert" className="rounded-lg bg-brasa-fundo px-3 py-2 text-sm text-brasa">{erro}</p>}
    </section>
  );
}
