"use client";

// As skills que a pessoa já dominou na árvore (#10), no perfil (#3).

import Link from "next/link";
import { useEffect, useState } from "react";

import { apiGet, type SkillDominada } from "@/lib/api";
import { TOTAL_DE_SKILLS, TRILHAS } from "@/lib/progressoes";

export function SkillsDominadas({ username, souEu }: { username: string; souEu: boolean }) {
  const [skills, setSkills] = useState<SkillDominada[] | null>(null);
  const [falhou, setFalhou] = useState(false);

  useEffect(() => {
    setSkills(null);
    setFalhou(false);
    apiGet<SkillDominada[]>(`/usuarios/${username}/progressoes`)
      .then(setSkills)
      .catch(() => setFalhou(true));
  }, [username]);

  // Sem a lista o perfil continua de pé: a seção só some.
  if (falhou || !skills) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-titulo text-3xl tracking-wide">Skills dominadas</h2>
        <span className="text-sm text-suave">
          {skills.length} de {TOTAL_DE_SKILLS}
        </span>
      </div>

      {skills.length === 0 ? (
        <p className="text-sm text-suave">
          {souEu ? "Nenhuma ainda. Marque na árvore o que você já faz." : "Ainda não marcou nenhuma skill na árvore."}
        </p>
      ) : (
        <ul className="space-y-2">
          {TRILHAS.map(({ nome: trilha }) => {
            const daTrilha = skills.filter((s) => s.trilha === trilha);
            if (daTrilha.length === 0) return null;
            return (
              <li key={trilha} className="flex flex-wrap items-center gap-1.5">
                <span className="w-20 shrink-0 text-xs font-semibold uppercase tracking-wider text-suave">{trilha}</span>
                {daTrilha.map((s) => (
                  <span key={s.codigo} className="rounded-full border border-borda bg-superficie px-2.5 py-1 text-sm">
                    {s.nome}
                  </span>
                ))}
              </li>
            );
          })}
        </ul>
      )}

      {souEu && (
        <Link href="/treinos" className="inline-block min-h-11 py-2 text-sm font-semibold text-destaque-texto hover:underline">
          Ver a árvore e o próximo passo
        </Link>
      )}
    </section>
  );
}
