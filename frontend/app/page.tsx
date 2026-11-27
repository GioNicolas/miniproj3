"use client";

import Link from "next/link";
import { useState } from "react";

import { Card } from "@/components/Card";
import { Carregando } from "@/components/Carregando";
import { ListaDePosts } from "@/components/ListaDePosts";
import { ResumoDaSemana } from "@/components/ResumoDaSemana";
import type { Post } from "@/lib/api";
import { diaIso, useDiasTreinados } from "@/lib/dias";
import { useEu } from "@/lib/eu";
import { GLOSSARIO } from "@/lib/glossario";
import { useSeguindo } from "@/lib/seguindo";

type Aba = "seguindo" | "explorar";

const ABAS: { id: Aba; rotulo: string }[] = [
  { id: "seguindo", rotulo: "Seguindo" },
  { id: "explorar", rotulo: "Explorar" },
];

/**
 * Chamada do dia, o único botão principal do feed. Quem já treinou hoje não vê o
 * botão: o 2º treino do dia não conta na granja nem soma força.
 */
function ChamadaDoDia() {
  const eu = useEu();
  const treinados = useDiasTreinados(eu?.username, 1);
  const treinouHoje = treinados instanceof Set && treinados.has(diaIso(new Date()));

  if (treinouHoje) {
    return (
      <Card className="flex animate-aparecer items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-folha-fundo text-folha" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </span>
        <div className="flex-1">
          <h1 className="text-[17px] font-bold leading-tight tracking-[-0.02em]">Treino de hoje contado.</h1>
          <p className="mt-0.5 text-[13px] text-suave">Amanhã vale de novo.</p>
        </div>
        <Link href="/granja" className="inline-flex min-h-11 shrink-0 items-center rounded-[10px] border border-borda-forte px-3 text-sm font-semibold hover:bg-superficie-2">
          Ver granja
        </Link>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-4">
      <div>
        <h1 className="text-[17px] font-bold leading-tight tracking-[-0.02em]">Treinou hoje? Conta pra granja.</h1>
        <p className="mt-1 text-[13px] text-suave">Vale 1 dia na granja e +10 de força.</p>
      </div>
      {treinados === null ? (
        // enquanto não sabe se já treinou, guarda o lugar do botão sem mostrá-lo
        <div className="min-h-[52px] animate-brilho rounded-xl bg-superficie-2" aria-hidden="true" />
      ) : (
        <Link
          href="/treinos/registrar"
          className="flex min-h-[52px] items-center justify-center rounded-xl bg-destaque px-4 font-titulo text-[17px] text-sobre-destaque transition-[transform,filter] duration-150 ease-out hover:brightness-105 active:scale-[0.97] motion-reduce:transition-none"
        >
          {GLOSSARIO.registrarTreino}
        </Link>
      )}
    </Card>
  );
}

export default function Home() {
  const sigo = useSeguindo();
  const sigoAlguem = sigo === null ? null : sigo.size > 0;
  // A aba inicial sai da primeira resposta e depois fica: quem segue alguém pelo
  // Explorar continua no Explorar para seguir mais gente.
  const [aba, setAba] = useState<Aba | null>(null);
  if (aba === null && sigoAlguem !== null) setAba(sigoAlguem ? "seguindo" : "explorar");
  // Apagar um post de treino tira o dia da granja e a força no backend; trocar a
  // key remonta a chamada do dia, que pergunta de novo se hoje já tem treino.
  const [versaoDaChamada, setVersaoDaChamada] = useState(0);
  const aoApagar = (post: Post) => {
    if (post.treino) setVersaoDaChamada((v) => v + 1);
  };

  return (
    // No computador (lg), o feed ganha uma coluna lateral com o seu frango e a sua semana.
    <div className="pagina-larga mx-auto max-w-xl lg:grid lg:max-w-none lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start lg:gap-10">
    <div className="flex flex-col gap-4">
      <ChamadaDoDia key={versaoDaChamada} />

      <section className="flex flex-col gap-4">
        {/* Controle segmentado: a aba escolhida fica preenchida (elevado) */}
        <div role="tablist" aria-label="O que mostrar" className="relative grid grid-cols-2 gap-1 rounded-[10px] bg-superficie p-1">
          {/* o fundo da aba escolhida desliza de uma para a outra */}
          <span
            aria-hidden="true"
            className={`absolute inset-y-1 left-1 w-[calc(50%-6px)] rounded-lg bg-elevado transition-transform duration-300 ease-saida ${
              aba === "explorar" ? "translate-x-[calc(100%+4px)]" : ""
            } ${aba === null ? "opacity-0" : ""}`}
          />
          {ABAS.map(({ id, rotulo }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={aba === id}
              onClick={() => setAba(id)}
              className={`relative min-h-11 rounded-lg text-sm transition-colors duration-200 ${
                aba === id ? "font-semibold text-tinta" : "font-medium text-suave hover:text-tinta"
              }`}
            >
              {rotulo}
            </button>
          ))}
        </div>

        {aba === null ? (
          <Carregando />
        ) : aba === "seguindo" ? (
          <ListaDePosts
            key="seguindo"
            caminho="/feed"
            aoApagar={aoApagar}
            vazio={
              sigoAlguem
                ? { titulo: "Nada por aqui ainda", texto: "Quem você segue ainda não contou o treino. Que tal contar o seu?" }
                : {
                    titulo: "Você ainda não segue ninguém",
                    texto: "Segue quem treina perto e os treinos aparecem aqui. Enquanto isso, o Explorar mostra o que a galera tá treinando.",
                  }
            }
          />
        ) : (
          <>
            <p className="text-[13px] text-pretty text-suave">
              {sigoAlguem
                ? "Os posts mais novos da rede toda."
                : "Você ainda não segue ninguém: olha o que a galera tá treinando e toca em Seguir em quem treina parecido com você."}
            </p>
            <ListaDePosts
              key="explorar"
              caminho="/explorar"
              aoApagar={aoApagar}
              vazio={{ titulo: "Ninguém postou ainda", texto: "Que tal ser o primeiro a contar o treino de hoje?" }}
            />
          </>
        )}
      </section>
    </div>
      {/* a coluna ocupa a altura da tela e os cards crescem até embaixo, sem buraco vazio */}
      <aside aria-label="Sua semana" className="hidden lg:sticky lg:top-[5.5rem] lg:flex lg:h-[calc(100dvh-7.5rem)] lg:flex-col lg:gap-4 lg:overflow-y-auto">
        <ResumoDaSemana />
      </aside>
    </div>
  );
}
