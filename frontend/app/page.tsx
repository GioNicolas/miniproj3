"use client";

import Link from "next/link";
import { useState } from "react";

import { Card } from "@/components/Card";
import { Carregando } from "@/components/Carregando";
import { ListaDePosts } from "@/components/ListaDePosts";
import { NovoPost } from "@/components/NovoPost";
import { GLOSSARIO } from "@/lib/glossario";
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
    <div className="flex flex-col gap-4">
      {/* Chamada do dia: o único botão de milho do feed */}
      <Card className="flex flex-col gap-4">
        <div>
          <h1 className="text-[17px] font-bold leading-tight tracking-[-0.02em]">Treinou hoje? Conta pra granja.</h1>
          <p className="mt-1 text-[13px] text-suave">Vale 1 dia na granja e +10 de força.</p>
        </div>
        <Link
          href="/treinos/registrar"
          className="flex min-h-[52px] items-center justify-center rounded-xl bg-destaque px-4 font-titulo text-[17px] text-sobre-destaque transition-[transform,filter] duration-150 ease-out hover:brightness-105 active:scale-[0.97] motion-reduce:transition-none"
        >
          {GLOSSARIO.registrarTreino}
        </Link>
      </Card>

      <NovoPost onCriado={() => setVersao((v) => v + 1)} />

      <section className="flex flex-col gap-4">
        {/* Controle segmentado: a aba escolhida fica preenchida (elevado) */}
        <div role="tablist" aria-label="O que mostrar" className="grid grid-cols-2 gap-1 rounded-[10px] bg-superficie p-1">
          {ABAS.map(({ id, rotulo }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={aba === id}
              onClick={() => setAba(id)}
              className={`min-h-11 rounded-lg text-sm transition-colors ${
                aba === id ? "bg-elevado font-semibold text-tinta" : "font-medium text-suave hover:text-tinta"
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
                : {
                    titulo: "Você ainda não segue ninguém",
                    texto: "Segue quem treina perto e os treinos aparecem aqui. Enquanto isso, o Explorar mostra o que a galera tá treinando.",
                  }
            }
          />
        ) : (
          <>
            <p className="text-[13px] text-pretty text-suave">
              {sigoAlguem
                ? "Os posts mais novos da rede toda."
                : "Você ainda não segue ninguém: olha o que a galera tá treinando e toca em Seguir em quem treina parecido com você."}
            </p>
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
