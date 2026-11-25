"use client";

import Link from "next/link";
import { useState } from "react";

import { AreaDeTexto } from "@/components/AreaDeTexto";
import { Avatar } from "@/components/Avatar";
import { Botao } from "@/components/Botao";
import { Card } from "@/components/Card";
import { Erro } from "@/components/Erro";
import { apiDelete, apiPatch, type Exercicio, type Post } from "@/lib/api";
import { useEu } from "@/lib/eu";
import { GLOSSARIO } from "@/lib/glossario";
import { nomeDaProgressao } from "@/lib/progressoes";
import { seguir, useSeguindo } from "@/lib/seguindo";
import { tempoRelativo } from "@/lib/tempo";

const LIMITE_TEXTO = 500;

function resumoExercicio({ progressao, series, reps }: Exercicio): string {
  const volume =
    series && reps ? `${series}×${reps}` : series ? `${series} séries` : reps ? `${reps} reps` : null;
  return [nomeDaProgressao(progressao), volume].filter(Boolean).join(" · ");
}

function contagem(n: number, singular: string, plural: string): string {
  return `${n} ${n === 1 ? singular : plural}`;
}

type Props = {
  post: Post;
  onAtualizado?: (post: Post) => void;
  onApagado?: (id: number) => void;
};

export function PostCard({ post, onAtualizado, onApagado }: Props) {
  const eu = useEu();
  const souAutor = eu?.username === post.autor.username;
  const sigo = useSeguindo();
  // Seguir pelo post é a porta de entrada de quem chegou pelo Explorar.
  const podeSeguir = eu !== null && !souAutor && sigo !== null && !sigo.has(post.autor.username);
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

  async function seguirAutor() {
    setSalvando(true);
    try {
      await seguir(post.autor.username);
      setErro(null);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "não deu para seguir agora");
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
    // Post de treino ganha a faixa laranja na esquerda: é o check-in que conta pro frango.
    <Card className={post.treino ? "border-l-4 border-l-destaque" : ""}>
      <article className="space-y-3">
        <header className="flex items-center gap-3">
          <Avatar name={post.autor.name} avatarUrl={post.autor.avatar_url} />
          <div className="min-w-0 flex-1">
            <Link href={`/u/${post.autor.username}`} className="block truncate font-semibold hover:underline">
              {post.autor.name}
            </Link>
            <p className="truncate text-sm text-suave">
              @{post.autor.username} ·{" "}
              <time dateTime={post.created_at} title={new Date(post.created_at).toLocaleString("pt-BR")}>
                {tempoRelativo(post.created_at)}
              </time>
            </p>
          </div>
          {podeSeguir && (
            <Botao variante="contorno" onClick={seguirAutor} disabled={salvando} className="shrink-0 px-3 text-lg">
              Seguir
            </Botao>
          )}
          {souAutor && !editando && (
            <div className="flex gap-3 text-sm text-suave">
              <button type="button" onClick={() => setEditando(true)} disabled={salvando} className="min-h-11 hover:text-tinta">
                editar
              </button>
              <button type="button" onClick={apagar} disabled={salvando} className="min-h-11 hover:text-perigo">
                apagar
              </button>
            </div>
          )}
        </header>

        {editando ? (
          <div className="space-y-2">
            <AreaDeTexto
              value={rascunho}
              onChange={(e) => setRascunho(e.target.value)}
              maxLength={LIMITE_TEXTO}
              rows={3}
              aria-label="Texto do post"
            />
            <div className="flex justify-end gap-2">
              <Botao variante="contorno" onClick={cancelar} disabled={salvando}>
                Cancelar
              </Botao>
              <Botao onClick={salvar} disabled={salvando || !rascunho.trim()}>
                {salvando ? "Salvando..." : "Salvar"}
              </Botao>
            </div>
          </div>
        ) : (
          <>
            {post.treino && (
              <ul aria-label="Treino do dia" className="flex flex-wrap gap-1.5">
                <li className="rounded-full bg-destaque px-2.5 py-0.5 font-titulo text-base tracking-wide text-tinta">
                  Treino
                </li>
                {post.treino.exercicios.map((exercicio, i) => (
                  <li key={i} className="rounded-full border border-borda bg-fundo px-2.5 py-0.5 text-sm">
                    {resumoExercicio(exercicio)}
                  </li>
                ))}
              </ul>
            )}
            <p className="whitespace-pre-wrap break-words">{post.texto}</p>
          </>
        )}

        <footer className="flex gap-4 text-sm text-suave">
          <span>{GLOSSARIO.curtida} · {post.curtidas}</span>
          <Link href={`/posts/${post.id}`} className="hover:text-tinta hover:underline">
            {contagem(post.comentarios, "comentário", "comentários")}
          </Link>
        </footer>

        {erro && <Erro>{erro}</Erro>}
      </article>
    </Card>
  );
}
