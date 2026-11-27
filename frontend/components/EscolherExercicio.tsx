"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { Botao } from "@/components/Botao";
import { apiGet, type Arvore, type EstadoDaSkill } from "@/lib/api";
import { metaDa, nomeDaProgressao, TRILHAS } from "@/lib/progressoes";

// Exercícios de segurar contam em segundos. A lista e a dose padrão vêm das metas
// de lib/progressoes.ts, a mesma fonte de Treinos e da Árvore.
export function emSegundos(codigo: string): boolean {
  return metaDa(codigo).segundos ?? false;
}

export function trilhaDe(codigo: string): string {
  return TRILHAS.find((t) => t.progressoes.some((p) => p.codigo === codigo))?.nome ?? "";
}

export type Escolha = { progressao: string; series: number; reps: number };

const SERIES_PADRAO = 3;
const ATALHOS = { reps: [5, 8, 10, 12], segundos: [10, 20, 30, 45] };

// A árvore muda pouco enquanto a pessoa registra: busca uma vez por visita à tela.
let arvoreEmCache: Promise<Map<string, EstadoDaSkill>> | null = null;
function estadosDaArvore(): Promise<Map<string, EstadoDaSkill>> {
  arvoreEmCache ??= apiGet<Arvore>("/progressoes")
    .then((a) => new Map(a.progressoes.map((p) => [p.codigo, p.estado] as const)))
    .catch(() => {
      arvoreEmCache = null;
      return new Map();
    });
  return arvoreEmCache;
}

const ROTULO_DO_ESTADO: Record<EstadoDaSkill, string> = {
  dominada: "Dominada",
  disponivel: "Seu próximo passo",
  bloqueada: "Mais pra frente",
};

function Contador({ rotulo, valor, minimo, maximo, atalhos, aoMudar }: {
  rotulo: string;
  valor: number;
  minimo: number;
  maximo: number;
  atalhos: number[];
  aoMudar: (n: number) => void;
}) {
  const limitar = (n: number) => Math.min(maximo, Math.max(minimo, n));
  const botao =
    "flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-borda-forte bg-elevado text-tinta transition-transform duration-150 active:scale-90 disabled:opacity-40 disabled:active:scale-100";
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-superficie p-4">
      <span className="text-xs font-semibold uppercase tracking-wider text-suave">{rotulo}</span>
      <div className="flex items-center justify-between">
        <button type="button" onClick={() => aoMudar(limitar(valor - 1))} disabled={valor <= minimo} aria-label={`Menos ${rotulo.toLowerCase()}`} className={botao}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            <path d="M5 12h14" />
          </svg>
        </button>
        <output aria-live="polite" className="font-titulo text-[34px] leading-none tabular-nums md:text-[30px]">
          {valor}
        </output>
        <button type="button" onClick={() => aoMudar(limitar(valor + 1))} disabled={valor >= maximo} aria-label={`Mais ${rotulo.toLowerCase()}`} className={botao}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>
      {atalhos.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {atalhos.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => aoMudar(n)}
              aria-pressed={valor === n}
              className={`min-h-10 rounded-full text-sm font-semibold tabular-nums transition-colors ${
                valor === n ? "bg-tinta text-fundo" : "border border-borda bg-elevado text-tinta hover:border-borda-forte"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Gaveta que sobe de baixo para escolher um exercício e a dose. Substitui o <select>,
 * que no celular abria a lista nativa com as 20 progressões misturadas.
 * Com `inicial`, abre direto na dose, para editar um exercício que já está no treino.
 */
export function EscolherExercicio({ inicial, noTreino, aoSalvar, aoTirar, aoFechar }: {
  inicial: Escolha | null;
  noTreino: string[];
  aoSalvar: (e: Escolha) => void;
  aoTirar?: () => void;
  aoFechar: () => void;
}) {
  const painel = useRef<HTMLDivElement>(null);
  const fechar = useRef(aoFechar);
  fechar.current = aoFechar;
  const [estados, setEstados] = useState<Map<string, EstadoDaSkill>>(new Map());
  const [codigo, setCodigo] = useState<string | null>(inicial?.progressao ?? null);
  const [trilha, setTrilha] = useState(inicial ? trilhaDe(inicial.progressao) : TRILHAS[0].nome);
  const [series, setSeries] = useState(inicial?.series ?? SERIES_PADRAO);
  const [reps, setReps] = useState(inicial?.reps ?? 8);

  useEffect(() => {
    let vivo = true;
    estadosDaArvore().then((m) => vivo && setEstados(m));
    return () => {
      vivo = false;
    };
  }, []);

  // A página de trás não rola, Esc fecha e o foco entra na gaveta.
  useEffect(() => {
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    painel.current?.focus();
    const tecla = (e: KeyboardEvent) => e.key === "Escape" && fechar.current();
    window.addEventListener("keydown", tecla);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", tecla);
    };
  }, []);

  function escolher(c: string) {
    setCodigo(c);
    // começa na dose do treino de hoje (ex.: australiana 3×8, prancha 3×30 s)
    const [s, r] = metaDa(c).treino;
    setSeries(s);
    setReps(r);
    painel.current?.scrollTo({ top: 0 });
  }

  const progressoes = TRILHAS.find((t) => t.nome === trilha)?.progressoes ?? [];
  const segundos = codigo ? emSegundos(codigo) : false;
  const degrau = codigo ? TRILHAS.find((t) => t.nome === trilhaDe(codigo))!.progressoes.findIndex((p) => p.codigo === codigo) + 1 : 0;

  return createPortal(
    <div role="dialog" aria-modal="true" aria-labelledby="titulo-da-gaveta" className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
      <div aria-hidden="true" onClick={aoFechar} className="absolute inset-0 animate-aparecer bg-black/45" />
      <div
        ref={painel}
        tabIndex={-1}
        // janela no centro da tela, no celular e no computador, sem rolagem lateral
        className="relative flex max-h-[85dvh] w-full max-w-md animate-surgir flex-col overflow-y-auto overflow-x-hidden overscroll-contain rounded-3xl bg-fundo px-5 pb-5 shadow-[0_16px_48px_rgba(20,20,20,0.22)] outline-none"
      >
        <div className="sticky top-0 z-10 -mx-5 flex items-center justify-between bg-fundo px-3 pb-2 pt-2">
          {codigo && !inicial ? (
            <button type="button" onClick={() => setCodigo(null)} className="flex min-h-11 items-center gap-1 rounded-full px-2 text-sm font-semibold text-tinta hover:bg-superficie">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M15 6l-6 6 6 6" />
              </svg>
              Trocar exercício
            </button>
          ) : (
            <span aria-hidden="true" />
          )}
          <button type="button" onClick={aoFechar} aria-label="Fechar" className="flex h-11 w-11 items-center justify-center rounded-full text-suave hover:bg-superficie hover:text-tinta">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {!codigo ? (
          <div key="lista" className="flex animate-entrar flex-col gap-4">
            <div>
              <h2 id="titulo-da-gaveta" className="font-titulo text-[20px] leading-tight md:text-[18px]">
                Qual exercício?
              </h2>
              <p className="mt-1 text-[13px] text-suave">Cada trilha é uma escada: de cima para baixo, do mais fácil ao mais difícil.</p>
            </div>

            <div role="tablist" aria-label="Trilha" className="grid grid-cols-4 gap-1 rounded-xl bg-superficie p-1">
              {TRILHAS.map((t) => (
                <button
                  key={t.nome}
                  type="button"
                  role="tab"
                  aria-selected={trilha === t.nome}
                  onClick={() => setTrilha(t.nome)}
                  className={`min-h-10 rounded-lg text-[13px] transition-colors duration-200 ${
                    trilha === t.nome ? "bg-elevado font-semibold text-tinta shadow-sm" : "font-medium text-suave hover:text-tinta"
                  }`}
                >
                  {t.nome}
                </button>
              ))}
            </div>

            <ol key={trilha} aria-label={`Progressões de ${trilha}`} className="relative flex flex-col gap-1.5">
              <span aria-hidden="true" className="absolute bottom-7 left-[29px] top-7 w-0.5 bg-borda" />
              {progressoes.map((p, i) => {
                const estado = estados.get(p.codigo);
                const proximo = estado === "disponivel";
                const jaTem = noTreino.includes(p.codigo);
                return (
                  <li key={p.codigo} className="animate-entrar" style={{ animationDelay: `${i * 30}ms` }}>
                    <button
                      type="button"
                      onClick={() => escolher(p.codigo)}
                      className={`relative flex min-h-[60px] w-full items-center gap-3 rounded-2xl px-3 text-left transition-[background-color,transform] duration-150 active:scale-[0.98] ${
                        proximo ? "border border-borda-forte bg-elevado" : "border border-transparent hover:bg-superficie"
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                          estado === "dominada"
                            ? "bg-folha text-sobre-destaque"
                            : proximo
                              ? "bg-tinta text-fundo"
                              : "border border-borda bg-superficie-2 text-suave"
                        }`}
                      >
                        {estado === "dominada" ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12.5l4.5 4.5L19 7.5" />
                          </svg>
                        ) : (
                          i + 1
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={`block truncate text-[15px] font-semibold ${estado === "bloqueada" ? "text-suave" : "text-tinta"}`}>{p.nome}</span>
                        {estado && (
                          <span className={`mt-0.5 block text-xs ${estado === "dominada" ? "text-folha" : proximo ? "font-semibold text-tinta" : "text-suave"}`}>
                            {ROTULO_DO_ESTADO[estado]}
                          </span>
                        )}
                      </span>
                      {jaTem && <span className="shrink-0 rounded-full bg-ceu-fundo px-2.5 py-1 text-[11px] font-semibold text-ceu">No treino</span>}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0 text-suave">
                        <path d="M9 6l6 6-6 6" />
                      </svg>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
        ) : (
          <div key="dose" className="flex animate-entrar flex-col gap-3">
            <div className="mb-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-suave">
                {trilhaDe(codigo)} · degrau {degrau}
              </p>
              <h2 id="titulo-da-gaveta" className="mt-1 font-titulo text-[21px] leading-tight md:text-[19px]">
                {nomeDaProgressao(codigo)}
              </h2>
            </div>

            <Contador rotulo="Séries" valor={series} minimo={1} maximo={100} atalhos={[]} aoMudar={setSeries} />
            <Contador
              rotulo={segundos ? "Segundos por série" : "Reps por série"}
              valor={reps}
              minimo={1}
              maximo={1000}
              atalhos={segundos ? ATALHOS.segundos : ATALHOS.reps}
              aoMudar={setReps}
            />

            <Botao onClick={() => aoSalvar({ progressao: codigo, series, reps })} className="mt-2 w-full md:text-[15px]">
              {inicial ? "Salvar" : "Adicionar"} {series}×{reps}
              {segundos ? " s" : ""}
            </Botao>
            {aoTirar && (
              <button type="button" onClick={aoTirar} className="min-h-11 rounded-xl text-sm font-semibold text-brasa hover:bg-brasa-fundo">
                Tirar do treino
              </button>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
