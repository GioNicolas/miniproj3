"use client";

// Coluna lateral do feed no computador: o seu frango e a sua semana na Granja,
// para quem abre o feed ver de relance como está, sem trocar de aba.

import Link from "next/link";
import { useEffect, useState } from "react";

import { Card } from "@/components/Card";
import { ArteDoFrango, FAIXA_DA_PATENTE, TEXTO_DA_PATENTE } from "@/components/Frango";
import { SemanaDeTreinos } from "@/components/SemanaDeTreinos";
import { apiGet, type Granja, type Perfil } from "@/lib/api";
import { useDiasTreinados } from "@/lib/dias";
import { useEu } from "@/lib/eu";
import { fraseDaDisputa } from "@/lib/granja";
import { GLOSSARIO } from "@/lib/glossario";

// A coluna só existe no computador (mouse): o link não precisa da altura de toque de 44px.
const LINK = "inline-flex min-h-7 items-center text-[13px] font-semibold underline-offset-4 hover:underline";

function SeuFrango({ frango }: { frango: Perfil["frango"] }) {
  const [min, max] = FAIXA_DA_PATENTE[frango.nivel];
  const largura = Math.max(0, Math.min(100, ((frango.forca - min) / (max - min)) * 100));
  return (
    <Card className="flex min-h-0 flex-1 flex-col gap-2.5">
      {/* a arte ocupa o espaço que sobrar no card */}
      <div className="flex min-h-0 flex-1 items-center justify-center [&>img]:max-h-full">
        <ArteDoFrango patente={frango.nivel} altura={150} definhando={frango.definhando} alt={`Seu frango, patente ${frango.nivel}`} />
      </div>
      <div className="flex items-baseline justify-between">
        <p className="text-[17px] font-extrabold tracking-[-0.02em]" style={{ color: TEXTO_DA_PATENTE[frango.nivel] }}>
          {frango.nivel}
        </p>
        <p className="flex items-baseline gap-1.5">
          <span className="font-placar text-[32px] leading-none">{frango.forca}</span>
          <span className="text-[13px] font-semibold text-suave">de força</span>
        </p>
      </div>
      <div className="h-2 overflow-hidden rounded bg-superficie-2" aria-hidden="true">
        <div className="h-2 rounded bg-destaque" style={{ width: `${largura}%` }} />
      </div>
      <p className="text-[13px] text-suave">
        {frango.definhando
          ? `${frango.dias_sem_treinar} dias sem treinar: ele tá definhando.`
          : frango.proximo_nivel
            ? `Faltam ${frango.falta_para_proximo} de força pro ${frango.proximo_nivel}.`
            : "Força máxima. Agora é manter."}
      </p>
      <Link href="/perfil" className={LINK}>
        Ver meu frango
      </Link>
    </Card>
  );
}

function SuaSemana({ granja, username }: { granja: Granja; username: string }) {
  const treinados = useDiasTreinados(username, 7);
  const { eu, alvo } = granja;
  return (
    <Card className="flex min-h-0 flex-1 flex-col gap-2.5">
      <div className="flex items-baseline justify-between">
        <h2 className="text-[15px] font-bold">Você · {eu.posicao}º lugar</h2>
        <span className="text-[13px] text-suave">
          {eu.dias_treinados} {eu.dias_treinados === 1 ? "dia" : "dias"}
        </span>
      </div>
      <SemanaDeTreinos treinados={treinados} />
      <p className="text-[13px] leading-snug">
        {alvo
          ? fraseDaDisputa(granja)
          : "Ninguém na sua frente essa semana."}
      </p>
      {/* o pódio da semana preenche o card até o link */}
      <ol aria-label="Pódio da semana" className="mt-auto flex flex-col border-t border-borda pt-2">
        {granja.items.slice(0, 3).map((c) => (
          <li key={c.usuario.username} className="flex min-h-7 items-center gap-2 text-[13px]">
            <span className="w-6 font-bold tabular-nums text-suave">{c.posicao}º</span>
            <span className={`flex-1 truncate ${c.usuario.username === username ? "font-bold" : "font-medium"}`}>
              {c.usuario.username === username ? "Você" : c.usuario.name.split(" ")[0]}
            </span>
            <span className="tabular-nums text-suave">
              {c.dias_treinados} {c.dias_treinados === 1 ? "dia" : "dias"}
            </span>
          </li>
        ))}
      </ol>
      <Link href="/granja" className={LINK}>
        Ver a {GLOSSARIO.ranking.toLowerCase()}
      </Link>
    </Card>
  );
}

export function ResumoDaSemana() {
  const eu = useEu();
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [granja, setGranja] = useState<Granja | null>(null);

  useEffect(() => {
    // A coluna só aparece do lg (64rem) para cima: no celular, nem busca.
    if (!eu || !window.matchMedia("(min-width: 64rem)").matches) return;
    // Se não carregar, a coluna só não aparece: o feed continua funcionando.
    apiGet<Perfil>(`/usuarios/${eu.username}`).then(setPerfil).catch(() => setPerfil(null));
    apiGet<Granja>("/granja?k=3").then(setGranja).catch(() => setGranja(null));
  }, [eu]);

  if (!eu) return null;
  return (
    <>
      {perfil && <SeuFrango frango={perfil.frango} />}
      {granja && <SuaSemana granja={granja} username={eu.username} />}
    </>
  );
}
