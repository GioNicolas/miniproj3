"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { AreaDeTexto } from "@/components/AreaDeTexto";
import { Avatar } from "@/components/Avatar";
import { Botao } from "@/components/Botao";
import { BotaoTamoJunto } from "@/components/BotaoTamoJunto";
import { Erro } from "@/components/Erro";
import { TEXTO_DA_PATENTE } from "@/components/Frango";
import { apiDelete, apiPatch, urlDaApi, type Exercicio, type Post } from "@/lib/api";
import { useEu } from "@/lib/eu";
import { nomeDaProgressao } from "@/lib/progressoes";
import { seguir, useSeguindo } from "@/lib/seguindo";
import { tempoRelativo } from "@/lib/tempo";

const LIMITE_TEXTO = 500;
// Exercícios que aparecem antes do "Ver treino completo". Com foto, o post já é
// alto: a lista começa fechada e o placar resume o treino.
const EXERCICIOS_VISIVEIS = 2;
const EXERCICIOS_VISIVEIS_COM_FOTO = 0;

function volume({ series, reps }: Exercicio): string {
  return series && reps ? `${series} × ${reps}` : series ? `${series} séries` : reps ? `${reps} reps` : "";
}

/** Totais do treino, como o placar do Strava: o que dá para ler de relance. */
function totais(exercicios: Exercicio[]) {
  let series = 0;
  let reps = 0;
  for (const { series: s, reps: r } of exercicios) {
    series += s ?? 0;
    reps += (s ?? 1) * (r ?? 0);
  }
  return [
    { valor: exercicios.length, rotulo: exercicios.length === 1 ? "exercício" : "exercícios" },
    { valor: series, rotulo: series === 1 ? "série" : "séries" },
    { valor: reps, rotulo: "reps" },
  ];
}

/** O treino do post: placar com os totais e a lista de exercícios, que abre por inteiro com um toque. */
function BlocoDoTreino({ exercicios, comFoto }: { exercicios: Exercicio[]; comFoto: boolean }) {
  const [aberto, setAberto] = useState(false);

  if (exercicios.length === 0) {
    return (
      <p className="flex items-center gap-2 rounded-xl bg-superficie px-3.5 py-3 text-[13px] text-suave">
        <IconeHalter />
        Treinou hoje · vale 1 dia na granja
      </p>
    );
  }

  const limite = comFoto ? EXERCICIOS_VISIVEIS_COM_FOTO : EXERCICIOS_VISIVEIS;
  const escondidos = exercicios.length - limite;
  const visiveis = aberto ? exercicios : exercicios.slice(0, limite);
  return (
    <section aria-label="Treino do dia" className="overflow-hidden rounded-xl bg-superficie">
      <dl className="grid grid-cols-3 divide-x divide-borda py-3">
        {totais(exercicios).map(({ valor, rotulo }) => (
          <div key={rotulo} className="flex flex-col items-center gap-1">
            <dt className="order-2 text-[11px] font-medium uppercase tracking-[0.06em] text-suave">{rotulo}</dt>
            <dd className="order-1 text-[22px] font-bold leading-none tabular-nums tracking-[-0.02em]">{valor}</dd>
          </div>
        ))}
      </dl>
      {visiveis.length > 0 && (
      <ul className="border-t border-borda px-3.5">
        {visiveis.map((exercicio, i) => (
          <li key={i} className="flex items-center justify-between gap-3 border-b border-borda py-2.5 text-[14px] last:border-b-0">
            <span className="min-w-0 truncate font-semibold">{nomeDaProgressao(exercicio.progressao)}</span>
            <span className="shrink-0 rounded-md bg-elevado px-2 py-0.5 text-[13px] font-semibold tabular-nums">
              {volume(exercicio)}
            </span>
          </li>
        ))}
      </ul>
      )}
      {escondidos > 0 && (
        <button
          type="button"
          onClick={() => setAberto((a) => !a)}
          aria-expanded={aberto}
          className="flex min-h-11 w-full items-center justify-center gap-1.5 border-t border-borda text-[13px] font-semibold text-tinta transition-colors hover:bg-superficie-2"
        >
          {aberto ? "Mostrar menos" : limite === 0 ? `Ver os ${exercicios.length} exercícios` : `Ver treino completo (+${escondidos})`}
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className={`transition-transform duration-200 ${aberto ? "rotate-180" : ""}`}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      )}
    </section>
  );
}

function IconeHalter() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11" />
    </svg>
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
        <div role="menu" className="absolute right-0 top-11 z-20 w-40 origin-top-right animate-surgir overflow-hidden rounded-xl border border-borda bg-elevado py-1 shadow-lg shadow-black/10">
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

/**
 * O post é um cartão, na ordem em que se lê: quem postou, a foto de ponta a
 * ponta, o texto, o treino e, no rodapé, as duas ações (Tamo junto e Comentar).
 */
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
  const [confirmandoApagar, setConfirmandoApagar] = useState(false);

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

  const nivel = post.autor.nivel;
  return (
    <article className="overflow-hidden rounded-2xl border border-borda bg-elevado">
      <header className="flex items-center gap-3 px-4 pt-3.5">
        <Link href={`/u/${post.autor.username}`} className="shrink-0 rounded-full">
          <Avatar name={post.autor.name} avatarUrl={post.autor.avatar_url} patente={nivel} tamanho="n" />
        </Link>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="flex min-w-0 items-baseline gap-1.5">
            <Link href={`/u/${post.autor.username}`} className="truncate text-[15px] font-semibold hover:underline">
              {post.autor.name}
            </Link>
            {nivel && (
              <span className="shrink-0 text-xs font-bold" style={{ color: TEXTO_DA_PATENTE[nivel] }}>
                {nivel}
              </span>
            )}
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
        {souAutor && !editando && <MenuDoAutor onEditar={() => setEditando(true)} onApagar={() => setConfirmandoApagar(true)} desativado={salvando} />}
      </header>

      {post.imagem_url && (
        <div className={`mt-3 bg-superficie ${fotoCarregou ? "" : "aspect-square animate-brilho"}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={urlDaApi(post.imagem_url)}
            alt={`Foto do post de ${post.autor.name}`}
            loading="lazy"
            onLoad={() => setFotoCarregou(true)}
            className={`max-h-[420px] w-full object-cover transition-opacity duration-300 ${fotoCarregou ? "opacity-100" : "opacity-0"}`}
          />
        </div>
      )}

      <div className="flex flex-col gap-3 px-4 pt-3">
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

        {post.treino && <BlocoDoTreino exercicios={post.treino.exercicios} comFoto={Boolean(post.imagem_url)} />}

        {confirmandoApagar && (
          // Post de treino carrega progresso: avisa antes do que sai junto com ele.
          <div role="alertdialog" aria-labelledby={`apagar-${post.id}`} className="flex animate-surgir flex-col gap-3 rounded-xl border border-brasa/30 bg-brasa-fundo p-3">
            <div>
              <p id={`apagar-${post.id}`} className="text-[15px] font-bold">
                {post.treino ? "Apagar esse treino?" : "Apagar esse post?"}
              </p>
              <p className="mt-1 text-[13px] leading-snug">
                {post.treino
                  ? "Seu progresso vai junto: se for o único treino desse dia, o dia sai da granja e o frango perde a força que ganhou com ele."
                  : "Ele some do feed e não dá pra desfazer."}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Botao variante="contorno" onClick={() => setConfirmandoApagar(false)} disabled={salvando}>
                Manter
              </Botao>
              <Botao variante="contorno" onClick={apagar} disabled={salvando} className="border-brasa text-brasa hover:bg-elevado">
                {salvando ? "Apagando..." : "Apagar"}
              </Botao>
            </div>
          </div>
        )}

        {erro && <Erro>{erro}</Erro>}
      </div>

      {/* Rodapé: as duas ações dividem a largura, com alvo grande para o dedo */}
      <footer className="mt-3 grid grid-cols-2 gap-1 border-t border-borda p-1.5">
        <BotaoTamoJunto
          key={`${post.id}-${post.curtidas}`}
          postId={post.id}
          curtidasIniciais={post.curtidas}
          euCurtiInicial={post.eu_curti}
        />
        <Link
          href={`/posts/${post.id}`}
          aria-label={`Comentar. ${post.comentarios} ${post.comentarios === 1 ? "comentário" : "comentários"}`}
          className="flex min-h-11 items-center justify-center gap-2 rounded-xl text-[14px] font-medium text-suave transition-[background-color,color,transform] duration-150 hover:bg-superficie hover:text-tinta active:scale-[0.97]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 11.5a7.5 7.5 0 0 1-11.2 6.5L4 19.5l1.5-4.6A7.5 7.5 0 1 1 20 11.5z" />
          </svg>
          <span>Comentar</span>
          {post.comentarios > 0 && <span className="tabular-nums">{post.comentarios}</span>}
        </Link>
      </footer>
    </article>
  );
}
