// Progressões que dá para escolher no registro de treino, por trilha.
// Espelha o catálogo de backend/app/core/progressoes.py (#10): mesmos códigos,
// nomes e trilhas. A árvore em /treinos lê o catálogo direto da API.

export type Progressao = { codigo: string; nome: string };

export const TRILHAS: { nome: string; progressoes: Progressao[] }[] = [
  {
    nome: "Puxar",
    progressoes: [
      { codigo: "pendurar_na_barra", nome: "Pendurar na barra" },
      { codigo: "barra_australiana", nome: "Barra australiana" },
      { codigo: "barra_negativa", nome: "Barra negativa" },
      { codigo: "barra_fixa", nome: "Barra fixa" },
      { codigo: "muscle_up", nome: "Muscle-up" },
    ],
  },
  {
    nome: "Empurrar",
    progressoes: [
      { codigo: "flexao_inclinada", nome: "Flexão inclinada" },
      { codigo: "flexao_joelhos", nome: "Flexão com joelhos" },
      { codigo: "flexao", nome: "Flexão" },
      { codigo: "paralela", nome: "Paralela" },
      { codigo: "flexao_pike", nome: "Flexão pike" },
      { codigo: "parada_de_maos_parede", nome: "Parada de mãos na parede" },
    ],
  },
  {
    nome: "Pernas",
    progressoes: [
      { codigo: "agachamento", nome: "Agachamento" },
      { codigo: "afundo", nome: "Afundo" },
      { codigo: "agachamento_bulgaro", nome: "Agachamento búlgaro" },
      { codigo: "pistol_assistido", nome: "Pistol assistido" },
      { codigo: "pistol", nome: "Pistol" },
    ],
  },
  {
    nome: "Core",
    progressoes: [
      { codigo: "prancha", nome: "Prancha" },
      { codigo: "canoa", nome: "Canoa" },
      { codigo: "elevacao_de_joelhos", nome: "Elevação de joelhos" },
      { codigo: "l_sit", nome: "L-sit" },
    ],
  },
];

/**
 * Meta de cada progressão: `treino` é a dose do treino de hoje e `domina` é quando
 * marcar "Já domino". Em `segundos`, as reps são segundos segurando a posição.
 * Valores de partida para iniciante; ajustar aqui muda Treinos, Árvore e Registrar.
 */
export type Meta = { treino: [series: number, reps: number]; domina: [series: number, reps: number]; segundos?: boolean };

export const METAS: Record<string, Meta> = {
  pendurar_na_barra: { treino: [3, 20], domina: [3, 30], segundos: true },
  barra_australiana: { treino: [3, 8], domina: [3, 12] },
  barra_negativa: { treino: [3, 4], domina: [3, 6] },
  barra_fixa: { treino: [3, 4], domina: [3, 8] },
  muscle_up: { treino: [3, 2], domina: [3, 5] },
  flexao_inclinada: { treino: [3, 10], domina: [3, 15] },
  flexao_joelhos: { treino: [3, 10], domina: [3, 15] },
  flexao: { treino: [3, 8], domina: [3, 15] },
  paralela: { treino: [3, 6], domina: [3, 10] },
  flexao_pike: { treino: [3, 8], domina: [3, 12] },
  parada_de_maos_parede: { treino: [3, 20], domina: [3, 45], segundos: true },
  agachamento: { treino: [3, 15], domina: [3, 25] },
  afundo: { treino: [3, 10], domina: [3, 15] },
  agachamento_bulgaro: { treino: [3, 8], domina: [3, 12] },
  pistol_assistido: { treino: [3, 5], domina: [3, 8] },
  pistol: { treino: [3, 3], domina: [3, 6] },
  prancha: { treino: [3, 30], domina: [3, 60], segundos: true },
  canoa: { treino: [3, 20], domina: [3, 40], segundos: true },
  elevacao_de_joelhos: { treino: [3, 8], domina: [3, 15] },
  l_sit: { treino: [3, 10], domina: [3, 20], segundos: true },
};

const META_PADRAO: Meta = { treino: [3, 8], domina: [3, 12] };

export function metaDa(codigo: string): Meta {
  return METAS[codigo] ?? META_PADRAO;
}

/** "3×8" ou "3×30 s" */
export function textoDaDose([series, reps]: [number, number], segundos = false): string {
  return `${series}×${reps}${segundos ? " s" : ""}`;
}

/** O que vai em cada série: "8 reps" ou "30 s". */
export function textoDaSerie(reps: number, segundos = false): string {
  return segundos ? `${reps} s` : `${reps} reps`;
}

const NOMES = new Map(TRILHAS.flatMap((t) => t.progressoes.map((p) => [p.codigo, p.nome] as const)));

/** Nome legível de um código; códigos fora da lista viram "barra negativa" a partir de "barra_negativa". */
export function nomeDaProgressao(codigo: string): string {
  return NOMES.get(codigo) ?? codigo.split("_").join(" ");
}

/** Equipamento que libera parte da árvore (backend: schemas/progressao.py). */
export const EQUIPAMENTOS = [
  { codigo: "barra_fixa", nome: "Barra fixa" },
  { codigo: "paralelas", nome: "Paralelas" },
  { codigo: "elastico", nome: "Elástico" },
] as const;
