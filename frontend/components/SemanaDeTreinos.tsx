"use client";

import { diaIso, LETRAS_DA_SEMANA, NOMES_DOS_DIAS, semanaAtual } from "@/lib/dias";

/**
 * Os 7 dias desta semana (segunda a domingo, a mesma da Granja), igual ao canvas:
 * quadrado "feito" com check nos dias treinados e borda tracejada preta em hoje.
 */
export function SemanaDeTreinos({ treinados }: { treinados: Set<string> | "erro" | null }) {
  const semana = semanaAtual();
  const hoje = diaIso(new Date());
  const carregou = treinados instanceof Set;

  return (
    <ol aria-label="Dias com treino nesta semana" className="grid grid-cols-7 gap-2">
      {semana.map((dia, i) => {
        const treinou = carregou && treinados.has(dia);
        const ehHoje = dia === hoje;
        return (
          <li key={dia} className="flex flex-col items-center gap-1">
            <span aria-hidden="true" className={`text-xs ${ehHoje ? "font-bold text-destaque" : "text-suave"}`}>
              {LETRAS_DA_SEMANA[i]}
            </span>
            <span
              aria-label={`${NOMES_DOS_DIAS[i]}, ${Number(dia.slice(8))}: ${treinou ? "treinou" : "sem treino"}${ehHoje ? " (hoje)" : ""}`}
              className={`flex aspect-square w-full items-center justify-center rounded-lg ${treinou ? "bg-destaque-fundo" : "bg-superficie-2"} ${
                ehHoje ? "border-2 border-dashed border-destaque" : ""
              }`}
            >
              {treinou && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-destaque">
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
              )}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
