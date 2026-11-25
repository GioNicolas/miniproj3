"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { Avatar } from "@/components/Avatar";
import { Botao } from "@/components/Botao";
import { Carregando } from "@/components/Carregando";
import { Erro } from "@/components/Erro";
import { EstadoVazio } from "@/components/EstadoVazio";
import { NovaConversa } from "@/components/NovaConversa";
import { apiGet, type Conversa, type Page } from "@/lib/api";
import { abrirConversa, outros, tituloDaConversa } from "@/lib/chat";
import { useEu } from "@/lib/eu";
import { GLOSSARIO } from "@/lib/glossario";
import { tempoRelativo } from "@/lib/tempo";

const INTERVALO_MS = 5_000;

function Previa({ conversa, eu }: { conversa: Conversa; eu: string | undefined }) {
  const ultima = conversa.ultima_mensagem;
  if (!ultima) return <span className="italic">Ninguém falou nada ainda</span>;
  const quem = ultima.autor.username === eu ? "Você: " : conversa.direta ? "" : `${ultima.autor.name.split(" ")[0]}: `;
  return (
    <>
      {quem}
      {ultima.texto}
    </>
  );
}

function ItemDaConversa({ conversa, eu }: { conversa: Conversa; eu: string | undefined }) {
  const [primeiro, segundo] = outros(conversa, eu);
  const naoLidas = conversa.nao_lidas;
  return (
    <li>
      <Link
        href={`/chat/${conversa.id}`}
        className="flex min-h-16 items-center gap-3 rounded-2xl border border-borda bg-superficie p-3 hover:border-tinta"
      >
        {/* grupo: dois avatares sobrepostos; direta: o avatar da pessoa */}
        <span className="relative flex shrink-0">
          {primeiro && <Avatar name={primeiro.name} avatarUrl={primeiro.avatar_url} />}
          {!conversa.direta && segundo && (
            <span className="-ml-4 mt-3 rounded-full ring-2 ring-superficie">
              <Avatar name={segundo.name} avatarUrl={segundo.avatar_url} />
            </span>
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-baseline justify-between gap-2">
            <span className={`truncate ${naoLidas ? "font-bold" : "font-semibold"}`}>{tituloDaConversa(conversa, eu)}</span>
            <span className="shrink-0 text-xs text-suave">{tempoRelativo(conversa.atualizada_em)}</span>
          </span>
          <span className="flex items-center justify-between gap-2">
            <span className={`truncate text-sm ${naoLidas ? "text-tinta" : "text-suave"}`}>
              <Previa conversa={conversa} eu={eu} />
            </span>
            {naoLidas > 0 && (
              <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-destaque px-1.5 text-xs font-bold text-tinta">
                {naoLidas}
                <span className="sr-only"> não lidas</span>
              </span>
            )}
          </span>
        </span>
      </Link>
    </li>
  );
}

export default function ChatPage() {
  const eu = useEu();
  const router = useRouter();
  const [conversas, setConversas] = useState<Conversa[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [criando, setCriando] = useState(false);

  const carregar = useCallback(async () => {
    try {
      const pagina = await apiGet<Page<Conversa>>("/conversas?offset=0&limit=50");
      setConversas(pagina.items);
      setErro(null);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "não deu para carregar as conversas");
    }
  }, []);

  // /chat?com=<username>: atalho para "Mandar mensagem" de outras telas (ex.: perfil).
  useEffect(() => {
    const com = new URLSearchParams(window.location.search).get("com");
    if (!com) return;
    abrirConversa([com])
      .then((c) => router.replace(`/chat/${c.id}`))
      .catch((err) => setErro(err instanceof Error ? err.message : "não deu para abrir a conversa"));
  }, [router]);

  // A lista se atualiza sozinha enquanto a aba está visível: mensagem nova sobe a conversa.
  useEffect(() => {
    carregar();
    const id = setInterval(() => {
      if (document.visibilityState === "visible") carregar();
    }, INTERVALO_MS);
    return () => clearInterval(id);
  }, [carregar]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-titulo text-4xl tracking-wide">{GLOSSARIO.conversa}</h1>
        {!criando && <Botao onClick={() => setCriando(true)}>+ Nova conversa</Botao>}
      </div>

      {criando && <NovaConversa onFechar={() => setCriando(false)} />}

      {erro && <Erro>{erro}</Erro>}

      {conversas === null && !erro && <Carregando />}

      {conversas?.length === 0 && !criando && (
        <EstadoVazio
          titulo="Nenhuma conversa ainda"
          texto="Combine o treino aqui dentro: chame alguém que você segue ou monte o grupo da sua turma."
          acao={<Botao onClick={() => setCriando(true)}>Começar conversa</Botao>}
        />
      )}

      {conversas && conversas.length > 0 && (
        <ul className="space-y-2">
          {conversas.map((c) => (
            <ItemDaConversa key={c.id} conversa={c} eu={eu?.username} />
          ))}
        </ul>
      )}
    </div>
  );
}
