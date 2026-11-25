"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Botao } from "@/components/Botao";
import { Card } from "@/components/Card";
import { Carregando } from "@/components/Carregando";
import { Erro } from "@/components/Erro";
import { EstadoVazio } from "@/components/EstadoVazio";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api";

type Progressao = { codigo: string; nome: string; trilha: string; prerequisitos: string[]; equipamento: string[]; nivel: number; estado: "dominada" | "disponivel" | "bloqueada" };
type Arvore = { equipamentos: string[]; progressoes: Progressao[] };
const EQUIPAMENTOS = [{ codigo: "barra_fixa", nome: "Barra fixa" }, { codigo: "paralelas", nome: "Paralelas" }, { codigo: "elastico", nome: "El?stico" }];

export default function TreinosPage() {
  const [arvore, setArvore] = useState<Arvore | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const carregar = useCallback(async () => {
    try { setArvore(await apiGet<Arvore>("/progressoes")); setErro(null); }
    catch (e) { setErro(e instanceof Error ? e.message : "N?o foi poss?vel carregar a ?rvore."); }
  }, []);
  useEffect(() => { void carregar(); }, [carregar]);
  async function alterar(acao: () => Promise<unknown>) {
    setOcupado(true); setErro(null);
    try { await acao(); await carregar(); }
    catch (e) { setErro(e instanceof Error ? e.message : "N?o foi poss?vel salvar."); }
    finally { setOcupado(false); }
  }
  const nomes = new Map(arvore?.progressoes.map(p => [p.codigo, p.nome]));
  return <div className="space-y-6">
    <header className="space-y-3">
      <h1 className="font-titulo text-4xl tracking-wide">Sua ?rvore de progress?es</h1>
      <p className="text-sm text-suave">Domine cada passo para liberar o pr?ximo.</p>
      <Link href="/treinos/registrar" className="inline-flex min-h-11 items-center justify-center rounded-lg bg-destaque px-4 font-titulo text-xl text-tinta">Registrar treino</Link>
    </header>
    {erro && <Erro>{erro}</Erro>}
    {!arvore && !erro && <Carregando texto="Carregando progress?es?" />}
    {!arvore && erro && <Botao variante="contorno" onClick={() => void carregar()}>Tentar novamente</Botao>}
    {arvore && <>
      <Card><fieldset disabled={ocupado} className="space-y-2">
        <legend className="font-titulo text-2xl">Seu equipamento</legend>
        <p className="text-sm text-suave">Selecione o que voc? tem dispon?vel.</p>
        {EQUIPAMENTOS.map(item => <label key={item.codigo} className="flex min-h-11 items-center gap-3">
          <input type="checkbox" className="size-5 accent-destaque" checked={arvore.equipamentos.includes(item.codigo)} onChange={e => {
            const equipamentos = e.target.checked ? [...arvore.equipamentos, item.codigo] : arvore.equipamentos.filter(x => x !== item.codigo);
            void alterar(() => apiPatch("/usuarios/eu", { equipamentos }));
          }} />{item.nome}
        </label>)}
      </fieldset></Card>
      {arvore.progressoes.length === 0 && <EstadoVazio titulo="Nenhuma progress?o dispon?vel" texto="Volte mais tarde para conhecer as trilhas." />}
      {["Puxar", "Empurrar", "Pernas", "Core"].map(trilha => {
        const itens = arvore.progressoes.filter(p => p.trilha === trilha);
        const proximo = itens.find(p => p.estado === "disponivel");
        return <section key={trilha} className="space-y-3"><h2 className="font-titulo text-3xl">{trilha}</h2>
          {itens.map(p => <Card key={p.codigo} className={p.codigo === proximo?.codigo ? "ring-2 ring-destaque" : ""}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0 flex-1"><p className="text-xs text-suave">N?vel {p.nivel} {p.codigo === proximo?.codigo && "? Pr?ximo passo"}</p>
                <h3 className="font-semibold">{p.estado === "bloqueada" && <span aria-label="Bloqueada">?? </span>}{p.nome}</h3>
                <p className="text-sm text-suave">{p.estado === "dominada" ? "Dominada" : p.estado === "disponivel" ? "Dispon?vel" : "Bloqueada"}</p>
                {p.estado === "bloqueada" && <p className="text-xs text-suave">{[...p.prerequisitos.filter(x => !arvore.progressoes.some(q => q.codigo === x && q.estado === "dominada")).map(x => `Domine ${nomes.get(x) ?? x}`), ...p.equipamento.filter(x => !arvore.equipamentos.includes(x)).map(x => `Precisa de ${EQUIPAMENTOS.find(e => e.codigo === x)?.nome ?? x}`)].join(" ? ")}</p>}
              </div>
              {p.estado !== "bloqueada" && <Botao variante={p.estado === "dominada" ? "contorno" : "principal"} disabled={ocupado} onClick={() => void alterar(() => p.estado === "dominada" ? apiDelete(`/progressoes/${p.codigo}/dominar`) : apiPost(`/progressoes/${p.codigo}/dominar`))}>{p.estado === "dominada" ? "Desfazer" : "Dominei"}</Botao>}
            </div>
          </Card>)}
        </section>;
      })}
    </>}
  </div>;
}
