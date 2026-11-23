"use client";

import Link from "next/link";
import { useState } from "react";

import { Avatar } from "@/components/Avatar";
import { apiDelete, apiPatch, type Exercicio, type Post } from "@/lib/api";
import { tempoRelativo } from "@/lib/tempo";

const LIMITE_TEXTO = 500;

function resumoExercicio({ progressao, series, reps }: Exercicio): string {
  const volume =
    series && reps ? `${series}×${reps}` : series ? `${series} séries` : reps ? `${reps} reps` : null;
  return [progressao.split("_").join(" "), volume].filter(Boolean).join(" · ");
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
      setErro(err instanceof Error ? err.message : "erro ao editar o post");
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
      setErro(err instanceof Error ? err.message : "erro ao apagar o post");
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
    <article className={`space-y-2 rounded-lg border bg-white p-3 ${post.treino ? "border-emerald-300" : ""}`}>
      <header className="flex items-center gap-3">
        <Avatar name={post.autor.name} avatarUrl={post.autor.avatar_url} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{post.autor.name}</p>
          <p className="truncate text-sm text-zinc-500">
            @{post.autor.username} ·{" "}
            <time dateTime={post.created_at} title={new Date(post.created_at).toLocaleString("pt-BR")}>
              {tempoRelativo(post.created_at)}
            </time>
          </p>
        </div>
        {souAutor && !editando && (
          <div className="flex gap-2 text-sm text-zinc-500">
            <button type="button" onClick={() => setEditando(true)} disabled={salvando} className="hover:text-zinc-900">
              editar
            </button>
            <button type="button" onClick={apagar} disabled={salvando} className="hover:text-red-700">
              apagar
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
            className="w-full rounded border px-2 py-1"
          />
          <div className="flex justify-end gap-2 text-sm">
            <button type="button" onClick={cancelar} disabled={salvando} className="rounded px-3 py-1.5">
              cancelar
            </button>
            <button
              type="button"
              onClick={salvar}
              disabled={salvando || !rascunho.trim()}
              className="rounded bg-zinc-900 px-3 py-1.5 text-white disabled:opacity-50"
            >
              {salvando ? "salvando..." : "salvar"}
            </button>
          </div>
        </div>
      ) : (
        <>
          {post.treino && (
            <ul aria-label="Treino do dia" className="flex flex-wrap gap-1.5">
              <li className="rounded-full bg-emerald-50 px-2 py-0.5 text-sm font-medium text-emerald-800">treino</li>
              {post.treino.exercicios.map((exercicio, i) => (
                <li key={i} className="rounded-full bg-emerald-50 px-2 py-0.5 text-sm text-emerald-800">
                  {resumoExercicio(exercicio)}
                </li>
              ))}
            </ul>
          )}
          <p className="whitespace-pre-wrap break-words">{post.texto}</p>
        </>
      )}

      <footer className="flex gap-4 text-sm text-zinc-500">
        <span>{post.curtidas} curtidas</span>
        <Link href={`/posts/${post.id}`} className="hover:text-zinc-900">
          {post.comentarios} comentários
        </Link>
      </footer>

      {erro && <p className="text-sm text-red-700">{erro}</p>}
    </article>
  );
}
