// O Frango (#11): o avatar que fica forte com a constância e murcha quando você some.
// Artes da #8 em public/frangos/<patente>.png; cores = --color-patente-* do globals.css.

import Link from "next/link";

import type { Frango as EstadoFrango } from "@/lib/api";
import { GLOSSARIO, PATENTES, type Patente } from "@/lib/glossario";

export const COR_DA_PATENTE: Record<Patente, string> = {
  Pintinho: "#f2d06b",
  Frango: "#e9cfa4",
  Galo: "#e38a3e",
  Monstro: "#e0704a",
};

// A mesma cor, escurecida para virar texto legível no fundo claro.
export const TEXTO_DA_PATENTE: Record<Patente, string> = {
  Pintinho: "#9a7300",
  Frango: "#8f6532",
  Galo: "#b0561a",
  Monstro: "#b2401d",
};

// Faixas de força de cada patente (backend/app/core/frango.py).
export const FAIXA_DA_PATENTE: Record<Patente, [number, number]> = {
  Pintinho: [0, 24],
  Frango: [25, 49],
  Galo: [50, 74],
  Monstro: [75, 100],
};

// Onde fica o topo da crista em cada arte, em fração da largura (medido nos PNGs): a coroa do 1º lugar vai ali.
export const CABECA_NA_ARTE: Record<Patente, number> = {
  Pintinho: 0.7,
  Frango: 0.73,
  Galo: 0.55,
  Monstro: 0.6,
};

const ARTE: Record<Patente, string> = {
  Pintinho: "/frangos/pintinho.png",
  Frango: "/frangos/frango.png",
  Galo: "/frangos/galo.png",
  Monstro: "/frangos/monstro.png",
};

/** A arte da patente. `definhando` apaga a cor; `apagada` vira silhueta (patente que ainda não chegou). */
export function ArteDoFrango({
  patente,
  altura,
  definhando = false,
  apagada = false,
  alt = "",
}: {
  patente: Patente;
  altura: number;
  definhando?: boolean;
  apagada?: boolean;
  alt?: string;
}) {
  const filtro = apagada ? "opacity-15 brightness-0" : definhando ? "grayscale-[0.55] brightness-75" : "";
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={ARTE[patente]} alt={alt} style={{ height: altura }} className={`w-auto select-none ${filtro}`} draggable={false} />
  );
}

/** O cartão do frango no perfil, igual ao canvas: arte grande, patente, força, o que falta e a régua. */
export function CartaoDoFrango({ frango, souEu }: { frango: EstadoFrango; souEu: boolean }) {
  const { nivel, forca, definhando, proximo_nivel, falta_para_proximo, dias_sem_treinar } = frango;
  const [de, ate] = FAIXA_DA_PATENTE[nivel];
  const progresso = proximo_nivel ? Math.round(((forca - de) / (ate + 1 - de)) * 100) : 100;
  const atual = PATENTES.indexOf(nivel);

  return (
    <section aria-label="Seu frango" className="flex flex-col items-center gap-4 rounded-[20px] bg-superficie p-4">
      {definhando && (
        <div role="status" className="flex w-full flex-col gap-3 rounded-xl bg-brasa-fundo p-4">
          <p className="flex items-center gap-2 text-base font-bold tracking-[-0.02em] text-brasa">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7.5v5.5M12 16.5h.01" />
            </svg>
            {souEu ? "Seu frango tá definhando" : "Esse frango tá definhando"}
          </p>
          <p className="text-sm leading-snug">
            {dias_sem_treinar} dias sem treinar.{" "}
            {souEu ? "Cada dia a mais tira 5 de força. Treina hoje e ele para de definhar na hora." : "Cada dia a mais tira 5 de força."}
          </p>
          {souEu && (
            <Link
              href="/treinos/registrar"
              className="flex min-h-[52px] items-center justify-center rounded-xl bg-destaque px-4 font-titulo text-[17px] text-sobre-destaque hover:brightness-105"
            >
              {GLOSSARIO.registrarTreino}
            </Link>
          )}
        </div>
      )}

      <ArteDoFrango patente={nivel} altura={232} definhando={definhando} alt={`${souEu ? "Seu frango" : "Frango"}, patente ${nivel}`} />

      <div className="-mt-2 flex flex-col items-center">
        <p className="text-[34px] font-extrabold leading-none tracking-[-0.02em]" style={{ color: TEXTO_DA_PATENTE[nivel] }}>
          {nivel}
        </p>
        <p className="mt-1 flex items-baseline gap-2">
          <span className="font-placar text-[34px] leading-none">{forca}</span>
          <span className="text-[15px] font-semibold text-suave">de força</span>
        </p>
      </div>

      {dias_sem_treinar === null && souEu && (
        <p className="text-center text-sm text-pretty text-suave">Registra o primeiro treino e o seu frango começa a crescer.</p>
      )}

      {proximo_nivel ? (
        <div className="flex w-full flex-col gap-2 border-t border-borda pt-4">
          <p className="flex items-baseline justify-between">
            <span className="text-[13px] text-suave">Faltam {falta_para_proximo} de força pro</span>
            <span className="text-sm font-bold" style={{ color: TEXTO_DA_PATENTE[proximo_nivel] }}>
              {proximo_nivel}
            </span>
          </p>
          <div
            role="progressbar"
            aria-label={`Força até ${proximo_nivel}`}
            aria-valuemin={de}
            aria-valuemax={ate + 1}
            aria-valuenow={forca}
            className="h-3 overflow-hidden rounded-md bg-elevado"
          >
            <div className="h-3 origin-left animate-encher rounded-md bg-tinta" style={{ width: `${progresso}%` }} />
          </div>
          <p className="flex justify-between text-xs text-suave">
            <span>{de}</span>
            <span>{ate + 1}</span>
          </p>
        </div>
      ) : (
        <p className="w-full border-t border-borda pt-4 text-center text-sm text-suave">Patente máxima. Agora é manter a constância.</p>
      )}

      <ol aria-label="As 4 patentes" className="grid w-full grid-cols-4 gap-2 border-t border-borda pt-4">
        {PATENTES.map((p, i) => {
          const estado = i < atual ? "passou" : i === atual ? "atual" : "futuro";
          const [min, max] = FAIXA_DA_PATENTE[p];
          return (
            <li
              key={p}
              aria-current={estado === "atual" ? "step" : undefined}
              className={`flex flex-col items-center gap-1 rounded-xl px-1 py-2 ${estado === "atual" ? "bg-superficie-2" : ""}`}
            >
              <ArteDoFrango patente={p} altura={44} apagada={estado === "futuro"} />
              <span
                className={`text-[13px] font-bold ${estado === "futuro" ? "text-suave" : estado === "passou" ? "text-tinta" : ""}`}
                style={estado === "atual" ? { color: TEXTO_DA_PATENTE[p] } : undefined}
              >
                {p}
              </span>
              <span className="text-xs text-suave">
                {min}–{max}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/** Selo pequeno com a patente, ao lado do nome nos posts e no ranking. */
export function SeloDaPatente({ patente }: { patente: Patente }) {
  return (
    <span
      className="shrink-0 whitespace-nowrap rounded px-1.5 py-px text-xs font-bold text-tinta"
      style={{ background: COR_DA_PATENTE[patente] }}
    >
      {patente}
    </span>
  );
}
