"use client";

import { useState } from "react";

import { Card } from "@/components/Card";
import { ListaDePosts } from "@/components/ListaDePosts";
import { NovoPost } from "@/components/NovoPost";

export default function Home() {
  // muda a cada post novo para a lista recarregar e mostrar o post no topo
  const [versao, setVersao] = useState(0);

  return (
    <div className="space-y-6">
      <NovoPost onCriado={() => setVersao((v) => v + 1)} />
      <section className="space-y-3">
        <Card escuro>
          <p className="font-titulo text-2xl tracking-wide text-destaque">Explorar</p>
          <p className="text-sm">Você ainda não segue nenhum frango: olha o que a galera tá treinando.</p>
        </Card>
        <ListaDePosts
          key={versao}
          caminho="/explorar"
          vazio={{
            titulo: "Ninguém postou ainda",
            texto: "Que tal ser o primeiro a contar o treino de hoje?",
          }}
        />
      </section>
    </div>
  );
}
