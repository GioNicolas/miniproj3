"use client";

// Dias de treino de uma pessoa (GET /usuarios/{username}/treinos), em datas locais "AAAA-MM-DD".

import { useEffect, useState } from "react";

import { apiGet } from "@/lib/api";
import { useEu } from "@/lib/eu";

export const LETRAS_DA_SEMANA = ["S", "T", "Q", "Q", "S", "S", "D"];
export const NOMES_DOS_DIAS = ["segunda", "terça", "quarta", "quinta", "sexta", "sábado", "domingo"];

export function diaIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Os 7 dias desta semana, de segunda a domingo: a mesma semana da Granja. */
export function semanaAtual(): string[] {
  const hoje = new Date();
  const segunda = new Date(hoje);
  segunda.setDate(hoje.getDate() - ((hoje.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const dia = new Date(segunda);
    dia.setDate(segunda.getDate() + i);
    return diaIso(dia);
  });
}

/** Os últimos `n` dias, do mais antigo até hoje. */
export function ultimosDias(n: number): string[] {
  const hoje = new Date();
  return Array.from({ length: n }, (_, i) => {
    const dia = new Date(hoje);
    dia.setDate(hoje.getDate() - (n - 1 - i));
    return diaIso(dia);
  });
}

/**
 * Dias seguidos com treino até hoje, ou até ontem se hoje ainda não treinou:
 * a sequência só quebra quando passa um dia inteiro sem treino.
 */
export function diasSeguidos(treinados: Set<string>): number {
  const dia = new Date();
  if (!treinados.has(diaIso(dia))) dia.setDate(dia.getDate() - 1);
  let seguidos = 0;
  while (treinados.has(diaIso(dia))) {
    seguidos += 1;
    dia.setDate(dia.getDate() - 1);
  }
  return seguidos;
}

/** Dias com treino nos últimos `dias` dias. null enquanto carrega; "erro" se não veio. */
export function useDiasTreinados(username: string | undefined, dias: number): Set<string> | "erro" | null {
  const [treinados, setTreinados] = useState<Set<string> | "erro" | null>(null);
  useEffect(() => {
    if (!username) return;
    let ativo = true;
    apiGet<{ dias: string[] }>(`/usuarios/${username}/treinos?dias=${dias}`)
      .then(({ dias: lista }) => ativo && setTreinados(new Set(lista)))
      .catch(() => ativo && setTreinados("erro"));
    return () => {
      ativo = false;
    };
  }, [username, dias]);
  return treinados;
}

/**
 * Se quem está logado já tem treino hoje: o 2º treino do dia não soma força nem
 * dia na granja. null enquanto carrega.
 */
export function useTreineiHoje(): boolean | null {
  const eu = useEu();
  const treinados = useDiasTreinados(eu?.username, 1);
  if (treinados === null) return null;
  // se a consulta falhar, segue como se não tivesse treinado: o botão de registrar continua lá
  return treinados instanceof Set && treinados.has(diaIso(new Date()));
}
