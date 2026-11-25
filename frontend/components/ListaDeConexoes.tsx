"use client";

// Lista paginada de seguidores ou de quem a pessoa segue, com "carregar mais".
// As duas páginas (/seguidores e /seguindo) usam este mesmo componente.

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { Botao } from "@/components/Botao";
import { Erro } from "@/components/Erro";
import { UserCard } from "@/components/UserCard";
import { apiGet, type Page, type User } from "@/lib/api";

const POR_PAGINA = 20;

type Props = {
  username: string;
  tipo: "seguidores" | "seguindo";
};

const TITULO = {
  seguidores: "Seguidores",
  seguindo: "Seguindo",
};

const VAZIO = {
  seguidores: "Ninguém segue ainda.",
  seguindo: "Ainda não segue ninguém.",
};

export function ListaDeConexoes({ username, tipo }: Props) {
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(
    async (offset: number) => {
      try {
        const pagina = await apiGet<Page<User>>(
          `/usuarios/${username}/${tipo}?offset=${offset}&limit=${POR_PAGINA}`
        );
        setUsuarios((anteriores) =>
          offset === 0 ? pagina.items : [...anteriores, ...pagina.items]
        );
        setTotal(pagina.total);
        setErro(null);
      } catch (err) {
        setErro(err instanceof Error ? err.message : "não consegui carregar a lista");
      }
    },
    [username, tipo]
  );

  useEffect(() => {
    carregar(0);
  }, [carregar]);

  return (
    <div className="space-y-4">
      <header className="flex items-center gap-1 pt-2">
        <Link
          href={`/u/${username}`}
          aria-label={`Voltar para @${username}`}
          className="-ml-3 flex h-11 w-11 shrink-0 items-center justify-center rounded-full hover:bg-superficie"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </Link>
        <div className="min-w-0">
          <h1 className="font-titulo text-[22px]">{TITULO[tipo]}</h1>
          <p className="mt-1 text-[13px] text-suave">@{username}</p>
        </div>
      </header>

      {erro && <Erro>{erro}</Erro>}

      {total === 0 && <p className="py-6 text-[15px] text-suave">{VAZIO[tipo]}</p>}

      <ul className="border-t border-borda">
        {usuarios.map((u) => (
          <li key={u.id}>
            <Link href={`/u/${u.username}`} className="block hover:bg-superficie/60">
              <UserCard user={u} />
            </Link>
          </li>
        ))}
      </ul>

      {total !== null && usuarios.length < total && (
        <Botao variante="contorno" onClick={() => carregar(usuarios.length)} className="w-full">
          Carregar mais
        </Botao>
      )}
    </div>
  );
}
