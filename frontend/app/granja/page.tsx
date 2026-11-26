"use client";

// Granja da Semana (#12): quem treinou em mais dias distintos nesta semana,
// entre você e quem você segue. Zera toda segunda.

import Link from "next/link";
import { useEffect, useState } from "react";

import { Avatar } from "@/components/Avatar";
import { Card } from "@/components/Card";
import { Carregando } from "@/components/Carregando";
import { Erro } from "@/components/Erro";
import { EstadoVazio } from "@/components/EstadoVazio";
import { DesenhoDoFrango, SeloDaPatente } from "@/components/Frango";
import { apiGet, type Colocado, type Granja } from "@/lib/api";
import { GLOSSARIO } from "@/lib/glossario";

const TAMANHO = 10;

function dias(n: number): string {
  return n === 1 ? "1 dia" : `${n} dias`;
}

function dataCurta(iso: string, somarDias = 0): string {
  const [a, m, d] = iso.split("-").map(Number);
  const data = new Date(a, m - 1, d + somarDias);
  return data.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

function Recado({ granja }: { granja: Granja }) {
  const { eu, alvo, dias_que_ainda_contam: restam } = granja;
  if (!alvo) {
    return <p>Você lidera a sua granja. Treina mais um dia para ninguém te alcançar.</p>;
  }
  const quem = <span className="font-semibold">{alvo.usuario.name}</span>;
  if (alvo.faltam_dias > restam) {
    return (
      <p>
        Essa semana não dá mais para passar {quem}. Segunda zera tudo e todo mundo começa do zero.
      </p>
    );
  }
  return (
    <p>
      {eu.dias_treinados === 0 ? "Bora começar: f" : "F"}alta{alvo.faltam_dias === 1 ? "" : "m"} <span className="font-semibold text-destaque">{dias(alvo.faltam_dias)}</span> de
      treino para passar {quem}.
    </p>
  );
}

const DEGRAU: Record<number, { altura: string; cor: string }> = {
  1: { altura: "h-24", cor: "bg-patente-monstro" },
  2: { altura: "h-16", cor: "bg-patente-galo" },
  3: { altura: "h-12", cor: "bg-patente-granja" },
};

function Podio({ podio, euUsername }: { podio: Colocado[]; euUsername: string }) {
  // Na lista a ordem é 1º, 2º, 3º (leitor de tela); na tela o CSS põe o 1º no meio.
  return (
    <ol aria-label="Pódio" className="grid grid-cols-3 items-end gap-2">
      {podio.map((c) => {
        const souEu = c.usuario.username === euUsername;
        return (
          <li key={c.usuario.username} className={`flex flex-col items-center gap-1 text-center ${c.posicao === 1 ? "order-2" : c.posicao === 2 ? "order-1" : "order-3"}`}>
            {/* o pódio mostra os frangos (#11); sem patente (API antiga), fica o avatar */}
            {c.usuario.nivel ? (
              <DesenhoDoFrango patente={c.usuario.nivel} definhando={false} tamanho={c.posicao === 1 ? 72 : 56} />
            ) : (
              <Avatar name={c.usuario.name} avatarUrl={c.usuario.avatar_url} />
            )}
            <Link
              href={souEu ? "/perfil" : `/u/${c.usuario.username}`}
              className={`w-full truncate text-sm hover:underline ${souEu ? "font-semibold text-destaque-texto" : ""}`}
            >
              {souEu ? "Você" : c.usuario.name}
            </Link>
            {c.usuario.nivel && <SeloDaPatente patente={c.usuario.nivel} />}
            <p className="text-xs text-suave">{dias(c.dias_treinados)}</p>
            <div className={`flex w-full items-start justify-center rounded-t-lg pt-1 font-titulo text-3xl ${DEGRAU[c.posicao].altura} ${DEGRAU[c.posicao].cor}`}>
              {c.posicao}º
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function Linha({ colocado, souEu }: { colocado: Colocado; souEu: boolean }) {
  return (
    <li
      aria-current={souEu ? "true" : undefined}
      className={`flex items-center gap-3 rounded-xl px-3 py-2 ${souEu ? "border-2 border-destaque bg-superficie" : ""}`}
    >
      <span className="w-8 font-titulo text-2xl text-suave">{colocado.posicao}º</span>
      <Avatar name={colocado.usuario.name} avatarUrl={colocado.usuario.avatar_url} />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <Link
            href={souEu ? "/perfil" : `/u/${colocado.usuario.username}`}
            className="truncate font-semibold hover:underline"
          >
            {souEu ? "Você" : colocado.usuario.name}
          </Link>
          {colocado.usuario.nivel && <SeloDaPatente patente={colocado.usuario.nivel} />}
        </span>
        <span className="block truncate text-sm text-suave">@{colocado.usuario.username}</span>
      </span>
      <span className="shrink-0 text-sm">{dias(colocado.dias_treinados)}</span>
    </li>
  );
}

export default function GranjaPage() {
  const [granja, setGranja] = useState<Granja | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    apiGet<Granja>(`/granja?k=${TAMANHO}`)
      .then(setGranja)
      .catch((e) => setErro(e instanceof Error ? e.message : "não deu para carregar a granja"));
  }, []);

  if (erro) return <Erro>{erro}</Erro>;
  if (!granja) return <Carregando />;

  const euUsername = granja.eu.usuario.username;
  const soEu = granja.items.length === 1;
  const euNoTopo = granja.items.some((c) => c.usuario.username === euUsername);
  const podio = granja.items.slice(0, 3);
  const resto = granja.items.slice(3);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-titulo text-4xl tracking-wide">{GLOSSARIO.ranking}</h1>
        <p className="text-sm text-suave">
          De {dataCurta(granja.semana_inicio)} a {dataCurta(granja.semana_inicio, 6)} · conta dias com treino, não peso.
          Zera toda segunda.
        </p>
      </header>

      <Card escuro className="space-y-1">
        <p className="font-titulo text-2xl tracking-wide">
          Você está em {granja.eu.posicao}º · {dias(granja.eu.dias_treinados)}
        </p>
        <div className="text-sm">
          <Recado granja={granja} />
        </div>
      </Card>

      {soEu ? (
        <EstadoVazio
          titulo="Sua granja é só você"
          texto="A granja é você e quem você segue. Siga outros frangos para ter com quem disputar a semana."
          acao={
            <Link href="/" className="font-semibold text-destaque-texto hover:underline">
              Achar frangos no Explorar
            </Link>
          }
        />
      ) : (
        <>
          <Podio podio={podio} euUsername={euUsername} />
          {(resto.length > 0 || !euNoTopo) && (
            <ol aria-label="Classificação" start={4} className="space-y-1">
              {resto.map((c) => (
                <Linha key={c.usuario.username} colocado={c} souEu={c.usuario.username === euUsername} />
              ))}
              {!euNoTopo && (
                <>
                  <li aria-hidden="true" className="px-3 text-suave">⋯</li>
                  <Linha colocado={granja.eu} souEu />
                </>
              )}
            </ol>
          )}
        </>
      )}
    </div>
  );
}
