"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Carregando } from "@/components/Carregando";
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
      .catch((err) => setErro(err instanceof Error ? err.message : "não deu pra carregar o post"));
  }, [id]);

  if (erro) {
    return (
      <p role="alert" className="rounded-lg bg-brasa-fundo px-3 py-2 text-sm text-brasa">
        {erro}
      </p>
    );
  }
  if (!post) return <Carregando />;

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
