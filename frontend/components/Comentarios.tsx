"use client";

import { useCallback, useEffect, useState } from "react";

import { AreaDeTexto } from "@/components/AreaDeTexto";
import { Avatar } from "@/components/Avatar";
import { Botao } from "@/components/Botao";
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
    <section className="flex flex-col gap-3">
      <h2 className="text-[17px] font-bold tracking-[-0.02em]">
        Comentários <span className="font-medium tabular-nums text-suave">{total ?? 0}</span>
      </h2>

      {total === 0 && (
        <p className="text-sm text-suave">Ninguém comentou ainda. Manda a primeira dica ou dúvida.</p>
      )}

      {comentarios.length > 0 && (
        <ul className="border-t border-borda">
          {comentarios.map((c) => (
            <li key={c.id} className="flex gap-3 border-b border-borda py-3">
              <Avatar name={c.autor.name} avatarUrl={c.autor.avatar_url} tamanho="p" />
              <div className="min-w-0">
                <p className="text-xs text-suave">
                  <span className="text-sm font-semibold text-tinta">{c.autor.name}</span> @{c.autor.username} ·{" "}
                  <time dateTime={c.created_at}>{tempoRelativo(c.created_at)}</time>
                </p>
                <p className="mt-0.5 whitespace-pre-wrap break-words text-sm leading-snug">{c.texto}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {comentarios.length < (total ?? 0) && (
        <Botao variante="contorno" onClick={() => carregar(comentarios.length)} className="w-full">
          Ver comentários mais antigos
        </Botao>
      )}

      <form onSubmit={comentar} className="flex flex-col gap-3 pt-2">
        <label className="flex flex-col gap-2 text-[13px] font-semibold">
          Seu comentário
          <AreaDeTexto
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Manda a dica ou a dúvida"
            maxLength={LIMITE_TEXTO}
            rows={2}
            className="font-normal"
          />
        </label>
        {erro && <Erro>{erro}</Erro>}
        <Botao type="submit" disabled={enviando || !texto.trim()} className="w-full">
          {enviando ? "Comentando..." : "Comentar"}
        </Botao>
      </form>
    </section>
  );
}
