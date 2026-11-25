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
        <Link href={`/u/${username}`} className="text-sm text-suave hover:underline">
          ← @{username}
        </Link>
        <h1 className="text-2xl font-bold">{TITULO[tipo]}</h1>
      </div>

      {erro && (
        <p className="rounded-lg bg-brasa-fundo px-3 py-2 text-sm text-brasa">{erro}</p>
      )}

      {total === 0 && <p className="text-suave">{VAZIO[tipo]}</p>}

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
          className="min-h-11 rounded-lg border border-borda-forte px-3 text-sm hover:bg-superficie-2"
        >
          carregar mais
        </button>
      )}
    </div>
  );
}
