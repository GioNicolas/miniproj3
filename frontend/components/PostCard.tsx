"use client";

import Link from "next/link";
import { useState } from "react";

import { Avatar } from "@/components/Avatar";
import { apiDelete, apiPatch, type Exercicio, type Post } from "@/lib/api";
import { GLOSSARIO } from "@/lib/glossario";
import { tempoRelativo } from "@/lib/tempo";

const LIMITE_TEXTO = 500;

function resumoExercicio({ progressao, series, reps }: Exercicio): string {
  const volume =
    series && reps ? `${series}×${reps}` : series ? `${series} séries` : reps ? `${reps} reps` : null;
  return [progressao.split("_").join(" "), volume].filter(Boolean).join(" · ");
}

function rotuloComentarios(n: number): string {
  return n === 1 ? "1 comentário" : `${n} comentários`;
}

type Props = {
  post: Post;
  souAutor?: boolean;
  onAtualizado?: (post: Post) => void;
  onApagado?: (id: number) => void;
};

export function PostCard({ post, souAutor = false, onAtualizado, onApagado }: Props) {
  const [editando, setEditando] = useState(false);
  const [rascunho, setRascunho] = useState(post.texto);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function salvar() {
    setSalvando(true);
    try {
      const atualizado = await apiPatch<Post>(`/posts/${post.id}`, { texto: rascunho });
      setEditando(false);
      setErro(null);
      onAtualizado?.(atualizado);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "não deu pra salvar a edição");
    } finally {
      setSalvando(false);
    }
  }

  async function apagar() {
    if (!confirm("Apagar este post?")) return;
    setSalvando(true);
    try {
      await apiDelete(`/posts/${post.id}`);
      onApagado?.(post.id);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "não deu pra apagar o post");
    } finally {
      setSalvando(false);
    }
  }

  function cancelar() {
    setRascunho(post.texto);
    setEditando(false);
    setErro(null);
  }

  return (
    <article className="space-y-3 rounded-2xl border border-borda bg-superficie p-4">
      <header className="flex items-center gap-3">
        <Avatar name={post.autor.name} avatarUrl={post.autor.avatar_url} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{post.autor.name}</p>
          <p className="truncate text-sm text-suave">
            @{post.autor.username} ·{" "}
            <time dateTime={post.created_at} title={new Date(post.created_at).toLocaleString("pt-BR")}>
              {tempoRelativo(post.created_at)}
            </time>
          </p>
        </div>
        {souAutor && !editando && (
          <div className="flex gap-1 text-sm text-suave">
            <button
              type="button"
              onClick={() => setEditando(true)}
              disabled={salvando}
              className="min-h-11 px-2 hover:text-tinta"
            >
              Editar
            </button>
            <button type="button" onClick={apagar} disabled={salvando} className="min-h-11 px-2 hover:text-brasa">
              Apagar
            </button>
          </div>
        )}
      </header>

      {editando ? (
        <div className="space-y-2">
          <textarea
            value={rascunho}
            onChange={(e) => setRascunho(e.target.value)}
            maxLength={LIMITE_TEXTO}
            rows={3}
            aria-label="Texto do post"
            className="w-full rounded-lg border border-borda-forte bg-superficie-2 px-3 py-2 text-tinta outline-none focus:border-destaque"
          />
          <div className="flex justify-end gap-2 text-sm">
            <button
              type="button"
              onClick={cancelar}
              disabled={salvando}
              className="min-h-11 rounded-lg px-3 text-suave hover:text-tinta"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={salvar}
              disabled={salvando || !rascunho.trim()}
              className="min-h-11 rounded-lg bg-destaque px-4 font-titulo text-sm text-sobre-destaque transition-transform duration-150 ease-out active:scale-[0.97] disabled:opacity-50 motion-reduce:transition-none"
            >
              {salvando ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Card do treino: fundo de milho, porque treino registrado é constância */}
          {post.treino && (
            <div className="flex items-center gap-4 rounded-xl border border-destaque-borda bg-destaque-fundo px-4 py-3">
              <div className="flex w-12 shrink-0 flex-col items-center">
                <span className="font-placar text-4xl leading-none text-destaque">
                  {post.treino.exercicios.length}
                </span>
                <span className="text-[11px] text-suave">
                  {post.treino.exercicios.length === 1 ? "exercício" : "exercícios"}
                </span>
              </div>
              <ul aria-label="Treino do dia" className="min-w-0 flex-1 space-y-0.5">
                {post.treino.exercicios.map((exercicio, i) => (
                  <li key={i} className="truncate font-titulo text-xs leading-snug">
                    {resumoExercicio(exercicio)}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <p className="whitespace-pre-wrap break-words leading-relaxed">{post.texto}</p>
        </>
      )}

      <footer className="flex items-center gap-4 text-sm">
        <span className="text-suave">
          <span className="font-placar text-base text-tinta">{post.curtidas}</span> {GLOSSARIO.curtida.toLowerCase()}
        </span>
        <Link href={`/posts/${post.id}`} className="min-h-11 content-center font-semibold text-ceu hover:underline">
          {rotuloComentarios(post.comentarios)}
        </Link>
      </footer>

      {erro && (
        <p role="alert" className="rounded-lg bg-brasa-fundo px-3 py-2 text-sm text-brasa">
          {erro}
        </p>
      )}
    </article>
  );
}
