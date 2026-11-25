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

  if (erro) return <Erro>{erro}</Erro>;
  if (!post) return <Carregando />;

  return (
    <div className="space-y-6">
      <Link href="/" className="inline-flex min-h-11 items-center text-sm text-suave hover:text-tinta">
        ← voltar pro feed
      </Link>
      <PostCard post={post} onAtualizado={setPost} onApagado={() => router.push("/")} />
      <Comentarios
        postId={post.id}
        onComentou={() => setPost({ ...post, comentarios: post.comentarios + 1 })}
      />
    </div>
  );
}
