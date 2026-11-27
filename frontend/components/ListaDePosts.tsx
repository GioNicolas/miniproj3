"use client";

import { useCallback, useEffect, useState } from "react";

import { Botao } from "@/components/Botao";
import { Erro } from "@/components/Erro";
import { EstadoVazio } from "@/components/EstadoVazio";
import { PostCard } from "@/components/PostCard";
import { apiGet, type Page, type Post } from "@/lib/api";

const POR_PAGINA = 20;

/** Esqueleto no formato do post enquanto a página carrega: a tela não pula quando chega. */
function EsqueletoDePosts() {
  return (
    <div role="status" aria-label="Carregando posts" className="animate-brilho">
      {[0, 1, 2].map((i) => (
        <div key={i} className="mb-3 flex flex-col gap-3 rounded-2xl border border-borda bg-elevado p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-superficie" />
            <div className="flex flex-col gap-1.5">
              <div className="h-3 w-32 rounded bg-superficie" />
              <div className="h-2.5 w-20 rounded bg-superficie" />
            </div>
          </div>
          <div className="h-3 w-4/5 rounded bg-superficie" />
          <div className="h-16 rounded-xl bg-superficie" />
        </div>
      ))}
    </div>
  );
}

type Props = {
  // rota que devolve página de PostOut: "/explorar", "/feed", "/usuarios/ana/posts"
  caminho: string;
  vazio: { titulo: string; texto?: string };
  // avisa quem está em volta quando um post sai da lista (ex.: o feed refaz a chamada do dia)
  aoApagar?: (post: Post) => void;
};

// Lista única de posts com "carregar mais": feed, explorar e perfil usam esta.
export function ListaDePosts({ caminho, vazio, aoApagar }: Props) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(
    async (offset: number) => {
      setCarregando(true);
      try {
        const separador = caminho.includes("?") ? "&" : "?";
        const pagina = await apiGet<Page<Post>>(
          `${caminho}${separador}offset=${offset}&limit=${POR_PAGINA}`
        );
        setPosts((atuais) => (offset === 0 ? pagina.items : [...atuais, ...pagina.items]));
        setTotal(pagina.total);
        setErro(null);
      } catch (err) {
        setErro(err instanceof Error ? err.message : "erro ao carregar os posts");
      } finally {
        setCarregando(false);
      }
    },
    [caminho]
  );

  useEffect(() => {
    carregar(0);
  }, [carregar]);

  function atualizar(post: Post) {
    setPosts((atuais) => atuais.map((p) => (p.id === post.id ? post : p)));
  }

  function remover(id: number) {
    const apagado = posts.find((p) => p.id === id);
    if (apagado) aoApagar?.(apagado);
    setPosts((atuais) => atuais.filter((p) => p.id !== id));
    setTotal((t) => (t === null ? t : t - 1));
  }

  if (erro) return <Erro>{erro}</Erro>;
  if (total === null) return <EsqueletoDePosts />;
  if (total === 0) return <EstadoVazio titulo={vazio.titulo} texto={vazio.texto} />;

  return (
    <div className="space-y-4">
      <ul className="flex flex-col gap-3">
        {posts.map((post, i) => (
          // entrada em cascata só nos primeiros da página: o resto já nasce fora da tela
          <li key={post.id} className="animate-entrar" style={{ animationDelay: `${Math.min(i % POR_PAGINA, 6) * 45}ms` }}>
            <PostCard post={post} onAtualizado={atualizar} onApagado={remover} />
          </li>
        ))}
      </ul>
      {posts.length < total && (
        <Botao variante="contorno" onClick={() => carregar(posts.length)} disabled={carregando} className="w-full">
          {carregando ? "Carregando..." : "Ver posts mais antigos"}
        </Botao>
      )}
    </div>
  );
}
