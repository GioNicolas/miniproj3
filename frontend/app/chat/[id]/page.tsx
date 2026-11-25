"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { AreaDeTexto } from "@/components/AreaDeTexto";
import { Avatar } from "@/components/Avatar";
import { Botao } from "@/components/Botao";
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
    <div className="flex items-center gap-3 border-b border-borda pb-3">
      <Link
        href="/chat"
        aria-label="Voltar para as conversas"
        className="flex min-h-11 min-w-11 items-center justify-center rounded-lg text-2xl hover:bg-superficie"
      >
        ←
      </Link>
      {demais[0] && <Avatar name={demais[0].name} avatarUrl={demais[0].avatar_url} />}
      <div className="min-w-0">
        <h1 className="truncate font-titulo text-3xl leading-none tracking-wide">{tituloDaConversa(conversa, eu)}</h1>
        <p className="truncate text-sm text-suave">{subtitulo}</p>
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
  const fim = useRef<HTMLDivElement>(null);
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
    if (colarNoFim.current) fim.current?.scrollIntoView({ block: "end" });
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
                            ? "rounded-br-md bg-superficie-escura text-tinta-clara"
                            : "rounded-bl-md border border-borda bg-superficie text-tinta"
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
        <div ref={fim} />
      </div>

      {/* Caixa de mensagem presa embaixo, acima da barra de navegação do celular */}
      <form
        onSubmit={enviar}
        className="sticky bottom-[calc(3.25rem+max(1rem,env(safe-area-inset-bottom)))] -mx-4 space-y-2 border-t border-borda bg-fundo px-4 py-3 md:bottom-0"
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
          <Botao type="submit" disabled={enviando || !texto.trim()} className="shrink-0">
            Enviar
          </Botao>
        </div>
      </form>
    </div>
  );
}
