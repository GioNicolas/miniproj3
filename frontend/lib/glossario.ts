// Um nome por coisa, igual em todas as telas (issue #8).
// Precisa trocar um texto da rede? Troque aqui e todas as telas acompanham.

export const GLOSSARIO = {
  rede: "Frangaria",
  slogan: "Constância vence força.",
  curtida: "Tamo junto",
  registrarTreino: "Registrar treino",
  ranking: "Granja da semana",
  conversa: "Chat",
  perfil: "Meu frango",
  comprovado: "Comprovado",
} as const;

// Granja é o ranking da semana (e o Papo da granja); nunca nome de patente.
export const PATENTES = ["Pintinho", "Frango", "Galo", "Monstro"] as const;
export type Patente = (typeof PATENTES)[number];
