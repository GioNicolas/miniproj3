// Frases da Granja da Semana usadas fora da tela da Granja (treino registrado, coluna do feed).

import type { Granja } from "@/lib/api";

/** Quem está logo à frente e quanto falta, já tratando empate ("Empatado com Caio..."). */
export function fraseDaDisputa({ eu, alvo }: Pick<Granja, "eu" | "alvo">): string {
  if (!alvo) return "Ninguém na sua frente essa semana.";
  const quem = alvo.usuario.name.split(" ")[0];
  // empate: a ordem é a do @ (regra da Granja); 1 dia a mais e você passa na frente
  if (alvo.dias_treinados === eu.dias_treinados) return `Empatado com ${quem}. Mais 1 dia e você passa na frente.`;
  return `Mais ${alvo.faltam_dias} ${alvo.faltam_dias === 1 ? "dia" : "dias"} e você passa ${quem}.`;
}
