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
import { GLOSSARIO } from "@/lib/glossario";

const LINK = "inline-flex min-h-11 items-center text-[13px] font-semibold underline-offset-4 hover:underline";

function SeuFrango({ frango }: { frango: Perfil["frango"] }) {
  const [min, max] = FAIXA_DA_PATENTE[frango.nivel];
  const largura = Math.max(0, Math.min(100, ((frango.forca - min) / (max - min)) * 100));
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <ArteDoFrango patente={frango.nivel} altura={72} definhando={frango.definhando} alt={`Seu frango, patente ${frango.nivel}`} />
        <div>
          <p className="text-[17px] font-extrabold tracking-[-0.02em]" style={{ color: TEXTO_DA_PATENTE[frango.nivel] }}>
            {frango.nivel}
          </p>
          <p className="flex items-baseline gap-1.5">
            <span className="font-placar text-[32px] leading-none">{frango.forca}</span>
            <span className="text-[13px] font-semibold text-suave">de força</span>
          </p>
        </div>
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
    <Card className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <h2 className="text-[15px] font-bold">Você · {eu.posicao}º lugar</h2>
        <span className="text-[13px] text-suave">
          {eu.dias_treinados} {eu.dias_treinados === 1 ? "dia" : "dias"}
        </span>
      </div>
      <SemanaDeTreinos treinados={treinados} />
      <p className="text-[13px] leading-snug">
        {alvo
          ? `Mais ${alvo.faltam_dias} ${alvo.faltam_dias === 1 ? "dia" : "dias"} e você passa ${alvo.usuario.name.split(" ")[0]}.`
          : "Ninguém na sua frente essa semana."}
      </p>
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
