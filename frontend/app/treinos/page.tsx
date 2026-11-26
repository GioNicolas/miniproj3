"use client";

// Árvore de progressões (#10): cada trilha em ordem de pré-requisito, com
// cadeado no que ainda não dá, destaque no próximo passo e o equipamento que
// libera parte da árvore. O estado de cada skill vem pronto da API.

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { Botao } from "@/components/Botao";
import { Card } from "@/components/Card";
import { Carregando } from "@/components/Carregando";
import { Erro } from "@/components/Erro";
import { apiDelete, apiGet, apiPatch, apiPost, type Arvore, type Equipamento, type SkillNaArvore } from "@/lib/api";
import { GLOSSARIO } from "@/lib/glossario";
import { EQUIPAMENTOS, TRILHAS, nomeDoEquipamento } from "@/lib/progressoes";

function Marcador({ skill, proximo }: { skill: SkillNaArvore; proximo: boolean }) {
  const base = "relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2";
  if (skill.estado === "dominada") {
    return (
      <span className={`${base} border-destaque bg-destaque text-tinta`} aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12l5 5 9-10" />
        </svg>
      </span>
    );
  }
  if (skill.estado === "disponivel") {
    return (
      <span className={`${base} border-destaque bg-superficie ${proximo ? "ring-4 ring-destaque/25" : ""}`} aria-hidden="true">
        <span className={`h-3 w-3 rounded-full ${proximo ? "bg-destaque" : "bg-borda"}`} />
      </span>
    );
  }
  return (
    <span className={`${base} border-borda bg-fundo text-suave`} aria-hidden="true">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="11" width="14" height="10" rx="2" />
        <path d="M8 11V8a4 4 0 0 1 8 0v3" />
      </svg>
    </span>
  );
}

/** "Falta: Barra negativa · Precisa de paralelas" para quem está bloqueado. */
function oQueFalta(skill: SkillNaArvore, arvore: Arvore, nomes: Map<string, SkillNaArvore>): string {
  const pre = skill.prerequisitos
    .map((codigo) => nomes.get(codigo))
    .filter((p): p is SkillNaArvore => !!p && p.estado !== "dominada")
    .map((p) => (p.trilha === skill.trilha ? p.nome : `${p.nome} (${p.trilha})`));
  const equip = skill.equipamento.filter((e) => !arvore.equipamentos.includes(e)).map(nomeDoEquipamento);
  return [
    pre.length > 0 ? `Domine antes: ${pre.join(", ")}` : null,
    equip.length > 0 ? `Precisa de ${equip.join(" e ").toLowerCase()}` : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

function Passo({
  skill,
  proximo,
  ultimo,
  falta,
  ocupado,
  onDominar,
  onDesfazer,
}: {
  skill: SkillNaArvore;
  proximo: boolean;
  ultimo: boolean;
  falta: string;
  ocupado: boolean;
  onDominar: () => void;
  onDesfazer: () => void;
}) {
  return (
    <li className="relative flex gap-3 pb-4 last:pb-0">
      {/* a linha que liga um passo ao próximo */}
      {!ultimo && (
        <span
          aria-hidden="true"
          className={`absolute left-[17px] top-9 h-[calc(100%-2.25rem)] w-0.5 ${skill.estado === "dominada" ? "bg-destaque" : "bg-borda"}`}
        />
      )}
      <Marcador skill={skill} proximo={proximo} />
      <div
        className={`flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-2 rounded-xl px-3 py-1.5 ${proximo ? "border-2 border-destaque bg-superficie" : ""}`}
      >
        <div className="min-w-0 flex-1">
          {proximo && <p className="text-[11px] font-bold uppercase tracking-wider text-destaque-texto">Próximo passo</p>}
          <p className={`font-semibold ${skill.estado === "bloqueada" ? "text-suave" : ""}`}>
            {skill.nome}
            <span className="sr-only">
              {skill.estado === "dominada" ? ", dominada" : skill.estado === "disponivel" ? ", disponível" : ", bloqueada"}
            </span>
          </p>
          {skill.estado === "bloqueada" && <p className="text-xs text-suave">{falta}</p>}
          {skill.estado === "disponivel" && !proximo && <p className="text-xs text-suave">Liberada: dá para tentar</p>}
        </div>
        {skill.estado === "disponivel" && (
          <Botao variante={proximo ? "principal" : "contorno"} disabled={ocupado} onClick={onDominar} className="text-lg">
            Dominei
          </Botao>
        )}
        {skill.estado === "dominada" && (
          <button
            type="button"
            disabled={ocupado}
            onClick={onDesfazer}
            className="min-h-11 px-1 text-xs text-suave underline-offset-2 hover:underline disabled:opacity-50"
          >
            Desfazer
          </button>
        )}
      </div>
    </li>
  );
}

export default function TreinosPage() {
  const [arvore, setArvore] = useState<Arvore | null>(null);
  const [erroAoCarregar, setErroAoCarregar] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);

  const carregar = useCallback(async () => {
    try {
      setArvore(await apiGet<Arvore>("/progressoes"));
      setErroAoCarregar(null);
    } catch (e) {
      setErroAoCarregar(e instanceof Error ? e.message : "não deu para carregar a árvore");
    }
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  async function mudar(acao: () => Promise<unknown>) {
    setOcupado(true);
    setAviso(null);
    try {
      await acao();
      await carregar();
    } catch (e) {
      // 409 da API já diz o que falta: "desfaça antes: Barra fixa"
      const msg = e instanceof Error ? e.message : "não deu para salvar";
      setAviso(msg.charAt(0).toUpperCase() + msg.slice(1));
    } finally {
      setOcupado(false);
    }
  }

  if (erroAoCarregar && !arvore) {
    return (
      <div className="space-y-3">
        <Erro>{erroAoCarregar}</Erro>
        <Botao variante="contorno" onClick={() => void carregar()}>
          Tentar de novo
        </Botao>
      </div>
    );
  }
  if (!arvore) return <Carregando texto="Montando a sua árvore…" />;

  const porCodigo = new Map(arvore.progressoes.map((p) => [p.codigo, p]));
  const dominadas = arvore.progressoes.filter((p) => p.estado === "dominada").length;

  function alternarEquipamento(codigo: Equipamento) {
    const atual = arvore!.equipamentos;
    const equipamentos = atual.includes(codigo) ? atual.filter((e) => e !== codigo) : [...atual, codigo];
    void mudar(() => apiPatch("/usuarios/eu", { equipamentos }));
  }

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-titulo text-4xl tracking-wide">Sua árvore</h1>
            <p className="text-sm text-suave">
              <span className="font-semibold text-tinta">
                {dominadas} de {arvore.progressoes.length}
              </span>{" "}
              skills dominadas. Cada uma libera a próxima: nada de tentar a barra fixa antes da australiana.
            </p>
          </div>
          <Link
            href="/treinos/registrar"
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-destaque px-4 font-titulo text-xl tracking-wide text-tinta hover:brightness-95"
          >
            {GLOSSARIO.registrarTreino}
          </Link>
        </div>

        <fieldset disabled={ocupado} className="space-y-2">
          <legend className="text-sm font-semibold">O que você tem para treinar</legend>
          <div className="flex flex-wrap gap-2">
            {EQUIPAMENTOS.map((e) => {
              const tem = arvore.equipamentos.includes(e.codigo);
              return (
                <button
                  key={e.codigo}
                  type="button"
                  aria-pressed={tem}
                  onClick={() => alternarEquipamento(e.codigo)}
                  className={`min-h-11 rounded-full border px-4 text-sm disabled:opacity-50 ${tem ? "border-tinta bg-tinta text-tinta-clara" : "border-borda bg-superficie text-suave hover:text-tinta"}`}
                >
                  {tem ? "✓ " : "+ "}
                  {e.nome}
                </button>
              );
            })}
          </div>
        </fieldset>
      </header>

      {aviso && <Erro>{aviso}</Erro>}

      <div className="grid gap-4 md:grid-cols-2">
        {TRILHAS.map(({ nome: trilha }) => {
          const skills = arvore.progressoes.filter((p) => p.trilha === trilha).sort((a, b) => a.nivel - b.nivel);
          const proximo = skills.find((p) => p.estado === "disponivel");
          const feitas = skills.filter((p) => p.estado === "dominada").length;
          return (
            <Card key={trilha} className="space-y-4">
              <div className="flex items-baseline justify-between">
                <h2 className="font-titulo text-3xl tracking-wide">{trilha}</h2>
                <span className="text-sm text-suave">
                  {feitas}/{skills.length}
                </span>
              </div>
              <ol aria-label={`Trilha ${trilha}`}>
                {skills.map((skill, i) => (
                  <Passo
                    key={skill.codigo}
                    skill={skill}
                    proximo={skill.codigo === proximo?.codigo}
                    ultimo={i === skills.length - 1}
                    falta={oQueFalta(skill, arvore, porCodigo)}
                    ocupado={ocupado}
                    onDominar={() => void mudar(() => apiPost(`/progressoes/${skill.codigo}/dominar`))}
                    onDesfazer={() => void mudar(() => apiDelete(`/progressoes/${skill.codigo}/dominar`))}
                  />
                ))}
              </ol>
              {!proximo && feitas === skills.length && (
                <p className="text-sm font-semibold text-sucesso">Trilha completa. Agora é manter a constância.</p>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
