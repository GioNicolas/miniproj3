"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { AreaDeTexto } from "@/components/AreaDeTexto";
import { Avatar } from "@/components/Avatar";
import { Carregando } from "@/components/Carregando";
import { Erro } from "@/components/Erro";
import { EstadoVazio } from "@/components/EstadoVazio";
import { apiGet, apiPost, type Conversa, type Mensagem, type Page } from "@/lib/api";
import { atualizarNaoLidas, outros, tituloDaConversa } from "@/lib/chat";
import { useEu } from "@/lib/eu";

const POR_PAGINA = 100; // o máximo que GET /conversas/{id}/mensagens aceita
const INTERVALO_MS = 3_000; // sem WebSocket: a conversa pergunta de 3 em 3 segundos
const LIMITE_TEXTO = 500;

function hora(iso: string): string {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function rotuloDoDia(iso: string): string {
  const dia = new Date(iso).toDateString();
  const hoje = new Date();
  const ontem = new Date(hoje);
  ontem.setDate(hoje.getDate() - 1);
  if (dia === hoje.toDateString()) return "Hoje";
  if (dia === ontem.toDateString()) return "Ontem";
  return new Date(iso).toLocaleDateString("pt-BR", { day: "numeric", month: "long" });
}

function Cabecalho({ conversa, eu }: { conversa: Conversa; eu: string | undefined }) {
  const demais = outros(conversa, eu);
  const subtitulo = conversa.direta
    ? `@${demais[0]?.username ?? ""}`
    : `${conversa.participantes.length} pessoas: ${[...demais.map((p) => p.name.split(" ")[0]), "você"].join(", ")}`;
  return (
    // fixo no topo ao rolar (no computador, abaixo da barra de navegação de 69px)
    <div className="sticky top-0 z-10 -mx-5 flex items-center gap-2 border-b border-borda bg-fundo px-5 pb-3 pt-2 md:top-[69px] md:mx-0 md:px-0">
      <Link
        href="/chat"
        aria-label="Voltar para as conversas"
        className="-ml-3 flex h-11 w-11 shrink-0 items-center justify-center rounded-full hover:bg-superficie"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M15 5l-7 7 7 7" />
        </svg>
      </Link>
      {demais[0] && <Avatar name={demais[0].name} avatarUrl={demais[0].avatar_url} patente={demais[0].nivel} />}
      <div className="min-w-0">
        <h1 className="truncate text-[17px] font-bold tracking-[-0.02em]">{tituloDaConversa(conversa, eu)}</h1>
        <p className="truncate text-[13px] text-suave">{subtitulo}</p>
      </div>
    </div>
  );
}

export default function ConversaPage() {
  const { id } = useParams<{ id: string }>();
  const eu = useEu();
  const [conversa, setConversa] = useState<Conversa | null>(null);
  const [naoAchou, setNaoAchou] = useState(false);
  const [mensagens, setMensagens] = useState<Mensagem[] | null>(null);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const total = useRef(0); // quantas mensagens a conversa tinha na última busca
  const carregou = useRef(false);
  const fila = useRef<Promise<unknown>>(Promise.resolve());
  const colarNoFim = useRef(true); // só desce sozinho se a pessoa já estava lá embaixo

  // Pede só o que chegou depois do que está na tela. Em fila: o polling e o
  // envio nunca buscam a mesma página ao mesmo tempo nem duplicam mensagem.
  const buscarNovas = useCallback(() => {
    const vez = fila.current.then(async () => {
      const url = (offset: number) => `/conversas/${id}/mensagens?offset=${offset}&limit=${POR_PAGINA}`;
      let pagina = await apiGet<Page<Mensagem>>(url(total.current));
      // Na abertura, conversa longa começa pelas 100 mais recentes.
      if (!carregou.current && pagina.total > POR_PAGINA) {
        pagina = await apiGet<Page<Mensagem>>(url(pagina.total - POR_PAGINA));
      }
      carregou.current = true;
      total.current = Math.max(total.current, pagina.offset + pagina.items.length);
      setMensagens((atuais) => {
        const vistas = new Set((atuais ?? []).map((m) => m.id));
        const novas = pagina.items.filter((m) => !vistas.has(m.id));
        return novas.length || !atuais ? [...(atuais ?? []), ...novas] : atuais;
      });
      // Ler mensagens marca como lido no backend: o aviso da Navbar acompanha.
      if (pagina.items.length) atualizarNaoLidas();
    });
    fila.current = vez.catch(() => undefined);
    return vez;
  }, [id]);

  useEffect(() => {
    if (naoAchou) return;
    apiGet<Conversa>(`/conversas/${id}`)
      .then(setConversa)
      .catch(() => setNaoAchou(true));
    buscarNovas().catch(() => undefined);
    const intervalo = setInterval(() => {
      if (document.visibilityState === "visible") buscarNovas().catch(() => undefined);
    }, INTERVALO_MS);
    return () => clearInterval(intervalo);
  }, [id, naoAchou, buscarNovas]);

  useEffect(() => {
    const medir = () => {
      colarNoFim.current = window.innerHeight + window.scrollY >= document.body.scrollHeight - 160;
    };
    window.addEventListener("scroll", medir, { passive: true });
    return () => window.removeEventListener("scroll", medir);
  }, []);

  useEffect(() => {
    // rola a página até o fim, e não só até o fim da lista: o campo fixo cobriria a última mensagem
    if (colarNoFim.current) window.scrollTo({ top: document.documentElement.scrollHeight });
  }, [mensagens]);

  async function enviar(e?: React.FormEvent) {
    e?.preventDefault();
    const limpo = texto.trim();
    if (!limpo || enviando) return;
    setEnviando(true);
    setErro(null);
    try {
      await apiPost<Mensagem>(`/conversas/${id}/mensagens`, { texto: limpo });
      setTexto("");
      colarNoFim.current = true;
      await buscarNovas();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "não deu para enviar");
    } finally {
      setEnviando(false);
    }
  }

  function teclar(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Enter envia; Shift+Enter quebra a linha. Durante a composição (acentos no
    // teclado do celular) o Enter é do teclado, não do chat.
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      enviar();
    }
  }

  if (naoAchou) {
    return (
      <EstadoVazio
        titulo="Conversa não encontrada"
        texto="Ela não existe ou você não está nela."
        acao={
          <Link href="/chat" className="text-sm font-semibold text-destaque-texto underline">
            Ver minhas conversas
          </Link>
        }
      />
    );
  }

  if (!conversa || mensagens === null) return <Carregando />;

  return (
    <div className="flex min-h-[calc(100dvh-11rem)] md:min-h-[calc(100dvh-8rem)] flex-col">
      <Cabecalho conversa={conversa} eu={eu?.username} />

      <div className="flex-1 py-4">
        {mensagens.length === 0 ? (
          <EstadoVazio
            titulo="Começa aí"
            texto={conversa.direta ? "Manda a primeira mensagem. Que tal combinar o próximo treino?" : "Grupo criado. Bora combinar o treino da turma?"}
          />
        ) : (
          <ol aria-label="Mensagens" aria-live="polite" className="flex flex-col">
            {mensagens.map((m, i) => {
              const anterior = mensagens[i - 1];
              const minha = m.autor.username === eu?.username;
              const novoDia = !anterior || new Date(anterior.created_at).toDateString() !== new Date(m.created_at).toDateString();
              const novoAutor = novoDia || anterior.autor.username !== m.autor.username;
              return (
                <li key={m.id}>
                  {novoDia && <p className="my-3 text-center text-xs font-semibold text-suave">{rotuloDoDia(m.created_at)}</p>}
                  <div className={`flex ${minha ? "justify-end" : "justify-start"} ${novoAutor ? "mt-3" : "mt-1"}`}>
                    <div className="max-w-[80%]">
                      {!minha && !conversa.direta && novoAutor && (
                        <p className="mb-0.5 ml-1 text-xs font-semibold text-suave">{m.autor.name}</p>
                      )}
                      <p
                        className={`flow-root whitespace-pre-wrap break-words rounded-2xl px-3 py-2 ${
                          minha
                            ? "rounded-br-md bg-elevado text-tinta"
                            : "rounded-bl-md bg-superficie text-tinta"
                        }`}
                      >
                        {m.texto}
                        <span className="float-right ml-2 mt-2 text-[11px] leading-none">
                          <span className="sr-only">{minha ? "você, " : `${m.autor.name}, `}</span>
                          {hora(m.created_at)}
                        </span>
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      {/* Caixa de mensagem presa embaixo, acima da barra de navegação do celular */}
      <form
        onSubmit={enviar}
        className="sticky bottom-[calc(4.25rem+max(1rem,env(safe-area-inset-bottom)))] -mx-5 space-y-2 border-t border-borda bg-fundo px-5 py-3 md:bottom-0 md:mx-0 md:px-0"
      >
        {erro && <Erro>{erro}</Erro>}
        <div className="flex items-end gap-2">
          <AreaDeTexto
            aria-label="Mensagem"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={teclar}
            maxLength={LIMITE_TEXTO}
            rows={Math.min(5, texto.split("\n").length)}
            placeholder="Mensagem"
            className="min-h-11 resize-none"
          />
          <button
            type="submit"
            disabled={enviando || !texto.trim()}
            aria-label="Enviar"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-destaque text-sobre-destaque transition-[transform,filter] hover:brightness-105 active:scale-95 disabled:bg-superficie-2 disabled:text-suave"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}
