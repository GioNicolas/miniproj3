// Os 4 frangos em fila, do Pintinho ao Monstro: a primeira coisa que aparece no
// login e no cadastro, para o nicho estar na tela antes de qualquer formulário.

import { ArteDoFrango, TEXTO_DA_PATENTE } from "@/components/Frango";
import { PATENTES, type Patente } from "@/lib/glossario";

const ALTURA_COMPACTA: Record<Patente, number> = { Pintinho: 36, Frango: 46, Galo: 58, Monstro: 70 };
const ALTURA_LARGA: Record<Patente, number> = { Pintinho: 72, Frango: 96, Galo: 124, Monstro: 152 };

/** A fila em si: crescendo da esquerda para a direita. `larga` mostra o nome de cada patente. */
export function FilaDosFrangos({ larga = false }: { larga?: boolean }) {
  const alturas = larga ? ALTURA_LARGA : ALTURA_COMPACTA;
  return (
    <ol aria-label="As 4 patentes do frango: Pintinho, Frango, Galo e Monstro" className={`flex items-end ${larga ? "gap-6" : "gap-3"}`}>
      {PATENTES.map((p, i) => (
        <li key={p} className="flex animate-subir flex-col items-center gap-2" style={{ animationDelay: `${i * 70}ms` }}>
          <ArteDoFrango patente={p} altura={alturas[p]} />
          {larga && (
            <span className="text-[13px] font-bold" style={{ color: TEXTO_DA_PATENTE[p] }}>
              {p}
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}

/** Coluna da esquerda do login e do cadastro no computador (lg): a fila e como o frango cresce. */
export function VitrineDosFrangos() {
  return (
    <section aria-label="Como o seu frango cresce" className="hidden flex-col gap-8 lg:flex">
      <FilaDosFrangos larga />
      <div className="flex max-w-md flex-col gap-3">
        <h2 className="text-[28px] font-bold leading-[1.15] tracking-[-0.02em] text-balance">Do Pintinho ao Monstro, um treino por vez</h2>
        <p className="text-[15px] leading-normal text-pretty text-suave">
          Cada treino registrado dá +10 de força pro seu frango. Some por mais de um dia e ele começa a definhar.
        </p>
        <p className="text-[15px] leading-normal text-pretty text-suave">
          Toda semana, a granja compara quem treinou em mais dias entre você e quem você segue.
        </p>
      </div>
    </section>
  );
}
