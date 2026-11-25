// Progressões que dá para escolher no registro de treino, por trilha.
// Lista provisória até o catálogo da árvore (#10) entrar: quando ele vier, esta
// lista passa a ser lida de lá. Os códigos são os mesmos que o backend guarda.

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

const NOMES = new Map(TRILHAS.flatMap((t) => t.progressoes.map((p) => [p.codigo, p.nome] as const)));

/** Nome legível de um código; códigos fora da lista viram "barra negativa" a partir de "barra_negativa". */
export function nomeDaProgressao(codigo: string): string {
  return NOMES.get(codigo) ?? codigo.split("_").join(" ");
}
