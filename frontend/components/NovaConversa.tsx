"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Avatar } from "@/components/Avatar";
import { Botao } from "@/components/Botao";
import { Campo } from "@/components/Campo";
import { Card } from "@/components/Card";
import { Carregando } from "@/components/Carregando";
import { Erro } from "@/components/Erro";
import { EstadoVazio } from "@/components/EstadoVazio";
import { apiGet, type Page, type User } from "@/lib/api";
import { abrirConversa } from "@/lib/chat";
import { useEu } from "@/lib/eu";

const LIMITE_OUTROS = 9; // até 10 pessoas no grupo, contando você

/** Escolhe entre quem você segue: uma pessoa abre a conversa direta; duas ou mais, um grupo. */
export function NovaConversa({ onFechar }: { onFechar: () => void }) {
  const eu = useEu();
  const router = useRouter();
  const [pessoas, setPessoas] = useState<User[] | null>(null);
  const [busca, setBusca] = useState("");
  const [escolhidos, setEscolhidos] = useState<string[]>([]);
  const [nome, setNome] = useState("");
  const [criando, setCriando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!eu) return;
    apiGet<Page<User>>(`/usuarios/${eu.username}/seguindo?offset=0&limit=100`)
      .then((pagina) => setPessoas(pagina.items))
      .catch(() => setErro("não deu para carregar quem você segue"));
  }, [eu]);

  function alternar(username: string) {
    setEscolhidos((atuais) =>
      atuais.includes(username)
        ? atuais.filter((u) => u !== username)
        : atuais.length < LIMITE_OUTROS
          ? [...atuais, username]
          : atuais,
    );
  }

  async function criar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setCriando(true);
    try {
      const conversa = await abrirConversa(escolhidos, escolhidos.length > 1 ? nome : undefined);
      router.push(`/chat/${conversa.id}`);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "não deu para abrir a conversa");
      setCriando(false);
    }
  }

  const termo = busca.trim().toLowerCase();
  const visiveis = (pessoas ?? []).filter(
    (p) => !termo || p.name.toLowerCase().includes(termo) || p.username.includes(termo),
  );
  const grupo = escolhidos.length > 1;
  const rotulo =
    escolhidos.length === 0
      ? "Escolha alguém"
      : grupo
        ? `Criar grupo com ${escolhidos.length + 1}`
        : `Conversar com ${pessoas?.find((p) => p.username === escolhidos[0])?.name.split(" ")[0] ?? escolhidos[0]}`;

  return (
    <Card>
      <form onSubmit={criar} className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-titulo text-2xl tracking-wide">Nova conversa</h2>
          <button type="button" onClick={onFechar} className="min-h-11 px-2 text-sm text-suave hover:text-tinta">
            Cancelar
          </button>
        </div>

        {pessoas === null && !erro && <Carregando />}

        {pessoas?.length === 0 && (
          <EstadoVazio
            titulo="Você ainda não segue ninguém"
            texto="O chat é com quem você segue. Ache a galera no Explorar e toque em Seguir."
            acao={
              <Link href="/" className="text-sm font-semibold text-destaque-texto underline">
                Ir para o Explorar
              </Link>
            }
          />
        )}

        {pessoas && pessoas.length > 0 && (
          <>
            {pessoas.length > 6 && (
              <Campo rotulo="Buscar" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Nome ou @usuário" />
            )}
            <fieldset>
              <legend className="mb-2 text-sm text-suave">
                Uma pessoa abre a conversa direta; duas ou mais viram um grupo (até 10 pessoas com você).
              </legend>
              <ul className="max-h-80 space-y-1 overflow-y-auto">
                {visiveis.map((p) => {
                  const marcado = escolhidos.includes(p.username);
                  return (
                    <li key={p.username}>
                      <label
                        className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 ${
                          marcado ? "border-tinta bg-fundo" : "border-transparent hover:bg-fundo"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={marcado}
                          onChange={() => alternar(p.username)}
                          className="size-5 accent-[var(--color-tinta)]"
                        />
                        <Avatar name={p.name} avatarUrl={p.avatar_url} />
                        <span className="min-w-0">
                          <span className="block truncate font-semibold">{p.name}</span>
                          <span className="block truncate text-sm text-suave">@{p.username}</span>
                        </span>
                      </label>
                    </li>
                  );
                })}
                {visiveis.length === 0 && <li className="px-3 py-2 text-sm text-suave">Ninguém com esse nome.</li>}
              </ul>
            </fieldset>

            {grupo && (
              <Campo
                rotulo="Nome do grupo (opcional)"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                maxLength={60}
                placeholder="Ex.: Barra do CCEN às 17h"
              />
            )}
          </>
        )}

        {erro && <Erro>{erro}</Erro>}

        {pessoas && pessoas.length > 0 && (
          <Botao type="submit" disabled={criando || escolhidos.length === 0} className="w-full">
            {criando ? "Abrindo..." : rotulo}
          </Botao>
        )}
      </form>
    </Card>
  );
}
