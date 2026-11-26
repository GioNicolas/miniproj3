"use client";

// Posts de uma pessoa em cartões de 2 colunas, como no canvas ("Seus posts" do Meu frango).

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { Botao } from "@/components/Botao";
import { Carregando } from "@/components/Carregando";
import { Erro } from "@/components/Erro";
import { apiGet, type Page, type Post } from "@/lib/api";
import { nomeDaProgressao } from "@/lib/progressoes";
import { tempoRelativo } from "@/lib/tempo";

function volume(post: Post): string | null {
  const ex = post.treino?.exercicios[0];
  if (!ex) return null;
  return ex.series && ex.reps ? `${ex.series}×${ex.reps}` : ex.series ? `${ex.series} séries` : ex.reps ? `${ex.reps} reps` : null;
}

function CartaoDePost({ post }: { post: Post }) {
  const exercicios = post.treino?.exercicios ?? [];
  const titulo = exercicios[0]
    ? nomeDaProgressao(exercicios[0].progressao) + (exercicios.length > 1 ? ` +${exercicios.length - 1}` : "")
    : post.treino
      ? "Treino registrado"
      : "Post";
  const capa = volume(post);

  return (
    <Link
      href={`/posts/${post.id}`}
      aria-label={`${titulo}, ${tempoRelativo(post.created_at)}`}
      className="flex flex-col overflow-hidden rounded-xl bg-superficie text-tinta hover:bg-superficie-2"
    >
      <div className="flex h-24 items-center justify-center bg-superficie-2">
        {capa ? (
          <span className="text-2xl font-extrabold leading-none tracking-[-0.02em]">{capa}</span>
        ) : (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-suave">
            {post.treino ? <path d="M6 6v12M18 6v12M3 9v6M21 9v6M6 12h12" /> : <path d="M4 5h16v11H9l-5 4z" />}
          </svg>
        )}
      </div>
      <div className="flex flex-col gap-1 px-3 pb-2.5 pt-2">
        <span className="truncate text-[13px] font-semibold leading-tight">{titulo}</span>
        <span className="text-xs text-suave">{tempoRelativo(post.created_at)}</span>
        <span className="line-clamp-2 text-xs leading-snug text-pretty">{post.texto}</span>
        <span
          aria-label={`${post.curtidas} tamo junto, ${post.comentarios} ${post.comentarios === 1 ? "comentário" : "comentários"}`}
          className="mt-0.5 flex items-center gap-3 whitespace-nowrap text-xs text-suave"
        >
          <span className="inline-flex items-center gap-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 3c.6 3 4.5 4.8 4.5 9.2a4.5 4.5 0 0 1-9 0c0-1.7.7-2.9 1.8-3.9.2 1.4.9 2.2 1.9 2.4-.6-2.4-.2-5.1.8-7.7z" />
            </svg>
            {post.curtidas}
          </span>
          <span className="inline-flex items-center gap-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 5h16v11H9l-5 4z" />
            </svg>
            {post.comentarios}
          </span>
        </span>
      </div>
    </Link>
  );
}

type Props = {
  username: string;
  /** Quantos mostrar de cara; sem limite, mostra "Ver posts mais antigos". */
  limite?: number;
  onTotal?: (total: number) => void;
  vazio: string;
};

export function GradeDePosts({ username, limite, onTotal, vazio }: Props) {
  const porPagina = limite ?? 20;
  const [posts, setPosts] = useState<Post[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(
    async (offset: number) => {
      setCarregando(true);
      try {
        const pagina = await apiGet<Page<Post>>(`/usuarios/${username}/posts?offset=${offset}&limit=${porPagina}`);
        setPosts((atuais) => (offset === 0 ? pagina.items : [...atuais, ...pagina.items]));
        setTotal(pagina.total);
        onTotal?.(pagina.total);
        setErro(null);
      } catch (err) {
        setErro(err instanceof Error ? err.message : "não deu para carregar os posts");
      } finally {
        setCarregando(false);
      }
    },
    [username, porPagina, onTotal]
  );

  useEffect(() => {
    carregar(0);
  }, [carregar]);

  if (erro) return <Erro>{erro}</Erro>;
  if (total === null) return <Carregando />;
  if (total === 0) return <p className="py-2 text-sm text-pretty text-suave">{vazio}</p>;

  return (
    <div className="flex flex-col gap-3">
      <ul className="grid grid-cols-2 gap-2">
        {posts.map((post) => (
          <li key={post.id} className="contents">
            <CartaoDePost post={post} />
          </li>
        ))}
      </ul>
      {!limite && posts.length < total && (
        <Botao variante="contorno" onClick={() => carregar(posts.length)} disabled={carregando} className="w-full">
          {carregando ? "Carregando..." : "Ver posts mais antigos"}
        </Botao>
      )}
    </div>
  );
}
