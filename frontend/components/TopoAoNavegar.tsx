"use client";

// Toda troca de tela começa no topo da janela, com a marca e o título da aba à vista.
// O Next rola só até o começo do conteúdo novo, que fica abaixo do cabeçalho, então
// a página nova podia abrir com o FRANGYM e o título escondidos.

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function TopoAoNavegar() {
  const caminho = usePathname();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [caminho]);
  return null;
}
