"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { GradeDePosts } from "@/components/GradeDePosts";
import { apiGet, type User } from "@/lib/api";
import { useEu } from "@/lib/eu";

// Todos os posts de uma pessoa em cartões, mais novo primeiro ("Ver os N" do Meu frango).
export default function PostsDoUsuarioPage() {
  const { username } = useParams<{ username: string }>();
  const eu = useEu();
  const souEu = eu?.username === username;
  const [total, setTotal] = useState<number | null>(null);
  const [nome, setNome] = useState<string | null>(null);

  // Título com o primeiro nome ("Posts de Bia"): o @ em letra de impacto quebrava em 2 linhas.
  useEffect(() => {
    if (souEu) return;
    apiGet<User>(`/usuarios/${username}`)
      .then((u) => setNome(u.name.split(" ")[0]))
      .catch(() => setNome(null));
  }, [username, souEu]);

  return (
    <div className="flex flex-col gap-4">
      <header className="-ml-3 flex items-start gap-1 pt-2">
        <Link
          href={souEu ? "/perfil" : `/u/${username}`}
          aria-label="Voltar pro perfil"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full hover:bg-superficie"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </Link>
        <div>
          <h1 className="flex min-h-11 items-center font-titulo text-[22px]">{souEu ? "Seus posts" : nome ? `Posts de ${nome}` : "Posts"}</h1>
          {total !== null && (
            <p className="mt-1 text-[13px] text-suave">
              {!souEu && `@${username} · `}
              {total} {total === 1 ? "post" : "posts"} · mais novo primeiro
            </p>
          )}
        </div>
      </header>
      <GradeDePosts username={username} onTotal={setTotal} vazio="Nenhum post ainda." />
    </div>
  );
}
