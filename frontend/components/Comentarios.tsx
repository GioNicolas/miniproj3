"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { AreaDeTexto } from "@/components/AreaDeTexto";
import { Avatar } from "@/components/Avatar";
import { Botao } from "@/components/Botao";
import { Card } from "@/components/Card";
import { Erro } from "@/components/Erro";
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
  // null até a primeira página chegar, para não piscar o "ninguém comentou".
  const [total, setTotal] = useState<number | null>(null);
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
      setTotal((t) => (t ?? 0) + 1);
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
      <h2 className="font-titulo text-2xl tracking-wide">Comentários ({total ?? 0})</h2>

      {total === 0 && (
        <p className="text-sm text-suave">Ninguém comentou ainda. Manda a primeira dica ou dúvida.</p>
      )}

      <ul className="space-y-2">
        {comentarios.map((c) => (
          <li key={c.id}>
            <Card className="flex gap-3">
              <Avatar name={c.autor.name} avatarUrl={c.autor.avatar_url} />
              <div className="min-w-0">
                <p className="text-sm text-suave">
                  <Link href={`/u/${c.autor.username}`} className="font-semibold text-tinta hover:underline">
                    {c.autor.name}
                  </Link> @{c.autor.username} ·{" "}
                  <time dateTime={c.created_at}>{tempoRelativo(c.created_at)}</time>
                </p>
                <p className="whitespace-pre-wrap break-words">{c.texto}</p>
              </div>
            </Card>
          </li>
        ))}
      </ul>

      {comentarios.length < (total ?? 0) && (
        <button
          type="button"
          onClick={() => carregar(comentarios.length)}
          className="min-h-11 text-sm text-suave underline hover:text-tinta"
        >
          carregar mais
        </button>
      )}

      <Card>
        <form onSubmit={comentar} className="space-y-3">
          <AreaDeTexto
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Manda a dica ou a dúvida"
            aria-label="Novo comentário"
            maxLength={LIMITE_TEXTO}
            rows={2}
          />
          <div className="flex justify-end">
            <Botao type="submit" disabled={enviando || !texto.trim()}>
              {enviando ? "Comentando..." : "Comentar"}
            </Botao>
          </div>
        </form>
      </Card>

      {erro && <Erro>{erro}</Erro>}
    </section>
  );
}
