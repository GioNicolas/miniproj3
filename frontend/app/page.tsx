"use client";

import { useState } from "react";

import { Card } from "@/components/Card";
import { Carregando } from "@/components/Carregando";
import { ListaDePosts } from "@/components/ListaDePosts";
import { NovoPost } from "@/components/NovoPost";
import { useSeguindo } from "@/lib/seguindo";

type Aba = "seguindo" | "explorar";

const ABAS: { id: Aba; rotulo: string }[] = [
  { id: "seguindo", rotulo: "Seguindo" },
  { id: "explorar", rotulo: "Explorar" },
];

export default function Home() {
  const sigo = useSeguindo();
  const sigoAlguem = sigo === null ? null : sigo.size > 0;
  // A aba inicial sai da primeira resposta e depois fica: quem segue alguém pelo
  // Explorar continua no Explorar para seguir mais gente.
  const [aba, setAba] = useState<Aba | null>(null);
  if (aba === null && sigoAlguem !== null) setAba(sigoAlguem ? "seguindo" : "explorar");
  // muda a cada post novo para a lista recarregar e mostrar o post no topo
  const [versao, setVersao] = useState(0);

  return (
    <div className="space-y-6">
      <NovoPost onCriado={() => setVersao((v) => v + 1)} />

      <section className="space-y-3">
        <div role="tablist" aria-label="O que mostrar" className="flex gap-6 border-b border-borda">
          {ABAS.map(({ id, rotulo }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={aba === id}
              onClick={() => setAba(id)}
              className={`-mb-px min-h-11 border-b-2 font-titulo text-2xl tracking-wide ${
                aba === id ? "border-destaque text-tinta" : "border-transparent text-suave hover:text-tinta"
              }`}
            >
              {rotulo}
            </button>
          ))}
        </div>

        {aba === null ? (
          <Carregando />
        ) : aba === "seguindo" ? (
          <ListaDePosts
            key={`seguindo-${versao}`}
            caminho="/feed"
            vazio={
              sigoAlguem
                ? { titulo: "Nada por aqui ainda", texto: "Quem você segue ainda não contou o treino. Que tal contar o seu?" }
                : { titulo: "Você ainda não segue ninguém", texto: "Dá uma olhada no Explorar e segue quem treina parecido com você." }
            }
          />
        ) : (
          <>
            {!sigoAlguem && (
              <Card escuro>
                <p className="text-sm">Você ainda não segue nenhum frango: olha o que a galera tá treinando e toca em Seguir.</p>
              </Card>
            )}
            <ListaDePosts
              key={`explorar-${versao}`}
              caminho="/explorar"
              vazio={{ titulo: "Ninguém postou ainda", texto: "Que tal ser o primeiro a contar o treino de hoje?" }}
            />
          </>
        )}
      </section>
    </div>
  );
}
