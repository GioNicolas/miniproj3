"use client";

import { useEffect, useState } from "react";

import { apiGet, type User } from "@/lib/api";

// Quem está logado, buscado uma vez por carregamento de página e dividido entre
// todos os componentes. O `sair()` recarrega a página, então o cache some junto.
let pedido: Promise<User> | null = null;

export function useEu(): User | null {
  const [eu, setEu] = useState<User | null>(null);

  useEffect(() => {
    pedido ??= apiGet<User>("/auth/eu");
    let ativo = true;
    pedido.then((u) => ativo && setEu(u)).catch(() => (pedido = null));
    return () => {
      ativo = false;
    };
  }, []);

  return eu;
}
