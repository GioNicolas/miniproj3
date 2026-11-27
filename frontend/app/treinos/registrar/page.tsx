"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { Avatar } from "@/components/Avatar";
import { Botao } from "@/components/Botao";
import { Erro } from "@/components/Erro";
import { emSegundos, EscolherExercicio, trilhaDe } from "@/components/EscolherExercicio";
import { apiGet, apiPost, subirFotoDoPost, type Perfil, type Post } from "@/lib/api";
import { semanaAtual, useTreineiHoje } from "@/lib/dias";
import { useEu } from "@/lib/eu";
import { reduzirFoto } from "@/lib/foto";
import { GLOSSARIO } from "@/lib/glossario";
import { nomeDaProgressao, TRILHAS } from "@/lib/progressoes";

const LIMITE_TEXTO = 500;
const LIMITE_EXERCICIOS = 20; // o mesmo do backend

// Séries e reps ficam como texto (o Treino de hoje manda só as séries); viram int no envio.
type Linha = { progressao: string; series: string; reps: string };

function numero(valor: string): number | null {
  const n = Number.parseInt(valor, 10);
  return Number.isNaN(n) ? null : n;
}

function dose({ progressao, series, reps }: Linha): string {
  const s = numero(series);
  const r = numero(reps);
  const unidade = emSegundos(progressao) ? " s" : "";
  return s && r ? `${s}×${r}${unidade}` : s ? `${s} séries` : r ? `${r}${unidade || " reps"}` : "";
}

/** Texto do post quando a pessoa não escreve nada: "treino feito · barra australiana 3×8". */
function textoPadrao(exercicios: Linha[]): string {
  const feitos = exercicios
    .filter((l) => l.progressao)
    .map((l) => [nomeDaProgressao(l.progressao).toLowerCase(), dose(l)].filter(Boolean).join(" "));
  return feitos.length ? `treino feito · ${feitos.join(", ")}` : "treino feito";
}

/** Quantos dias a pessoa já treinou nesta semana; null enquanto carrega ou se falhar. */
function useDiasNaSemana(): number | null {
  const eu = useEu();
  const [dias, setDias] = useState<number | null>(null);
  useEffect(() => {
    if (!eu) return;
    const semana = semanaAtual();
    apiGet<{ dias: string[] }>(`/usuarios/${eu.username}/treinos?dias=7`)
      .then(({ dias }) => setDias(semana.filter((d) => dias.includes(d)).length))
      .catch(() => setDias(null));
  }, [eu]);
  return dias;
}

/** Força do frango antes de registrar, para a tela de treino registrado mostrar quanto subiu. */
function useForcaAntes(): number | null {
  const eu = useEu();
  const [forca, setForca] = useState<number | null>(null);
  useEffect(() => {
    if (!eu) return;
    apiGet<Perfil>(`/usuarios/${eu.username}`)
      .then((p) => setForca(p.frango.forca))
      .catch(() => setForca(null));
  }, [eu]);
  return forca;
}

type Tipo = "treino" | "post";

const TIPOS: { id: Tipo; rotulo: string }[] = [
  { id: "treino", rotulo: "Treinei hoje" },
  { id: "post", rotulo: "Só um post" },
];

/** Foto opcional: nunca obrigatória (DECISIONS, decisão 2). Reduzida no celular antes de subir. */
function EscolherFoto({ foto, aoEscolher, preparando, aoPreparar, desativado }: {
  foto: Blob | null;
  aoEscolher: (f: Blob | null) => void;
  preparando: boolean;
  aoPreparar: (preparando: boolean) => void;
  desativado: boolean;
}) {
  const entrada = useRef<HTMLInputElement>(null);
  const [erro, setErro] = useState<string | null>(null);
  const previa = useMemo(() => (foto ? URL.createObjectURL(foto) : null), [foto]);
  useEffect(
    () => () => {
      if (previa) URL.revokeObjectURL(previa);
    },
    [previa]
  );

  async function escolher(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    e.target.value = "";
    if (!arquivo || desativado || preparando) return;
    setErro(null);
    aoPreparar(true);
    try {
      aoEscolher(await reduzirFoto(arquivo));
    } catch {
      setErro("não deu para abrir essa foto, tenta outra");
    } finally {
      aoPreparar(false);
    }
  }

  return (
    <div className="px-4 pb-4">
      <input ref={entrada} type="file" accept="image/*" onChange={escolher} disabled={desativado || preparando} className="hidden" aria-hidden="true" tabIndex={-1} />
      {previa ? (
        <div className="relative animate-surgir overflow-hidden rounded-xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previa} alt="Prévia da foto do post" className="max-h-80 w-full object-cover" />
          <button
            type="button"
            onClick={() => aoEscolher(null)}
            disabled={desativado || preparando}
            aria-label="Tirar a foto"
            className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur transition-transform active:scale-90"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => entrada.current?.click()}
          disabled={desativado || preparando}
          className="flex min-h-11 items-center gap-2 rounded-full border border-borda-forte px-4 text-[13px] font-semibold text-tinta transition-[background-color,transform] duration-150 hover:bg-superficie-2 active:scale-95 disabled:opacity-60"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
            <circle cx="12" cy="13" r="3.5" />
          </svg>
          {preparando ? "Preparando a foto…" : "Adicionar foto"}
          <span className="font-normal text-suave">(opcional)</span>
        </button>
      )}
      {erro && (
        <p role="alert" className="mt-2 text-xs text-brasa">
          {erro}
        </p>
      )}
    </div>
  );
}

export default function RegistrarTreinoPage() {
  const router = useRouter();
  const eu = useEu();
  const diasNaSemana = useDiasNaSemana();
  const treineiHoje = useTreineiHoje();
  const forcaAntes = useForcaAntes();
  const [postId, setPostId] = useState<number | null>(null);

  // Treino vai para a tela de treino registrado (força, sequência, granja); post solto, para o feed.
  function irDepoisDePublicar(id: number) {
    if (tipo !== "treino") return router.push("/");
    const antes = forcaAntes === null ? "" : `&antes=${forcaAntes}`;
    router.push(`/treinos/registrado?post=${id}${antes}`);
  }
  const [tipo, setTipo] = useState<Tipo>("treino");
  const [foto, setFoto] = useState<Blob | null>(null);
  const [preparandoFoto, setPreparandoFoto] = useState(false);
  const [publicado, setPublicado] = useState(false);
  const [texto, setTexto] = useState("");
  // No treino o texto é opcional: com uma mão e suado, registrar o dia basta.
  // O backend exige texto, então vai um resumo do treino no lugar.
  const podeEnviar = tipo === "treino" || texto.trim().length > 0;
  const [exercicios, setExercicios] = useState<Linha[]>([]);
  // null: gaveta fechada; indice null: exercício novo; número: editando aquele exercício
  const [gaveta, setGaveta] = useState<{ indice: number | null } | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Vindo do Treino de hoje (/treinos?...): ?ex=barra_australiana:3,flexao:2 já preenche
  // os exercícios com as séries que a pessoa marcou.
  useEffect(() => {
    const busca = new URLSearchParams(window.location.search);
    if (busca.get("tipo") === "post") setTipo("post");
    const ex = busca.get("ex");
    if (!ex) return;
    const codigos = new Set(TRILHAS.flatMap((t) => t.progressoes.map((p) => p.codigo)));
    const vindos = ex
      .split(",")
      .map((item) => item.split(":"))
      .filter(([codigo]) => codigos.has(codigo))
      .slice(0, LIMITE_EXERCICIOS)
      .map(([codigo, series, reps]) => ({ progressao: codigo, series: series ?? "", reps: reps ?? "" }));
    if (vindos.length) setExercicios(vindos);
  }, []);

  async function registrar(e: React.FormEvent) {
    e.preventDefault();
    if (enviando || publicado || preparandoFoto || !podeEnviar) return;
    setErro(null);
    setEnviando(true);
    let post: Post;
    try {
      // Treino sem exercício também conta o dia; "Só um post" não conta.
      post =
        tipo === "treino"
          ? await apiPost<Post>("/treinos", {
              texto: texto.trim() || textoPadrao(exercicios),
              exercicios: exercicios.map((l) => ({ progressao: l.progressao, series: numero(l.series), reps: numero(l.reps) })),
            })
          : await apiPost<Post>("/posts", { texto });
    } catch (err) {
      setErro(err instanceof Error ? err.message : "não deu para publicar");
      setEnviando(false);
      return;
    }
    setPublicado(true);
    setPostId(post.id);
    if (foto) {
      try {
        await subirFotoDoPost(post.id, foto);
      } catch (err) {
        // o post já saiu: avisa em vez de fingir que nada aconteceu
        setErro(`O post saiu, mas a foto não subiu: ${err instanceof Error ? err.message : "erro"}.`);
        setEnviando(false);
        return;
      }
    }
    irDepoisDePublicar(post.id);
  }

  return (
    <form onSubmit={registrar} className="flex flex-col gap-4">
      <header className="-ml-3 flex items-start gap-1 pt-2">
        <Link href="/" aria-label="Fechar sem registrar" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full hover:bg-superficie">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </Link>
        <div>
          {/* o título diz a ação da tela: registrar o treino; o post no feed é consequência */}
          <h1 className="flex min-h-11 items-center font-titulo text-[22px]">{tipo === "treino" ? "Registrar treino" : "Novo post"}</h1>
          <p className="mt-1 text-[13px] text-suave">
            {tipo === "treino" ? "Vai pro feed como post. Texto e foto são opcionais." : "Aparece no feed, sem contar dia na granja."}
          </p>
        </div>
      </header>

      <div role="tablist" aria-label="O que publicar" className="relative grid grid-cols-2 gap-1 rounded-[10px] bg-superficie p-1">
        <span
          aria-hidden="true"
          className={`absolute inset-y-1 left-1 w-[calc(50%-6px)] rounded-lg bg-elevado transition-transform duration-300 ease-saida ${
            tipo === "post" ? "translate-x-[calc(100%+4px)]" : ""
          }`}
        />
        {TIPOS.map(({ id, rotulo }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tipo === id}
            onClick={() => setTipo(id)}
            className={`relative min-h-11 rounded-lg text-sm transition-colors duration-200 ${
              tipo === id ? "font-semibold text-tinta" : "font-medium text-suave hover:text-tinta"
            }`}
          >
            {rotulo}
          </button>
        ))}
      </div>

      {/* Prévia: o post já no formato em que vai aparecer no feed */}
      <article aria-label="Prévia do post" className="flex flex-col overflow-hidden rounded-2xl bg-superficie">
        <div className="flex items-center gap-3 px-3.5 pb-3 pt-3.5">
          <Avatar name={eu?.name ?? ""} avatarUrl={eu?.avatar_url ?? ""} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-semibold">{eu?.name ?? "…"}</p>
            <p className="mt-0.5 text-xs text-suave">{eu ? `@${eu.username} · agora` : "agora"}</p>
          </div>
        </div>

        {tipo === "treino" && (
        <div className="mx-3.5 flex animate-surgir flex-col gap-2 rounded-xl bg-superficie-2 px-4 py-3">
          <div className="flex items-baseline justify-between text-xs text-suave">
            <span>Treino de hoje</span>
            <span>
              <span className="font-bold text-tinta">{exercicios.length}</span>{" "}
              {exercicios.length === 1 ? "exercício" : "exercícios"}
            </span>
          </div>

          {exercicios.length > 0 ? (
            <ul aria-label="Exercícios do treino" className="flex flex-col gap-1.5">
              {exercicios.map((l, i) => (
                <li key={i} className="animate-entrar">
                  <button
                    type="button"
                    onClick={() => setGaveta({ indice: i })}
                    aria-label={`${nomeDaProgressao(l.progressao)}, ${dose(l) || "sem dose"}. Toque para editar`}
                    className="flex min-h-14 w-full items-center gap-3 rounded-xl bg-elevado px-3.5 py-2 text-left transition-transform duration-150 active:scale-[0.98]"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block text-[11px] font-semibold uppercase tracking-wider text-suave">{trilhaDe(l.progressao)}</span>
                      <span className="block truncate text-[15px] font-semibold text-tinta">{nomeDaProgressao(l.progressao)}</span>
                    </span>
                    {dose(l) && <span className="shrink-0 rounded-lg bg-superficie-2 px-2.5 py-1 text-sm font-bold tabular-nums">{dose(l)}</span>}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0 text-suave">
                      <path d="M9 6l6 6-6 6" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[13px] text-pretty text-suave">Nenhum exercício ainda. Treino sem exercício também conta o dia.</p>
          )}

          {exercicios.length < LIMITE_EXERCICIOS && (
            <button
              type="button"
              onClick={() => setGaveta({ indice: null })}
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-borda-forte text-sm font-semibold text-tinta transition-[background-color,transform] duration-150 hover:bg-superficie active:scale-[0.98]"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Adicionar exercício
            </button>
          )}
        </div>
        )}

        <label className="block px-4 pb-3 pt-3">
          <span className="sr-only">Texto do post</span>
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            maxLength={LIMITE_TEXTO}
            rows={3}
            placeholder={tipo === "treino" ? "Como foi o treino? (opcional)" : "O que você quer contar?"}
            className="w-full resize-none border-0 border-b border-borda-forte bg-transparent px-0 pb-2 pt-1 text-base leading-[1.55] text-tinta outline-none placeholder:text-suave focus:border-tinta md:text-sm"
          />
        </label>

        <EscolherFoto
          foto={foto}
          aoEscolher={setFoto}
          preparando={preparandoFoto}
          aoPreparar={setPreparandoFoto}
          desativado={enviando || publicado}
        />
      </article>

      {gaveta && (
        <EscolherExercicio
          inicial={
            gaveta.indice === null
              ? null
              : (() => {
                  const l = exercicios[gaveta.indice];
                  return { progressao: l.progressao, series: numero(l.series) ?? 3, reps: numero(l.reps) ?? (emSegundos(l.progressao) ? 20 : 8) };
                })()
          }
          noTreino={exercicios.map((l) => l.progressao)}
          aoFechar={() => setGaveta(null)}
          aoSalvar={({ progressao, series, reps }) => {
            const linha = { progressao, series: String(series), reps: String(reps) };
            setExercicios((atuais) => (gaveta.indice === null ? [...atuais, linha] : atuais.map((l, j) => (j === gaveta.indice ? linha : l))));
            setGaveta(null);
          }}
          aoTirar={
            gaveta.indice === null
              ? undefined
              : () => {
                  setExercicios((atuais) => atuais.filter((_, j) => j !== gaveta.indice));
                  setGaveta(null);
                }
          }
        />
      )}

      {erro && <Erro>{erro}</Erro>}

      {/* rodapé com o botão preso embaixo, como em Treinos: nunca fica abaixo da dobra */}
      <div className="sticky bottom-[calc(4.25rem+max(1rem,env(safe-area-inset-bottom)))] z-10 -mx-5 flex flex-col gap-2 border-t border-borda bg-fundo px-5 py-3 md:bottom-0 md:mx-0 md:px-0">
        <p className="text-center text-xs text-balance text-suave">
          {!podeEnviar
            ? "Escreve algo no post pra liberar."
            : tipo === "post"
              ? "Post sem treino: aparece no feed, mas não conta dia na granja."
              : treineiHoje
                ? "Hoje já contou: esse treino vai pro feed, mas não soma força nem dia na granja."
                : `Vale 1 dia na granja e +10 de força${diasNaSemana !== null ? `. Essa semana você treinou ${diasNaSemana} ${diasNaSemana === 1 ? "dia" : "dias"} até agora.` : "."}`}
        </p>
        {publicado && !enviando ? (
          <Botao onClick={() => (postId === null ? router.push("/") : irDepoisDePublicar(postId))} className="w-full">
            {tipo === "treino" ? "Continuar" : "Ver no feed"}
          </Botao>
        ) : (
          <Botao type="submit" disabled={enviando || publicado || preparandoFoto || !podeEnviar} className="w-full">
            {enviando ? "Publicando..." : tipo === "treino" ? GLOSSARIO.registrarTreino : "Postar"}
          </Botao>
        )}
      </div>
    </form>
  );
}
