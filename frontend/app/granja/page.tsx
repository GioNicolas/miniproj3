"use client";

// Granja da Semana (#12): quem treinou em mais dias distintos nesta semana,
// entre você e quem você segue. Zera toda segunda.

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { Avatar } from "@/components/Avatar";
import { BotaoSeguir } from "@/components/BotaoSeguir";
import { Carregando } from "@/components/Carregando";
import { Erro } from "@/components/Erro";
import { EstadoVazio } from "@/components/EstadoVazio";
import { ArteDoFrango, CABECA_NA_ARTE, SeloDaPatente } from "@/components/Frango";
import { SemanaDeTreinos } from "@/components/SemanaDeTreinos";
import { apiGet, type Autor, type Colocado, type Granja, type Page, type Post } from "@/lib/api";
import { diaIso, semanaAtual, useDiasTreinados } from "@/lib/dias";
import { GLOSSARIO } from "@/lib/glossario";

const TAMANHO = 10;

function dias(n: number): string {
  return n === 1 ? "1 dia" : `${n} dias`;
}

function intervalo(inicioIso: string): string {
  const [a, m, d] = inicioIso.split("-").map(Number);
  const inicio = new Date(a, m - 1, d);
  const fim = new Date(a, m - 1, d + 6);
  const mes = (x: Date) => x.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
  return inicio.getMonth() === fim.getMonth()
    ? `${inicio.getDate()} a ${fim.getDate()} de ${mes(fim)}`
    : `${inicio.getDate()} de ${mes(inicio)} a ${fim.getDate()} de ${mes(fim)}`;
}

function primeiroNome(nome: string): string {
  return nome.split(" ")[0];
}

/** Dias da semana da granja de hoje até domingo, contando hoje (domingo = 1). */
function diasAteDomingo(): number {
  return 7 - ((new Date().getDay() + 6) % 7);
}

function Recado({ granja }: { granja: Granja }) {
  const { eu, alvo, dias_que_ainda_contam: restam } = granja;
  if (granja.items.length === 1) return <p>Ninguém na disputa ainda. Segue alguém e a semana vira corrida.</p>;
  if (!alvo) return <p>Você lidera a sua granja. Treina mais um dia pra ninguém te alcançar.</p>;
  const quem = <strong>{primeiroNome(alvo.usuario.name)}</strong>;
  if (alvo.faltam_dias > restam) {
    return <p>Essa semana não dá mais pra passar {quem}. Segunda zera e todo mundo começa do zero.</p>;
  }
  if (alvo.faltam_dias === 1) {
    // dias_que_ainda_contam não inclui hoje quando você já treinou hoje (o 2º treino do dia não conta)
    return <p>Treina {restam === diasAteDomingo() ? "hoje" : "amanhã"} e você passa {quem}.</p>;
  }
  return (
    <p>
      {eu.dias_treinados === 0 ? "Bora começar: f" : "F"}altam {dias(alvo.faltam_dias)} de treino pra passar {quem}.
    </p>
  );
}

// Pódio: cor da medalha no número e altura do degrau. O número é grande (3:1 basta),
// e cada cor passa no fundo do próprio degrau.
const MEDALHA: Record<number, { cor: string; degrau: string; arte: number }> = {
  1: { cor: "#977117", degrau: "min-h-[160px] lg:min-h-[124px] bg-superficie-2", arte: 118 },
  2: { cor: "#797e86", degrau: "min-h-[136px] lg:min-h-[108px] bg-superficie", arte: 92 },
  3: { cor: "#b06a38", degrau: "min-h-[122px] lg:min-h-[100px] bg-superficie", arte: 84 },
};

function TreinouHoje() {
  return <span className="rounded-full bg-destaque-fundo px-2 py-px text-xs font-bold text-destaque">treinou hoje</span>;
}

function Degrau({ c, souEu }: { c: Colocado; souEu: boolean }) {
  const treinados = useDiasTreinados(c.usuario.username, 1);
  const hoje = treinados instanceof Set && treinados.has(diaIso(new Date()));
  const m = MEDALHA[c.posicao];
  const patente = c.usuario.nivel ?? "Pintinho";
  return (
    <li className={`flex flex-col items-center ${c.posicao === 1 ? "order-2" : c.posicao === 2 ? "order-1" : "order-3"}`}>
      <Link
        href={`/u/${c.usuario.username}`}
        // no computador as artes encolhem um pouco para o lado esquerdo caber na tela
        className={`relative -mb-1 lg:[&>img]:!h-[var(--arte-lg)] ${c.posicao === 1 ? "mt-4" : ""}`}
        style={{ "--arte-lg": `${Math.round(m.arte * 0.7)}px` } as React.CSSProperties}
      >
        <ArteDoFrango patente={patente} altura={m.arte} alt={`${patente} de ${souEu ? "você" : primeiroNome(c.usuario.name)}`} />
        {c.posicao === 1 && (
          // a coroa senta na cabeça: cada arte tem a cabeça num ponto diferente
          <svg
            width="30"
            height="20"
            viewBox="0 0 30 20"
            aria-hidden="true"
            className="absolute -top-3.5 -translate-x-1/2 -rotate-6"
            style={{ left: `${CABECA_NA_ARTE[patente] * 100}%` }}
          >
            <path d="M2 18L4 5l7 6 4-9 4 9 7-6 2 13z" fill="#e8b23a" stroke="#b9831a" strokeWidth="1.2" strokeLinejoin="round" />
          </svg>
        )}
      </Link>
      <div className={`flex w-full flex-col items-center justify-start rounded-t-xl px-1 py-2 ${m.degrau}`}>
        <span className="font-placar text-4xl leading-none" style={{ color: m.cor }}>
          {c.posicao}
          <span className="ml-px align-top font-corpo text-[15px] font-bold">º</span>
        </span>
        <span className="mt-0.5 max-w-full truncate text-[13px] font-bold">{souEu ? "Você" : primeiroNome(c.usuario.name)}</span>
        <span className="mt-0.5 text-xs font-medium text-suave">{dias(c.dias_treinados)}</span>
        {hoje && (
          <span className="mt-2">
            <TreinouHoje />
          </span>
        )}
      </div>
    </li>
  );
}

function Linha({ c, souEu }: { c: Colocado; souEu: boolean }) {
  const semana = semanaAtual();
  const treinados = useDiasTreinados(c.usuario.username, 7);
  const carregou = treinados instanceof Set;
  const feitos = carregou ? semana.filter((d) => treinados.has(d)).length : 0;
  const hoje = carregou && treinados.has(diaIso(new Date()));
  return (
    <li
      aria-current={souEu ? "true" : undefined}
      className={
        souEu
          ? "-mx-2 my-1.5 flex items-center gap-3 rounded-[10px] bg-superficie px-2 py-2.5 shadow-[inset_0_0_0_1px_var(--color-borda-forte)]"
          : "flex items-center gap-3 border-b border-borda py-3"
      }
    >
      <span className="w-6 shrink-0 text-[17px] font-bold tabular-nums text-suave">{c.posicao}</span>
      <Avatar name={c.usuario.name} avatarUrl={c.usuario.avatar_url} patente={c.usuario.nivel} />
      <Link href={`/u/${c.usuario.username}`} className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
          <span className={`truncate text-sm ${souEu ? "font-bold" : "font-medium"} ${c.dias_treinados === 0 ? "text-suave" : ""}`}>
            {souEu ? "Você" : c.usuario.name}
          </span>
          {c.usuario.nivel && <SeloDaPatente patente={c.usuario.nivel} />}
        </span>
        <span className="mt-1 flex min-h-[18px] items-center gap-2">
          <span role="img" aria-label={`Treinou ${feitos} de 7 dias nesta semana`} className="flex shrink-0 gap-[3px]">
            {semana.map((d) => (
              <span key={d} className={`h-2.5 w-2.5 rounded-sm ${carregou && treinados.has(d) ? "bg-tinta" : "bg-elevado"}`} />
            ))}
          </span>
          {hoje && <TreinouHoje />}
        </span>
      </Link>
      <span className="shrink-0 text-right text-lg font-bold leading-none tabular-nums">{c.dias_treinados}</span>
    </li>
  );
}

const REGRAS_GRANJA = [
  { sinal: "+1", tom: "forte", texto: "Cada dia que você treina vale 1 ponto" },
  { sinal: "0", tom: "neutro", texto: "Toda segunda, 0h de Recife, a semana zera" },
  { sinal: "=", tom: "neutro", texto: "No empate, fica na frente quem tem o @ antes no alfabeto" },
];
const REGRAS_FRANGO = [
  { sinal: "+10", tom: "bom", texto: "Cada treino dá +10 de força, até 100" },
  { sinal: "0", tom: "neutro", texto: "1 dia de folga não tira força" },
  { sinal: "−5", tom: "ruim", texto: "A partir do 2º dia sem treinar, perde 5 por dia e o frango começa a definhar" },
  { sinal: "↺", tom: "forte", texto: "Treinou de novo, o frango para de definhar no mesmo dia" },
];
const TOM: Record<string, string> = {
  forte: "bg-destaque-fundo text-destaque",
  neutro: "bg-superficie-2 text-tinta",
  bom: "bg-folha-fundo text-folha",
  ruim: "bg-brasa-fundo text-brasa",
};

function Regras({ abertoInicial = false }: { abertoInicial?: boolean }) {
  const [aberto, setAberto] = useState(abertoInicial);
  const bloco = (titulo: string, regras: typeof REGRAS_GRANJA) => (
    <div>
      <h3 className="mb-2 text-xs font-semibold tracking-[0.5px] text-suave uppercase">{titulo}</h3>
      <ul>
        {regras.map((r) => (
          <li key={r.texto} className="flex items-center gap-3 py-1.5 text-[13px]">
            <span className={`min-w-10 shrink-0 rounded-md py-0.5 text-center text-sm font-bold tabular-nums ${TOM[r.tom]}`}>{r.sinal}</span>
            <span>{r.texto}</span>
          </li>
        ))}
      </ul>
    </div>
  );
  return (
    <section aria-label="Regras" className="overflow-hidden rounded-[14px] bg-superficie py-1">
      <button
        type="button"
        onClick={() => setAberto(!aberto)}
        aria-expanded={aberto}
        className="flex min-h-[52px] w-full items-center gap-3 px-4 text-left"
      >
        <span className="flex-1 text-[17px] font-bold tracking-[-0.02em]">Como funciona a pontuação</span>
        <span className="text-xs font-semibold text-ceu">{aberto ? "Fechar" : "Ver"}</span>
      </button>
      {aberto && (
        <div className="flex flex-col gap-3 px-4 pb-4">
          {bloco("Pontos na granja", REGRAS_GRANJA)}
          {bloco("Força do frango", REGRAS_FRANGO)}
        </div>
      )}
    </section>
  );
}

// ---- Prévia (#88): quem ainda não segue ninguém vê como a granja ficaria ----

const PESSOAS_CONSULTADAS = 12; // quantos autores do Explorar têm a semana conferida
const PESSOAS_NA_PREVIA = 4;

type NaPrevia = { usuario: Autor; dias: number; souEu: boolean };

/**
 * Quem mais treinou nesta semana entre quem posta no Explorar, com dias de verdade
 * (a mesma semana e o mesmo desempate da Granja). null enquanto carrega; [] se não deu.
 */
function usePrevia(eu: Colocado, ativo: boolean): NaPrevia[] | null {
  const [previa, setPrevia] = useState<NaPrevia[] | null>(null);
  useEffect(() => {
    if (!ativo) return;
    let vivo = true;
    const semana = semanaAtual();
    (async () => {
      const pagina = await apiGet<Page<Post>>("/explorar?offset=0&limit=50");
      const autores = new Map<string, Autor>();
      for (const post of pagina.items) {
        if (post.autor.username !== eu.usuario.username) autores.set(post.autor.username, post.autor);
      }
      const comDias = await Promise.all(
        [...autores.values()].slice(0, PESSOAS_CONSULTADAS).map(async (usuario) => {
          const { dias } = await apiGet<{ dias: string[] }>(`/usuarios/${usuario.username}/treinos?dias=7`);
          return { usuario, dias: semana.filter((d) => dias.includes(d)).length, souEu: false };
        })
      );
      const melhores = comDias.filter((p) => p.dias > 0).sort((a, b) => b.dias - a.dias || a.usuario.username.localeCompare(b.usuario.username));
      const comigo = [...melhores.slice(0, PESSOAS_NA_PREVIA), { usuario: eu.usuario, dias: eu.dias_treinados, souEu: true }];
      comigo.sort((a, b) => b.dias - a.dias || a.usuario.username.localeCompare(b.usuario.username));
      if (vivo) setPrevia(melhores.length ? comigo : []);
    })().catch(() => vivo && setPrevia([]));
    return () => {
      vivo = false;
    };
  }, [eu, ativo]);
  return previa;
}

function PreviaDaGranja({ previa, aoSeguir }: { previa: NaPrevia[]; aoSeguir: () => void }) {
  return (
    <section aria-label="Prévia da sua granja" className="flex animate-subir flex-col gap-3">
      <div>
        <h2 className="text-2xl font-bold leading-tight tracking-[-0.02em]">Sua granja ainda é só você</h2>
        <p className="mt-2 text-[15px] leading-normal text-pretty text-suave">
          A granja é você e quem você segue. Ganha a semana quem treinar em mais dias. Se você seguisse essa galera, ela estaria assim:
        </p>
      </div>
      <ol className="rounded-2xl bg-superficie px-4 py-1">
        {previa.map((p, i) => {
          const posicao = i + 1;
          return (
            <li
              key={p.usuario.username}
              aria-current={p.souEu ? "true" : undefined}
              className={`flex items-center gap-3 py-2.5 ${i < previa.length - 1 ? "border-b border-borda" : ""}`}
            >
              <span className="w-6 shrink-0 font-placar text-[22px] leading-none" style={{ color: MEDALHA[posicao]?.cor }}>
                {posicao}
              </span>
              <Avatar name={p.usuario.name} avatarUrl={p.usuario.avatar_url} patente={p.usuario.nivel} />
              <div className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
                  <span className={`truncate text-sm ${p.souEu ? "font-bold" : "font-medium"}`}>{p.souEu ? "Você" : p.usuario.name}</span>
                  {p.usuario.nivel && !p.souEu && <SeloDaPatente patente={p.usuario.nivel} />}
                </span>
                <span className="text-xs text-suave">{p.souEu && p.dias === 0 ? "0 dias: treina hoje e já sai do zero" : dias(p.dias)}</span>
              </div>
              {!p.souEu && (
                <BotaoSeguir
                  username={p.usuario.username}
                  euSigoInicial={false}
                  aoMudar={(delta) => delta > 0 && aoSeguir()}
                  className="w-24 shrink-0 lg:w-28"
                />
              )}
            </li>
          );
        })}
      </ol>
      <p className="text-[13px] text-pretty text-suave">Seguiu alguém, a granja vira disputa de verdade na hora.</p>
    </section>
  );
}

export default function GranjaPage() {
  const [granja, setGranja] = useState<Granja | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(() => {
    apiGet<Granja>(`/granja?k=${TAMANHO}`)
      .then(setGranja)
      .catch((e) => setErro(e instanceof Error ? e.message : "não deu para carregar a granja"));
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const minhaSemana = useDiasTreinados(granja?.eu.usuario.username, 7);
  const previa = usePrevia(granja?.eu as Colocado, granja?.items.length === 1);

  if (erro) return <Erro>{erro}</Erro>;
  if (!granja) return <Carregando />;

  const euUsername = granja.eu.usuario.username;
  const soEu = granja.items.length === 1;
  const euNoTopo = granja.items.some((c) => c.usuario.username === euUsername);
  const podio = granja.items.slice(0, 3);
  const resto = granja.items.slice(3);
  // Quanto falta para a semana zerar não depende de eu já ter treinado hoje
  // (dias_que_ainda_contam desconta hoje de quem treinou: no sábado dava "acaba hoje").
  const restam = diasAteDomingo();
  const treineiHoje = minhaSemana instanceof Set && minhaSemana.has(diaIso(new Date()));

  return (
    // No computador (lg): pódio e "Você" de um lado; classificação e regras do outro.
    <div className="pagina-larga mx-auto flex max-w-xl flex-col gap-4 lg:grid lg:max-w-none lg:grid-cols-[minmax(0,30rem)_minmax(0,1fr)] lg:items-start lg:gap-x-10">
      <header className="pt-2 lg:col-span-2 lg:flex lg:items-center lg:justify-between lg:gap-6">
        <h1 className="flex min-h-11 items-center font-titulo text-[22px]">{GLOSSARIO.ranking}</h1>
        <div className="mt-3 flex items-center justify-between gap-2 text-[13px] text-suave lg:mt-0 lg:gap-4">
          <span>
            {intervalo(granja.semana_inicio)} · {granja.items.length} na disputa
          </span>
          <span className={`shrink-0 rounded-full px-3 py-1 font-semibold ${restam <= 1 ? "bg-brasa-fundo text-brasa" : "bg-superficie text-tinta"}`}>
            {restam <= 1 ? "Acaba hoje, 23h59" : `Faltam ${restam} dias`}
          </span>
        </div>
      </header>

      {/* no computador, pódio e "Você" ficam parados enquanto a classificação rola */}
      <div className="flex flex-col gap-4 lg:sticky lg:top-[5.5rem]">
      {soEu && previa === null ? (
        <Carregando />
      ) : soEu && previa && previa.length > 0 ? (
        <PreviaDaGranja previa={previa} aoSeguir={carregar} />
      ) : soEu ? (
        <EstadoVazio
          titulo="Sua granja é só você"
          texto="A granja é você e quem você segue. Segue outros frangos pra ter com quem disputar a semana."
          acao={
            <Link href="/" className="flex min-h-12 items-center justify-center rounded-xl border border-borda-forte text-[15px] font-semibold">
              Achar gente no Explorar
            </Link>
          }
        />
      ) : (
        // o pódio sobe junto quando a Granja abre
        <ol aria-label="Pódio" className="grid animate-subir grid-cols-3 items-end gap-x-3 pt-1">
          {podio.map((c) => (
            <Degrau key={c.usuario.username} c={c} souEu={c.usuario.username === euUsername} />
          ))}
        </ol>
      )}

      <section aria-label="Sua semana" className="flex flex-col gap-3 rounded-2xl bg-superficie p-4">
        <div className="flex items-baseline justify-between">
          <span className="text-[17px] font-bold tracking-[-0.02em]">{soEu ? "Você" : `Você · ${granja.eu.posicao}º lugar`}</span>
          <span className="text-[13px] text-suave">{dias(granja.eu.dias_treinados)}</span>
        </div>
        <SemanaDeTreinos treinados={minhaSemana} />
        <div className="text-[15px] leading-snug">
          <Recado granja={granja} />
        </div>
        {treineiHoje ? (
          // o 2º treino do dia não conta: no lugar do botão, a confirmação
          <p className="flex animate-aparecer items-center gap-2 text-sm font-semibold">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-folha-fundo text-folha" aria-hidden="true">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12.5l4.5 4.5L19 7.5" />
              </svg>
            </span>
            Treino de hoje contado.
          </p>
        ) : minhaSemana === null ? (
          // enquanto não sabe se já treinou, guarda o lugar do botão sem mostrá-lo
          <div className="min-h-[52px] animate-brilho rounded-xl bg-superficie-2" aria-hidden="true" />
        ) : (
          <Link
            href="/treinos/registrar"
            className="flex min-h-[52px] items-center justify-center rounded-xl bg-destaque px-4 font-titulo text-[17px] text-sobre-destaque hover:brightness-105"
          >
            {GLOSSARIO.registrarTreino}
          </Link>
        )}
      </section>
      </div>

      <div className="flex flex-col gap-4">
      {!soEu && (resto.length > 0 || !euNoTopo) && (
        <section aria-label="Classificação">
          <ol>
            {resto.map((c) => (
              <Linha key={c.usuario.username} c={c} souEu={c.usuario.username === euUsername} />
            ))}
            {!euNoTopo && <Linha c={granja.eu} souEu />}
          </ol>
          <Link href="/" className="flex min-h-[52px] items-center gap-3 py-1 text-[15px] font-semibold text-ceu">
            <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-dashed border-borda-forte">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </span>
            Chamar mais gente pra granja
          </Link>
        </section>
      )}

      <Regras abertoInicial={soEu} />
      </div>
    </div>
  );
}
