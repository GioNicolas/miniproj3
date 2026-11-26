"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Carregando } from "@/components/Carregando";
import { Comentarios } from "@/components/Comentarios";
import { Erro } from "@/components/Erro";
import { PostCard } from "@/components/PostCard";
import { apiGet, type Post } from "@/lib/api";

export default function PostPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    apiGet<Post>(`/posts/${id}`)
      .then(setPost)
      .catch((err) => setErro(err instanceof Error ? err.message : "erro ao carregar o post"));
  }, [id]);

  const cabecalho = (
    <header className="flex items-center gap-1 pt-2">
      <Link
        href="/"
        aria-label="Voltar pro feed"
        className="-ml-3 flex h-11 w-11 shrink-0 items-center justify-center rounded-full hover:bg-superficie"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M15 5l-7 7 7 7" />
        </svg>
      </Link>
      <h1 className="font-titulo text-[22px]">Post</h1>
    </header>
  );

  if (erro) return <div className="space-y-4">{cabecalho}<Erro>{erro}</Erro></div>;
  if (!post) return <div className="space-y-4">{cabecalho}<Carregando /></div>;

  return (
    <div className="flex flex-col gap-4">
      {cabecalho}
      <PostCard post={post} onAtualizado={setPost} onApagado={() => router.push("/")} />
      <Comentarios
        postId={post.id}
        onComentou={() => setPost({ ...post, comentarios: post.comentarios + 1 })}
      />
    </div>
  );
}
