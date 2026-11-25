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
      <div>
        <Link href={`/u/${username}`} className="inline-flex min-h-11 items-center text-sm text-suave hover:text-tinta">
          ← @{username}
        </Link>
        <h1 className="font-titulo text-4xl tracking-wide">{TITULO[tipo]}</h1>
      </div>

      {erro && <Erro>{erro}</Erro>}

      {total === 0 && <p className="text-suave">{VAZIO[tipo]}</p>}

      <ul className="space-y-2">
        {usuarios.map((u) => (
          <li key={u.id}>
            <UserCard user={u} />
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
