"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { AreaDeTexto } from "@/components/AreaDeTexto";
import { Avatar } from "@/components/Avatar";
import { Botao } from "@/components/Botao";
import { BotaoTamoJunto } from "@/components/BotaoTamoJunto";
import { Erro } from "@/components/Erro";
import { SeloDaPatente } from "@/components/Frango";
import { apiDelete, apiPatch, urlDaApi, type Exercicio, type Post } from "@/lib/api";
import { useEu } from "@/lib/eu";
import { nomeDaProgressao } from "@/lib/progressoes";
import { seguir, useSeguindo } from "@/lib/seguindo";
import { tempoRelativo } from "@/lib/tempo";

const LIMITE_TEXTO = 500;

function volume({ series, reps }: Exercicio): string {
  return series && reps ? `${series}×${reps}` : series ? `${series} séries` : reps ? `${reps} reps` : "";
}

/** O treino do post: lista enxuta, nome à esquerda e volume à direita, como um placar. */
function BlocoDoTreino({ exercicios }: { exercicios: Exercicio[] }) {
  return (
    <div className="rounded-xl border border-borda bg-superficie px-3.5 py-2.5">
      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-destaque">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11" />
        </svg>
        Treino
        {exercicios.length > 0 && (
          <span className="font-medium normal-case tracking-normal text-suave">
            · {exercicios.length} {exercicios.length === 1 ? "exercício" : "exercícios"}
          </span>
        )}
      </p>
      {exercicios.length > 0 ? (
        <ul aria-label="Treino do dia" className="mt-1.5 divide-y divide-borda">
          {exercicios.map((exercicio, i) => (
            <li key={i} className="flex items-baseline justify-between gap-3 py-1.5 text-[14px]">
              <span className="min-w-0 truncate font-semibold">{nomeDaProgressao(exercicio.progressao)}</span>
              <span className="shrink-0 tabular-nums text-suave">{volume(exercicio)}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-1 text-[13px] text-suave">Treino registrado · vale 1 dia na granja</p>
      )}
    </div>
  );
}

/** Menu "⋯" do autor: Editar e Apagar ficam guardados até alguém precisar. */
function MenuDoAutor({ onEditar, onApagar, desativado }: { onEditar: () => void; onApagar: () => void; desativado: boolean }) {
  const [aberto, setAberto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) return;
    function fora(e: PointerEvent) {
      if (!ref.current?.contains(e.target as Node)) setAberto(false);
    }
    function esc(e: KeyboardEvent) {
      if (e.key === "Escape") setAberto(false);
    }
    document.addEventListener("pointerdown", fora);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", fora);
      document.removeEventListener("keydown", esc);
    };
  }, [aberto]);

  const item = "flex min-h-11 w-full items-center px-4 text-left text-sm font-medium transition-colors hover:bg-superficie-2";
  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setAberto((a) => !a)}
        disabled={desativado}
        aria-label="Opções do post"
        aria-expanded={aberto}
        className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full text-suave transition-colors hover:bg-superficie hover:text-tinta"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <circle cx="5" cy="12" r="1.8" />
          <circle cx="12" cy="12" r="1.8" />
          <circle cx="19" cy="12" r="1.8" />
        </svg>
      </button>
      {aberto && (
        <div role="menu" className="absolute right-0 top-11 z-20 w-40 origin-top-right animate-surgir overflow-hidden rounded-xl border border-borda bg-superficie py-1 shadow-lg shadow-black/40">
          <button type="button" role="menuitem" className={item} onClick={() => { setAberto(false); onEditar(); }}>
            Editar
          </button>
          <button type="button" role="menuitem" className={`${item} text-brasa`} onClick={() => { setAberto(false); onApagar(); }}>
            Apagar
          </button>
        </div>
      )}
    </div>
  );
}

type Props = {
  post: Post;
  onAtualizado?: (post: Post) => void;
  onApagado?: (id: number) => void;
};

export function PostCard({ post, onAtualizado, onApagado }: Props) {
  const eu = useEu();
  const souAutor = eu?.username === post.autor.username;
  const sigo = useSeguindo();
  // Seguir pelo post é a porta de entrada de quem chegou pelo Explorar.
  const podeSeguir = eu !== null && !souAutor && sigo !== null && !sigo.has(post.autor.username);
  const [editando, setEditando] = useState(false);
  const [rascunho, setRascunho] = useState(post.texto);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [fotoCarregou, setFotoCarregou] = useState(false);

  async function salvar() {
    setSalvando(true);
    try {
      const atualizado = await apiPatch<Post>(`/posts/${post.id}`, { texto: rascunho });
      setEditando(false);
      setErro(null);
      onAtualizado?.(atualizado);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "erro ao editar o post");
    } finally {
      setSalvando(false);
    }
  }

  async function apagar() {
    if (!confirm("Apagar este post?")) return;
    setSalvando(true);
    try {
      await apiDelete(`/posts/${post.id}`);
      onApagado?.(post.id);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "erro ao apagar o post");
    } finally {
      setSalvando(false);
    }
  }

  async function seguirAutor() {
    setSalvando(true);
    try {
      await seguir(post.autor.username);
      setErro(null);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "não deu para seguir agora");
    } finally {
      setSalvando(false);
    }
  }

  function cancelar() {
    setRascunho(post.texto);
    setEditando(false);
    setErro(null);
  }

  return (
    // Post é linha, não card: a linha de cima separa um do outro.
    <article className="flex flex-col gap-3 border-t border-borda py-4">
      <header className="flex items-center gap-3">
        <Link href={`/u/${post.autor.username}`} className="shrink-0 rounded-full">
          <Avatar name={post.autor.name} avatarUrl={post.autor.avatar_url} patente={post.autor.nivel} />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="flex min-w-0 items-center gap-2">
            <Link href={`/u/${post.autor.username}`} className="truncate text-[15px] font-semibold hover:underline">
              {post.autor.name}
            </Link>
            {post.autor.nivel && <SeloDaPatente patente={post.autor.nivel} />}
          </p>
          <p className="mt-0.5 truncate text-xs text-suave">
            @{post.autor.username} ·{" "}
            <time dateTime={post.created_at} title={new Date(post.created_at).toLocaleString("pt-BR")}>
              {tempoRelativo(post.created_at)}
            </time>
          </p>
        </div>
        {/* Seguir: só contorno; some depois de seguir */}
        {podeSeguir && (
          <button
            type="button"
            onClick={seguirAutor}
            disabled={salvando}
            className="min-h-9 shrink-0 rounded-full border border-borda-forte px-4 text-[13px] font-semibold text-tinta transition-[background-color,transform] duration-150 hover:bg-superficie active:scale-95 disabled:opacity-50"
          >
            Seguir
          </button>
        )}
        {souAutor && !editando && <MenuDoAutor onEditar={() => setEditando(true)} onApagar={apagar} desativado={salvando} />}
      </header>

      {editando ? (
        <div className="space-y-2">
          <AreaDeTexto
            value={rascunho}
            onChange={(e) => setRascunho(e.target.value)}
            maxLength={LIMITE_TEXTO}
            rows={3}
            aria-label="Texto do post"
          />
          <div className="flex justify-end gap-2">
            <Botao variante="contorno" onClick={cancelar} disabled={salvando}>
              Cancelar
            </Botao>
            <Botao variante="escuro" onClick={salvar} disabled={salvando || !rascunho.trim()}>
              {salvando ? "Salvando..." : "Salvar"}
            </Botao>
          </div>
        </div>
      ) : (
        <p className="whitespace-pre-wrap break-words text-[15px] leading-[1.55] text-pretty">{post.texto}</p>
      )}

      {post.treino && <BlocoDoTreino exercicios={post.treino.exercicios} />}

      {post.imagem_url && (
        <div className={`overflow-hidden rounded-xl bg-superficie ${fotoCarregou ? "" : "aspect-[4/3] animate-brilho"}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={urlDaApi(post.imagem_url)}
            alt={`Foto do post de ${post.autor.name}`}
            loading="lazy"
            onLoad={() => setFotoCarregou(true)}
            className={`max-h-[480px] w-full object-cover transition-opacity duration-300 ${fotoCarregou ? "opacity-100" : "opacity-0"}`}
          />
        </div>
      )}

      {/* Ações: ícone + número, discretas; a cor só aparece em quem já mandou */}
      <footer className="-ml-2 flex items-center gap-1">
        <BotaoTamoJunto
          key={`${post.id}-${post.curtidas}`}
          postId={post.id}
          curtidasIniciais={post.curtidas}
          euCurtiInicial={post.eu_curti}
        />
        <Link
          href={`/posts/${post.id}`}
          aria-label={`${post.comentarios} ${post.comentarios === 1 ? "comentário" : "comentários"}. Abrir o post`}
          className="flex min-h-10 items-center gap-1.5 rounded-full px-2.5 text-[13px] font-medium text-suave transition-colors hover:bg-superficie hover:text-tinta"
        >
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 11.5a7.5 7.5 0 0 1-11.2 6.5L4 19.5l1.5-4.6A7.5 7.5 0 1 1 20 11.5z" />
          </svg>
          <span className="tabular-nums">{post.comentarios}</span>
        </Link>
      </footer>

      {erro && <Erro>{erro}</Erro>}
    </article>
  );
}
