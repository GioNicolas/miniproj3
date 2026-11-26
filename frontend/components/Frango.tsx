// O Frango (#11): o avatar que fica forte com a constância e murcha quando você some.
// O desenho é provisório, em SVG, até a arte da #8 entrar; as cores são as das patentes
// do canvas (as mesmas de --color-patente-* do PR de identidade).

import type { Frango as EstadoFrango } from "@/lib/api";
import type { Patente } from "@/lib/glossario";

export const COR_DA_PATENTE: Record<Patente, string> = {
  Pintinho: "#f2d06b",
  Frango: "#e9cfa4",
  Galo: "#e38a3e",
  Monstro: "#e0704a",
};

const ESCALA: Record<Patente, number> = { Pintinho: 0.72, Frango: 0.84, Galo: 0.94, Monstro: 1 };

/** O bicho em si. `definhando` deixa ele cinza e de cabeça baixa. */
export function DesenhoDoFrango({ patente, definhando, tamanho = 96 }: { patente: Patente; definhando: boolean; tamanho?: number }) {
  const cor = COR_DA_PATENTE[patente];
  const crista = patente === "Galo" || patente === "Monstro";
  return (
    <svg
      viewBox="0 0 100 100"
      width={tamanho}
      height={tamanho}
      aria-hidden
      className={definhando ? "grayscale opacity-70" : ""}
    >
      <g transform={`translate(50 96) scale(${ESCALA[patente]}) translate(-50 -96)`}>
        {/* pernas */}
        <path d="M42 80 L40 94 M58 80 L60 94 M36 94 h8 M56 94 h8" stroke="#c8641c" strokeWidth="3" strokeLinecap="round" fill="none" />
        {/* corpo */}
        <ellipse cx="50" cy="64" rx={patente === "Monstro" ? 28 : 24} ry="20" fill={cor} stroke="#1b1b1b" strokeWidth="2.5" />
        {/* asa: no Monstro vira braço flexionado */}
        {patente === "Monstro" ? (
          <path d="M28 62 q-12 -4 -10 -18 q8 -2 12 6" fill={cor} stroke="#1b1b1b" strokeWidth="2.5" strokeLinejoin="round" />
        ) : (
          <path d="M36 60 q10 14 24 6" fill="none" stroke="#1b1b1b" strokeWidth="2.5" strokeLinecap="round" />
        )}
        {/* cabeça (cai para o lado quando definha) */}
        <g transform={definhando ? "rotate(28 62 50)" : undefined}>
          {crista && <path d="M56 22 q3 -9 8 -2 q4 -8 8 0 q5 -5 5 4 z" fill="#d43a2a" stroke="#1b1b1b" strokeWidth="2" strokeLinejoin="round" />}
          <circle cx="64" cy="36" r="14" fill={cor} stroke="#1b1b1b" strokeWidth="2.5" />
          {patente === "Monstro" && <path d="M51 30 h26" stroke="#d43a2a" strokeWidth="4" />}
          {definhando ? (
            <path d="M66 32 l5 5 M71 32 l-5 5" stroke="#1b1b1b" strokeWidth="2" strokeLinecap="round" />
          ) : (
            <circle cx="69" cy="34" r="2.4" fill="#1b1b1b" />
          )}
          <path d="M77 37 l9 3 l-9 4 z" fill="#f0a020" stroke="#1b1b1b" strokeWidth="1.5" strokeLinejoin="round" />
        </g>
        {definhando && <path d="M80 18 q3 6 0 8 q-3 -2 0 -8 z" fill="#7fb3e0" />}
      </g>
    </svg>
  );
}

function frase(frango: EstadoFrango, souEu: boolean): string {
  const { dias_sem_treinar: dias, definhando, proximo_nivel, falta_para_proximo } = frango;
  if (dias === null) return souEu ? "Registre o primeiro treino e o seu frango começa a crescer." : "Ainda não registrou nenhum treino.";
  if (definhando) {
    return souEu
      ? `Definhando há ${dias - 1} ${dias - 1 === 1 ? "dia" : "dias"}: cada dia sem treino tira 5 de força. Treina hoje!`
      : `Sumiu há ${dias} dias e o frango está definhando.`;
  }
  if (!proximo_nivel) return "Patente máxima. Agora é manter a constância.";
  return `Faltam ${falta_para_proximo} de força para virar ${proximo_nivel}.`;
}

/** O cartão do frango no perfil: desenho, patente, barra de força e o que falta. */
export function CartaoDoFrango({ frango, souEu }: { frango: EstadoFrango; souEu: boolean }) {
  const cor = COR_DA_PATENTE[frango.nivel];
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-superficie-2 p-3">
      <DesenhoDoFrango patente={frango.nivel} definhando={frango.definhando} />
      <div className="min-w-0 flex-1 space-y-2">
        <p className="flex flex-wrap items-baseline gap-x-2">
          <span className="text-2xl font-bold leading-none tracking-[-0.02em]">{frango.nivel}</span>
          {frango.definhando && <span className="text-sm font-semibold text-brasa">definhando</span>}
        </p>
        <div
          role="meter"
          aria-label="Força do frango"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={frango.forca}
          className="relative h-3 overflow-hidden rounded-full bg-elevado"
        >
          <div className="h-full rounded-full transition-[width]" style={{ width: `${frango.forca}%`, background: cor }} />
          {[25, 50, 75].map((marco) => (
            <span key={marco} className="absolute top-0 h-full w-px bg-superficie" style={{ left: `${marco}%` }} />
          ))}
        </div>
        <p className="text-sm text-suave">
          <span className="font-semibold text-tinta">{frango.forca}/100 de força.</span> {frase(frango, souEu)}
        </p>
      </div>
    </div>
  );
}

/** Selo pequeno com a patente, ao lado do nome nos posts. */
export function SeloDaPatente({ patente }: { patente: Patente }) {
  return (
    <span
      className="shrink-0 whitespace-nowrap rounded px-1.5 py-px text-xs font-bold text-sobre-destaque"
      style={{ background: COR_DA_PATENTE[patente] }}
    >
      {patente}
    </span>
  );
}
