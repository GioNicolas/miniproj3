"use client";

import { useState } from "react";

import { ListaDePosts } from "@/components/ListaDePosts";
import { NovoPost } from "@/components/NovoPost";

export default function Home() {
  // muda a cada post novo para a lista recarregar e mostrar o post no topo
  const [versao, setVersao] = useState(0);

  return (
    <div className="space-y-6">
      <NovoPost onCriado={() => setVersao((v) => v + 1)} />
      <section className="space-y-3">
        <p className="rounded border bg-white p-3 text-sm text-zinc-600">
          Você ainda não segue nenhum frango: olha o que a galera tá treinando.
        </p>
        <ListaDePosts
          key={versao}
          caminho="/explorar"
          vazio="Ninguém postou ainda. Que tal ser o primeiro a contar o treino de hoje?"
        />
      </section>
    </div>
  );
}
