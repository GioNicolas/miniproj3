"use client";

import { useEffect, useState } from "react";

import { Card } from "@/components/Card";
import { Carregando } from "@/components/Carregando";
import { ListaDePosts } from "@/components/ListaDePosts";
import { NovoPost } from "@/components/NovoPost";
import { apiGet, type Page, type User } from "@/lib/api";
import { useEu } from "@/lib/eu";

type Aba = "seguindo" | "explorar";

const ABAS: { id: Aba; rotulo: string }[] = [
  { id: "seguindo", rotulo: "Seguindo" },
  { id: "explorar", rotulo: "Explorar" },
];

export default function Home() {
  const eu = useEu();
  // null até saber se a pessoa segue alguém: quem não segue ninguém abre no Explorar.
  const [sigoAlguem, setSigoAlguem] = useState<boolean | null>(null);
  const [aba, setAba] = useState<Aba>("seguindo");
  // muda a cada post novo para a lista recarregar e mostrar o post no topo
  const [versao, setVersao] = useState(0);

  useEffect(() => {
    if (!eu) return;
    apiGet<Page<User>>(`/usuarios/${eu.username}/seguindo?limit=1`)
      .then((pagina) => {
        setSigoAlguem(pagina.total > 0);
        setAba(pagina.total > 0 ? "seguindo" : "explorar");
      })
      // se a contagem falhar, o feed ainda funciona: abre em Seguindo
      .catch(() => setSigoAlguem(true));
  }, [eu]);

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

        {sigoAlguem === null ? (
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
                <p className="text-sm">Você ainda não segue nenhum frango: olha o que a galera tá treinando.</p>
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
