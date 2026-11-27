// Os 4 frangos em fila, do Pintinho ao Monstro, crescendo: a primeira coisa que
// aparece no login e no cadastro, para o nicho estar na tela antes do formulário.

import type { CSSProperties } from "react";

import { ArteDoFrango } from "@/components/Frango";
import { PATENTES, type Patente } from "@/lib/glossario";

// altura no celular; no computador (md) cada um cresce 30%
const ALTURA: Record<Patente, number> = { Pintinho: 36, Frango: 46, Galo: 58, Monstro: 70 };

export function FilaDosFrangos() {
  return (
    <ol aria-label="Seu frango cresce do Pintinho ao Monstro" className="flex items-end gap-3 md:gap-4">
      {PATENTES.map((p, i) => (
        <li
          key={p}
          className="animate-subir md:[&>img]:!h-[var(--altura-md)]"
          style={{ animationDelay: `${i * 70}ms`, "--altura-md": `${Math.round(ALTURA[p] * 1.3)}px` } as CSSProperties}
        >
          <ArteDoFrango patente={p} altura={ALTURA[p]} />
        </li>
      ))}
    </ol>
  );
}
