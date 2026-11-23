"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Comentarios } from "@/components/Comentarios";
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

  if (erro) {
    return <p className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{erro}</p>;
  }
  if (!post) return <p className="text-zinc-500">carregando...</p>;

  return (
    <div className="space-y-6">
      <PostCard post={post} onAtualizado={setPost} onApagado={() => router.push("/")} />
      <Comentarios
        postId={post.id}
        onComentou={() => setPost({ ...post, comentarios: post.comentarios + 1 })}
      />
    </div>
  );
}
