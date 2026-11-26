"use client";

import { useCallback, useEffect, useState } from "react";

import { Botao } from "@/components/Botao";
import { Carregando } from "@/components/Carregando";
import { Erro } from "@/components/Erro";
import { EstadoVazio } from "@/components/EstadoVazio";
import { PostCard } from "@/components/PostCard";
import { apiGet, type Page, type Post } from "@/lib/api";

const POR_PAGINA = 20;

type Props = {
  // rota que devolve página de PostOut: "/explorar", "/feed", "/usuarios/ana/posts"
  caminho: string;
  vazio: { titulo: string; texto?: string };
};

// Lista única de posts com "carregar mais": feed, explorar e perfil usam esta.
export function ListaDePosts({ caminho, vazio }: Props) {
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
    setPosts((atuais) => atuais.filter((p) => p.id !== id));
    setTotal((t) => (t === null ? t : t - 1));
  }

  if (erro) return <Erro>{erro}</Erro>;
  if (total === null) return <Carregando />;
  if (total === 0) return <EstadoVazio titulo={vazio.titulo} texto={vazio.texto} />;

  return (
    <div className="space-y-4">
      <ul>
        {posts.map((post) => (
          <li key={post.id}>
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
