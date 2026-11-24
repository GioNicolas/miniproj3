"use client";

// Lista paginada de seguidores ou de quem a pessoa segue, com "carregar mais".
// As duas páginas (/seguidores e /seguindo) usam este mesmo componente.

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

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
      <div>
        <Link href={`/u/${username}`} className="text-sm text-zinc-500 hover:underline">
          ← @{username}
        </Link>
        <h1 className="text-2xl font-bold">{TITULO[tipo]}</h1>
      </div>

      {erro && (
        <p className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{erro}</p>
      )}

      {total === 0 && <p className="text-zinc-500">{VAZIO[tipo]}</p>}

      <ul className="space-y-2">
        {usuarios.map((u) => (
          <li key={u.id}>
            <Link href={`/u/${u.username}`}>
              <UserCard user={u} />
            </Link>
          </li>
        ))}
      </ul>

      {total !== null && usuarios.length < total && (
        <button
          type="button"
          onClick={() => carregar(usuarios.length)}
          className="rounded border bg-white px-3 py-1.5 text-sm hover:bg-zinc-100"
        >
          carregar mais
        </button>
      )}
    </div>
  );
}
