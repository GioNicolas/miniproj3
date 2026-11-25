"use client";

import Link from "next/link";
import { useState } from "react";

import { AreaDeTexto } from "@/components/AreaDeTexto";
import { Avatar } from "@/components/Avatar";
import { Botao } from "@/components/Botao";
import { Erro } from "@/components/Erro";
import { apiDelete, apiPatch, type Exercicio, type Post } from "@/lib/api";
import { useEu } from "@/lib/eu";
import { GLOSSARIO } from "@/lib/glossario";
import { tempoRelativo } from "@/lib/tempo";

const LIMITE_TEXTO = 500;

function resumoExercicio({ progressao, series, reps }: Exercicio): string {
  const volume =
    series && reps ? `${series}×${reps}` : series ? `${series} séries` : reps ? `${reps} reps` : null;
  const nome = progressao.split("_").join(" ");
  return [nome.charAt(0).toUpperCase() + nome.slice(1), volume].filter(Boolean).join(" · ");
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

  const exercicios = post.treino?.exercicios ?? [];

  return (
    // Post é linha, não card: a linha de cima separa um do outro (igual ao canvas).
    <article className="flex flex-col border-t border-borda pt-1">
      <header className="flex items-center gap-3 pb-3 pt-4">
        <Avatar name={post.autor.name} avatarUrl={post.autor.avatar_url} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold">{post.autor.name}</p>
          <p className="mt-0.5 truncate text-xs text-suave">
            @{post.autor.username} ·{" "}
            <time dateTime={post.created_at} title={new Date(post.created_at).toLocaleString("pt-BR")}>
              {tempoRelativo(post.created_at)}
            </time>
          </p>
        </div>
        {souAutor && !editando && (
          <div className="flex shrink-0 text-[13px] font-medium text-suave">
            <button type="button" onClick={() => setEditando(true)} disabled={salvando} className="min-h-11 px-2 hover:text-tinta">
              Editar
            </button>
            <button type="button" onClick={apagar} disabled={salvando} className="min-h-11 px-2 hover:text-brasa">
              Apagar
            </button>
          </div>
        )}
      </header>

      {editando ? (
        <div className="space-y-2 pb-4">
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
            <Botao variante="escuro" onClick={salvar} disabled={salvando || !rascunho.trim()}>
              {salvando ? "Salvando..." : "Salvar"}
            </Botao>
          </div>
        </div>
      ) : (
        <>
          {/* Bloco do treino: o check-in que conta pro frango */}
          {post.treino && (
            <div className="flex items-center gap-4 rounded-xl bg-superficie px-4 py-3">
              <div className="flex w-14 shrink-0 flex-col items-center">
                <span className="font-placar text-[32px] leading-[0.9]">{exercicios.length}</span>
                <span className="text-xs text-suave">{exercicios.length === 1 ? "exercício" : "exercícios"}</span>
              </div>
              {exercicios.length > 0 ? (
                <ul aria-label="Treino do dia" className="min-w-0 flex-1 space-y-0.5">
                  {exercicios.map((exercicio, i) => (
                    <li key={i} className="truncate text-[15px] font-semibold leading-tight">
                      {resumoExercicio(exercicio)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="min-w-0 flex-1 text-[15px] font-semibold leading-tight">
                  Treino registrado
                  <span className="mt-0.5 block text-xs font-normal text-suave">Vale 1 dia na granja</span>
                </p>
              )}
            </div>
          )}
          <p className="whitespace-pre-wrap break-words pt-3 text-[15px] leading-[1.55] text-pretty">{post.texto}</p>
        </>
      )}

      <footer className="flex items-center gap-4 pb-2 pt-1 text-[13px]">
        <span className="flex min-h-11 items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-destaque">
            <path d="M12 3c.6 3 4.5 4.8 4.5 9.2a4.5 4.5 0 0 1-9 0c0-1.7.7-2.9 1.8-3.9.2 1.4.9 2.2 1.9 2.4-.6-2.4-.2-5.1.8-7.7z" />
          </svg>
          <span className="font-semibold">{GLOSSARIO.curtida}</span>
          <span className="font-medium tabular-nums text-suave">{post.curtidas}</span>
        </span>
        <Link href={`/posts/${post.id}`} className="flex min-h-11 items-center gap-2 font-medium text-ceu hover:underline">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 5h16v11H9l-5 4z" />
          </svg>
          {contagem(post.comentarios, "comentário", "comentários")}
        </Link>
      </footer>

      {erro && <div className="pb-3"><Erro>{erro}</Erro></div>}
    </article>
  );
}
