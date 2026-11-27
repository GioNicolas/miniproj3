"use client";

// Lista paginada de seguidores ou de quem a pessoa segue, com "carregar mais".
// As duas páginas (/seguidores e /seguindo) usam este mesmo componente.

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { Botao } from "@/components/Botao";
import { Erro } from "@/components/Erro";
import { EstadoVazio } from "@/components/EstadoVazio";
import { UserCard } from "@/components/UserCard";
import { apiGet, type Page, type User } from "@/lib/api";
import { useEu } from "@/lib/eu";

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

// Na sua própria lista vazia, o estado vazio diz o próximo passo.
const VAZIO_MEU = {
  seguidores: {
    titulo: "Ninguém te segue ainda",
    texto: "Segue quem treina perto e conta seus treinos: é assim que a galera te acha e você entra na granja dela.",
  },
  seguindo: {
    titulo: "Você ainda não segue ninguém",
    texto: "Quem você segue entra no seu feed e disputa a granja da semana com você.",
  },
};

export function ListaDeConexoes({ username, tipo }: Props) {
  const souEu = useEu()?.username === username;
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

      {total === 0 &&
        (souEu ? (
          <EstadoVazio
            titulo={VAZIO_MEU[tipo].titulo}
            texto={VAZIO_MEU[tipo].texto}
            acao={
              <Link href="/" className="flex min-h-12 items-center justify-center rounded-xl border border-borda-forte text-[15px] font-semibold hover:bg-superficie-2">
                Achar gente no Explorar
              </Link>
            }
          />
        ) : (
          <p className="py-6 text-[15px] text-suave">{VAZIO[tipo]}</p>
        ))}

      <ul className="border-t border-borda">
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
