const UNIDADES: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 3600],
  ["month", 30 * 24 * 3600],
  ["day", 24 * 3600],
  ["hour", 3600],
  ["minute", 60],
];

const relativo = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" });

// "há 5 minutos", "ontem": usado em posts e comentários.
export function tempoRelativo(iso: string): string {
  const segundos = Math.round((new Date(iso).getTime() - Date.now()) / 1000);
  for (const [unidade, tamanho] of UNIDADES) {
    if (Math.abs(segundos) >= tamanho) {
      return relativo.format(Math.round(segundos / tamanho), unidade);
    }
  }
  return "agora";
}
