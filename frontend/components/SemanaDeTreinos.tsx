"use client";

import { useEffect, useState } from "react";

import { Card } from "@/components/Card";
import { apiGet } from "@/lib/api";

const LETRAS = ["S", "T", "Q", "Q", "S", "S", "D"];
const NOMES_DOS_DIAS = ["segunda", "terça", "quarta", "quinta", "sexta", "sábado", "domingo"];

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

/** Os dias treinados nesta semana (segunda a domingo, a mesma semana da Granja). */
export function SemanaDeTreinos({ username, titulo = "Esta semana" }: { username: string; titulo?: string }) {
  // null enquanto carrega; "erro" se a lista não veio, para não mostrar 0 dias como verdade.
  const [treinados, setTreinados] = useState<Set<string> | "erro" | null>(null);
  const semana = semanaAtual();
  const hoje = diaIso(new Date());

  useEffect(() => {
    apiGet<{ dias: string[] }>(`/usuarios/${username}/treinos?dias=7`)
      .then(({ dias }) => setTreinados(new Set(dias)))
      .catch(() => setTreinados("erro"));
  }, [username]);

  const carregou = treinados instanceof Set;
  const total = carregou ? semana.filter((d) => treinados.has(d)).length : null;

  return (
    <Card escuro>
      <div className="space-y-3">
        <p className="font-titulo text-2xl tracking-wide">
          {titulo}:{" "}
          {treinados === "erro"
            ? "não deu para carregar"
            : total === null
              ? "…"
              : `${total} ${total === 1 ? "dia" : "dias"}`}
        </p>
        <ol className="flex justify-between gap-1" aria-label="Dias com treino nesta semana">
          {semana.map((dia, i) => {
            const treinou = carregou && treinados.has(dia);
            return (
              <li key={dia} className="flex flex-col items-center gap-1 text-xs">
                <span
                  aria-label={`${NOMES_DOS_DIAS[i]}, ${Number(dia.slice(8))}: ${treinou ? "treinou" : "sem treino"}`}
                  className={`flex size-9 items-center justify-center rounded-full font-semibold ${
                    treinou ? "bg-destaque text-tinta" : "border border-suave text-suave"
                  } ${dia === hoje ? "ring-2 ring-destaque ring-offset-2 ring-offset-superficie-escura" : ""}`}
                >
                  {LETRAS[i]}
                </span>
              </li>
            );
          })}
        </ol>
        <p className="text-sm text-suave">Vários treinos no mesmo dia contam um dia só. A semana zera na segunda.</p>
      </div>
    </Card>
  );
}
