"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Avatar } from "@/components/Avatar";
import { Botao } from "@/components/Botao";
import { Erro } from "@/components/Erro";
import { apiGet, apiPost, type Post } from "@/lib/api";
import { useEu } from "@/lib/eu";
import { GLOSSARIO } from "@/lib/glossario";
import { nomeDaProgressao, TRILHAS } from "@/lib/progressoes";

const LIMITE_TEXTO = 500;
const LIMITE_EXERCICIOS = 20; // o mesmo do backend

// Os números ficam como texto enquanto a pessoa digita; viram int só no envio.
type Linha = { progressao: string; series: string; reps: string };
const LINHA_VAZIA: Linha = { progressao: "", series: "", reps: "" };

// appearance-none: sem isso o Safari desenha o select e as setinhas do número do jeito dele.
const ESTILO_CAMPO =
  "min-h-12 w-full appearance-none rounded-[10px] border border-borda-forte bg-fundo px-4 text-base font-normal text-tinta outline-none [&::-webkit-inner-spin-button]:appearance-none focus-visible:ring-2 focus-visible:ring-destaque focus-visible:ring-offset-2 focus-visible:ring-offset-superficie-2";

function diaIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Os 7 dias desta semana, de segunda a domingo: a mesma semana da Granja. */
function semanaAtual(): string[] {
  const hoje = new Date();
  const segunda = new Date(hoje);
  segunda.setDate(hoje.getDate() - ((hoje.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const dia = new Date(segunda);
    dia.setDate(segunda.getDate() + i);
    return diaIso(dia);
  });
}

function numero(valor: string): number | null {
  const n = Number.parseInt(valor, 10);
  return Number.isNaN(n) ? null : n;
}

function dose({ series, reps }: Linha): string {
  const s = numero(series);
  const r = numero(reps);
  return s && r ? `${s}×${r}` : s ? `${s} séries` : r ? `${r} reps` : "";
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

/** Linha de inclusão de um exercício: progressão, séries e reps. */
function NovoExercicio({ aoIncluir, aoCancelar }: { aoIncluir: (l: Linha) => void; aoCancelar: () => void }) {
  const [linha, setLinha] = useState<Linha>({ ...LINHA_VAZIA });
  const mudar = (campo: keyof Linha, valor: string) => setLinha((l) => ({ ...l, [campo]: valor }));

  return (
    <div className="flex flex-col gap-3 border-t border-borda pt-3">
      <span className="relative flex">
        <select
          aria-label="Progressão"
          value={linha.progressao}
          onChange={(e) => mudar("progressao", e.target.value)}
          className={`${ESTILO_CAMPO} pr-10`}
        >
          <option value="">Escolhe a progressão</option>
          {TRILHAS.map((trilha) => (
            <optgroup key={trilha.nome} label={trilha.nome}>
              {trilha.progressoes.map((p) => (
                <option key={p.codigo} value={p.codigo}>
                  {p.nome}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-suave">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </span>
      <div className="flex gap-2">
        <label className="flex flex-1 flex-col gap-1 text-xs font-medium text-suave">
          Séries
          <input type="number" inputMode="numeric" min={1} max={100} value={linha.series} onChange={(e) => mudar("series", e.target.value)} className={ESTILO_CAMPO} />
        </label>
        <label className="flex flex-1 flex-col gap-1 text-xs font-medium text-suave">
          Reps (ou segundos)
          <input type="number" inputMode="numeric" min={1} max={1000} value={linha.reps} onChange={(e) => mudar("reps", e.target.value)} className={ESTILO_CAMPO} />
        </label>
      </div>
      <div className="flex justify-end gap-2">
        <Botao variante="contorno" onClick={aoCancelar}>
          Cancelar
        </Botao>
        <Botao variante="escuro" disabled={!linha.progressao} onClick={() => aoIncluir(linha)}>
          Incluir
        </Botao>
      </div>
    </div>
  );
}

export default function RegistrarTreinoPage() {
  const router = useRouter();
  const eu = useEu();
  const diasNaSemana = useDiasNaSemana();
  const [texto, setTexto] = useState("");
  const [exercicios, setExercicios] = useState<Linha[]>([]);
  const [incluindo, setIncluindo] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function registrar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      // Treino sem exercício também conta o dia.
      await apiPost<Post>("/treinos", {
        texto,
        exercicios: exercicios.map((l) => ({ progressao: l.progressao, series: numero(l.series), reps: numero(l.reps) })),
      });
      router.push("/");
    } catch (err) {
      setErro(err instanceof Error ? err.message : "não deu para registrar o treino");
      setEnviando(false);
    }
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
          <h1 className="flex min-h-11 items-center font-titulo text-[22px]">Seu post no feed</h1>
          <p className="mt-1 text-[13px] text-suave">Ajusta o que quiser antes de registrar</p>
        </div>
      </header>

      {/* Prévia: o post já no formato em que vai aparecer no feed */}
      <article aria-label="Prévia do post" className="flex flex-col overflow-hidden rounded-2xl bg-superficie">
        <div className="flex items-center gap-3 px-3.5 pb-3 pt-3.5">
          <Avatar name={eu?.name ?? ""} avatarUrl={eu?.avatar_url ?? ""} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-semibold">{eu?.name ?? "…"}</p>
            <p className="mt-0.5 text-xs text-suave">{eu ? `@${eu.username} · agora` : "agora"}</p>
          </div>
        </div>

        <div className="mx-3.5 flex flex-col gap-2 rounded-xl bg-superficie-2 px-4 py-3">
          <div className="flex items-baseline justify-between text-xs text-suave">
            <span>Treino de hoje</span>
            <span>
              <span className="font-bold text-tinta">{exercicios.length}</span>{" "}
              {exercicios.length === 1 ? "exercício" : "exercícios"}
            </span>
          </div>

          {exercicios.length > 0 ? (
            <ul aria-label="Exercícios do treino" className="flex flex-col">
              {exercicios.map((l, i) => (
                <li key={i} className="flex min-h-11 items-center justify-between gap-2 text-sm">
                  <span className="min-w-0 truncate font-semibold">
                    {nomeDaProgressao(l.progressao)} <span className="font-normal text-suave">{dose(l)}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setExercicios((atuais) => atuais.filter((_, j) => j !== i))}
                    aria-label={`Tirar ${nomeDaProgressao(l.progressao)}`}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-suave hover:text-brasa"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                      <path d="M6 6l12 12M18 6L6 18" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            !incluindo && <p className="text-[13px] text-pretty text-suave">Nenhum exercício ainda. Treino sem exercício também conta o dia.</p>
          )}

          {incluindo ? (
            <NovoExercicio
              aoCancelar={() => setIncluindo(false)}
              aoIncluir={(l) => {
                setExercicios((atuais) => [...atuais, l]);
                setIncluindo(false);
              }}
            />
          ) : (
            exercicios.length < LIMITE_EXERCICIOS && (
              <button type="button" onClick={() => setIncluindo(true)} className="flex min-h-11 items-center self-start text-[13px] font-semibold text-ceu hover:underline">
                + Incluir exercício
              </button>
            )
          )}
        </div>

        <label className="block px-4 pb-4 pt-3">
          <span className="sr-only">Texto do post</span>
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            maxLength={LIMITE_TEXTO}
            rows={3}
            placeholder="escreve algo pro post"
            className="w-full resize-none border-0 border-b border-borda-forte bg-transparent px-0 pb-2 pt-1 text-sm leading-[1.55] text-tinta outline-none placeholder:text-suave focus:border-tinta"
          />
        </label>
      </article>

      {erro && <Erro>{erro}</Erro>}

      <div className="flex flex-col gap-2 border-t border-borda pt-3">
        <p className="text-center text-xs text-balance text-suave">
          {texto.trim()
            ? `Vale 1 dia na granja e +10 de força${diasNaSemana !== null ? `. Essa semana você treinou ${diasNaSemana} ${diasNaSemana === 1 ? "dia" : "dias"} até agora.` : "."}`
            : "Escreve algo no post pra liberar o registro."}
        </p>
        <Botao type="submit" disabled={enviando || !texto.trim()} className="w-full">
          {enviando ? "Registrando..." : GLOSSARIO.registrarTreino}
        </Botao>
      </div>
    </form>
  );
}
