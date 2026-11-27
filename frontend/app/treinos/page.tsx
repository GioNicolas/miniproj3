"use client";

// Aba Treinos: o treino de hoje e a árvore de progressões (#10), no desenho do canvas.
// O treino de hoje é o próximo passo liberado de cada trilha (o "disponível" da árvore).

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { Carregando } from "@/components/Carregando";
import { Erro } from "@/components/Erro";
import { EstadoVazio } from "@/components/EstadoVazio";
import { apiDelete, apiGet, apiPatch, apiPost, type Arvore, type Equipamento, type SkillNaArvore as Progressao } from "@/lib/api";
import { GLOSSARIO } from "@/lib/glossario";
import { EQUIPAMENTOS, metaDa, textoDaDose, textoDaSerie } from "@/lib/progressoes";

const TRILHAS = ["Puxar", "Empurrar", "Pernas", "Core"];
const NOME_DO_EQUIPAMENTO = Object.fromEntries(EQUIPAMENTOS.map((e) => [e.codigo, e.nome.toLowerCase()]));

function Segmentado<T extends string>({
  opcoes,
  valor,
  aoMudar,
  rotulo,
}: {
  opcoes: { id: T; nome: string }[];
  valor: T;
  aoMudar: (v: T) => void;
  rotulo: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={rotulo}
      className="grid gap-1 rounded-[10px] bg-superficie p-1"
      style={{ gridTemplateColumns: `repeat(${opcoes.length}, minmax(0, 1fr))` }}
    >
      {opcoes.map((o) => (
        <button
          key={o.id}
          type="button"
          role="tab"
          aria-selected={valor === o.id}
          onClick={() => aoMudar(o.id)}
          className={`min-h-11 rounded-lg text-sm transition-colors ${
            valor === o.id ? "bg-elevado font-semibold text-tinta" : "font-medium text-suave hover:text-tinta"
          }`}
        >
          {o.nome}
        </button>
      ))}
    </div>
  );
}

/** Um exercício do treino de hoje: número, nome, a dose (3×8) e as séries para marcar. */
function Exercicio({ p, ordem, feitas, aoMarcar }: { p: Progressao; ordem: number; feitas: number; aoMarcar: (n: number) => void }) {
  const { treino, segundos } = metaDa(p.codigo);
  const [series, reps] = treino;
  const completo = feitas >= series;
  return (
    <article aria-label={p.nome} className="flex flex-col gap-3 rounded-[14px] bg-superficie p-4">
      <div className="flex items-center gap-3">
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold tabular-nums ${
            completo ? "bg-destaque-fundo text-destaque" : "bg-elevado"
          }`}
        >
          {completo ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
          ) : (
            ordem
          )}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[15px] font-semibold">{p.nome}</h3>
          <p className="text-xs text-suave">{p.trilha}</p>
        </div>
        <span className="shrink-0 text-[17px] font-bold tabular-nums">{textoDaDose(treino, segundos)}</span>
      </div>
      <div role="group" aria-label={`Séries de ${p.nome}`} className="grid grid-cols-3 gap-2">
        {Array.from({ length: series }, (_, k) => {
          const feita = k < feitas;
          return (
            <button
              key={k}
              type="button"
              aria-pressed={feita}
              aria-label={`Série ${k + 1}: ${textoDaSerie(reps, segundos)}`}
              onClick={() => aoMarcar(feita ? k : k + 1)}
              className={`flex min-h-11 items-center justify-center gap-2 rounded-lg border text-[13px] font-semibold ${
                feita ? "border-destaque-fundo bg-destaque-fundo text-destaque" : "border-borda-forte bg-superficie-2 text-tinta"
              }`}
            >
              {feita && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
              )}
              {textoDaSerie(reps, segundos)}
            </button>
          );
        })}
      </div>
    </article>
  );
}

type Series = Record<string, number>;

function TreinoDeHoje({
  arvore,
  series,
  setSeries,
  aoVerArvore,
}: {
  arvore: Arvore;
  series: Series;
  setSeries: React.Dispatch<React.SetStateAction<Series>>;
  aoVerArvore: () => void;
}) {
  // O próximo passo liberado de cada trilha entra no treino.
  const hoje = TRILHAS.map((t) => arvore.progressoes.find((p) => p.trilha === t && p.estado === "disponivel")).filter(
    (p): p is Progressao => Boolean(p)
  );
  const feitas = hoje.reduce((soma, p) => soma + (series[p.codigo] ?? 0), 0);
  const total = hoje.reduce((soma, p) => soma + metaDa(p.codigo).treino[0], 0);
  const marcadas = hoje.filter((p) => (series[p.codigo] ?? 0) > 0);
  // Leva as séries marcadas e as reps da meta, para o registrar já vir preenchido.
  const registrar = marcadas.length
    ? `/treinos/registrar?ex=${marcadas.map((p) => `${p.codigo}:${series[p.codigo]}:${metaDa(p.codigo).treino[1]}`).join(",")}`
    : "/treinos/registrar";

  if (hoje.length === 0) {
    return (
      <EstadoVazio
        titulo="Nada liberado agora"
        texto="Marca na Árvore o equipamento que você tem: algumas progressões precisam de barra ou paralelas."
        acao={
          <button type="button" onClick={aoVerArvore} className="flex min-h-12 items-center justify-center rounded-xl border border-borda-forte text-[15px] font-semibold">
            Ver a árvore
          </button>
        }
      />
    );
  }

  return (
    <>
      <section aria-label="Resumo do treino de hoje" className="rounded-[14px] bg-superficie p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            {/* a aba já diz "Treino de hoje": o card diz de onde ele vem */}
            <h2 className="text-[17px] font-bold tracking-[-0.02em]">O próximo passo de cada trilha</h2>
            <p className="mt-0.5 text-[13px] text-suave">
              {hoje.length} {hoje.length === 1 ? "exercício" : "exercícios"} · marca cada série que fizer
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-lg font-bold leading-none tabular-nums">
              {feitas}
              <span className="text-[13px] font-medium text-suave">/{total}</span>
            </p>
            <p className="mt-0.5 text-xs text-suave">séries feitas</p>
          </div>
        </div>
        <div
          role="progressbar"
          aria-label="Séries feitas"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={feitas}
          className="mt-3 h-2 overflow-hidden rounded bg-elevado"
        >
          <div className="h-2 rounded bg-destaque transition-[width]" style={{ width: `${(feitas / total) * 100}%` }} />
        </div>
      </section>

      {hoje.map((p, i) => (
        <Exercicio
          key={p.codigo}
          p={p}
          ordem={i + 1}
          feitas={series[p.codigo] ?? 0}
          aoMarcar={(n) => setSeries((s) => ({ ...s, [p.codigo]: n }))}
        />
      ))}

      <div className="sticky bottom-[calc(4.25rem+max(1rem,env(safe-area-inset-bottom)))] -mx-5 border-t border-borda bg-fundo px-5 py-3 md:bottom-0 md:mx-0 md:px-0">
        <Link
          href={registrar}
          className="flex min-h-[52px] items-center justify-center rounded-xl bg-destaque px-4 font-titulo text-[17px] text-sobre-destaque hover:brightness-105"
        >
          {GLOSSARIO.registrarTreino}
        </Link>
      </div>
    </>
  );
}

function detalhe(p: Progressao, porCodigo: Map<string, Progressao>, tenho: string[]): string {
  if (p.estado === "dominada") return p.prerequisitos.length === 0 ? "Primeiro passo" : "Você já domina";
  const faltam = p.prerequisitos.filter((c) => porCodigo.get(c)?.estado !== "dominada").map((c) => porCodigo.get(c)?.nome ?? c);
  const semEquip = p.equipamento.filter((e) => !tenho.includes(e)).map((e) => NOME_DO_EQUIPAMENTO[e] ?? e);
  const partes: string[] = [];
  if (faltam.length) partes.push(`Libera depois de ${faltam.join(" e ")}`);
  if (semEquip.length) partes.push(`${faltam.length ? "p" : "P"}recisa de ${semEquip.join(" e ")}`);
  if (partes.length) return partes.join(" · ");
  const { treino, domina, segundos } = metaDa(p.codigo);
  return `Hoje: ${textoDaDose(treino, segundos)}. Domina quando fizer ${textoDaDose(domina, segundos)} sem roubar.`;
}

function Passo({
  p,
  ultimo,
  texto,
  ocupado,
  aoDominar,
  aoDesfazer,
}: {
  p: Progressao;
  ultimo: boolean;
  texto: string;
  ocupado: string | null;
  aoDominar: () => void;
  aoDesfazer: () => void;
}) {
  // o check só pula quando a pessoa acabou de dominar, não ao abrir a árvore
  const [estadoAoAbrir] = useState(p.estado);
  const acabouDeDominar = p.estado === "dominada" && estadoAoAbrir !== "dominada";
  return (
    <li className="flex gap-3">
      <div className="flex flex-col items-center">
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors duration-300 ${
            p.estado === "dominada" ? "bg-folha text-sobre-destaque" : p.estado === "disponivel" ? "bg-elevado text-destaque" : "bg-elevado text-suave"
          }`}
        >
          {p.estado === "dominada" && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={acabouDeDominar ? "animate-pulo" : ""}>
              <path d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
          )}
          {p.estado === "disponivel" && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          )}
          {p.estado === "bloqueada" && (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="5" y="11" width="14" height="9" rx="2" />
              <path d="M8 11V8a4 4 0 0 1 8 0v3" />
            </svg>
          )}
        </span>
        {!ultimo && <span aria-hidden="true" className="w-0.5 flex-1 bg-borda" />}
      </div>
      <div
        className={`mb-2 flex flex-1 flex-col gap-1 rounded-[10px] p-3 ${
          p.estado === "dominada"
            ? "border border-folha-borda bg-folha-fundo"
            : p.estado === "disponivel"
              ? "bg-superficie"
              : "border border-dashed border-borda bg-superficie"
        }`}
      >
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-[15px] font-semibold">{p.nome}</span>
          <span
            className={`shrink-0 whitespace-nowrap text-xs font-semibold ${
              p.estado === "dominada" ? "text-folha" : p.estado === "disponivel" ? "text-destaque" : "text-suave"
            }`}
          >
            {p.estado === "dominada" ? "Dominada" : p.estado === "disponivel" ? "No treino de hoje" : "Bloqueada"}
          </span>
        </div>
        <p className="text-[13px] text-suave">{texto}</p>
        {p.estado === "disponivel" && (
          <button
            type="button"
            disabled={ocupado !== null}
            onClick={aoDominar}
            className="mt-1 flex min-h-11 items-center justify-center rounded-[10px] border border-borda-forte text-[13px] font-semibold hover:bg-superficie-2 disabled:opacity-60"
          >
            {ocupado === p.codigo ? "Marcando..." : "Já domino"}
          </button>
        )}
        {p.estado === "dominada" && (
          <button
            type="button"
            disabled={ocupado !== null}
            onClick={aoDesfazer}
            className="flex min-h-11 items-center self-start text-[13px] font-semibold text-ceu hover:underline disabled:opacity-60"
          >
            {ocupado === p.codigo ? "Desfazendo..." : "Marquei sem querer · desfazer"}
          </button>
        )}
      </div>
    </li>
  );
}

function ArvoreDeProgressoes({ arvore, recarregar }: { arvore: Arvore; recarregar: () => Promise<void> }) {
  const [trilha, setTrilha] = useState(TRILHAS[0]);
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const porCodigo = new Map(arvore.progressoes.map((p) => [p.codigo, p]));
  const passos = arvore.progressoes.filter((p) => p.trilha === trilha);

  async function agir(chave: string, acao: () => Promise<unknown>) {
    setOcupado(chave);
    setErro(null);
    try {
      await acao();
      await recarregar();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "não deu agora, tenta de novo");
    } finally {
      setOcupado(null);
    }
  }

  function alternarEquipamento(codigo: Equipamento) {
    const novos = arvore.equipamentos.includes(codigo)
      ? arvore.equipamentos.filter((e) => e !== codigo)
      : [...arvore.equipamentos, codigo];
    agir(`eq-${codigo}`, () => apiPatch("/usuarios/eu", { equipamentos: novos }));
  }

  return (
    <section aria-label="Árvore de progressões" className="flex flex-col gap-4">
      <p className="text-[13px] leading-snug text-pretty text-suave">
        Cada trilha libera o próximo passo quando você domina o atual. O passo com a seta é o que entra no seu treino.
      </p>

      <div role="group" aria-label="O que você tem pra treinar">
        <h2 className="mb-2 text-[13px] font-semibold">O que você tem pra treinar</h2>
        <div className="flex flex-wrap gap-2">
          {EQUIPAMENTOS.map((e) => {
            const tem = arvore.equipamentos.includes(e.codigo);
            return (
              <button
                key={e.codigo}
                type="button"
                aria-pressed={tem}
                disabled={ocupado !== null}
                onClick={() => alternarEquipamento(e.codigo)}
                className={`min-h-11 rounded-full border px-3.5 text-[13px] font-semibold text-tinta disabled:opacity-60 ${
                  tem ? "border-tinta bg-elevado" : "border-borda-forte bg-transparent"
                }`}
              >
                {e.nome}
              </button>
            );
          })}
        </div>
      </div>

      <Segmentado rotulo="Trilha" opcoes={TRILHAS.map((t) => ({ id: t, nome: t }))} valor={trilha} aoMudar={setTrilha} />

      {erro && <Erro>{erro}</Erro>}

      <ol className="flex flex-col">
        {passos.map((p, i) => (
          <Passo
            key={p.codigo}
            p={p}
            ultimo={i === passos.length - 1}
            texto={detalhe(p, porCodigo, arvore.equipamentos)}
            ocupado={ocupado}
            aoDominar={() => agir(p.codigo, () => apiPost(`/progressoes/${p.codigo}/dominar`))}
            aoDesfazer={() => agir(p.codigo, () => apiDelete(`/progressoes/${p.codigo}/dominar`))}
          />
        ))}
      </ol>
    </section>
  );
}

export default function TreinosPage() {
  const [vista, setVista] = useState<"hoje" | "arvore">("hoje");
  const [arvore, setArvore] = useState<Arvore | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  // Fica aqui em cima para as séries marcadas não sumirem ao trocar de aba.
  const [series, setSeries] = useState<Series>({});

  const recarregar = useCallback(async () => {
    try {
      setArvore(await apiGet<Arvore>("/progressoes"));
      setErro(null);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "não deu para carregar a árvore");
    }
  }, []);

  useEffect(() => {
    recarregar();
  }, [recarregar]);

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col gap-3 pt-2">
        <h1 className="flex min-h-11 items-center font-titulo text-[22px]">Treinos</h1>
        <Segmentado
          rotulo="O que ver"
          opcoes={[
            { id: "hoje" as const, nome: "Treino de hoje" },
            { id: "arvore" as const, nome: "Árvore" },
          ]}
          valor={vista}
          aoMudar={setVista}
        />
      </header>

      {erro && <Erro>{erro}</Erro>}
      {!arvore && !erro && <Carregando />}
      {arvore && vista === "hoje" && <TreinoDeHoje arvore={arvore} series={series} setSeries={setSeries} aoVerArvore={() => setVista("arvore")} />}
      {arvore && vista === "arvore" && <ArvoreDeProgressoes arvore={arvore} recarregar={recarregar} />}
    </div>
  );
}
