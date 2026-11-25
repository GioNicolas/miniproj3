"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { ROTAS_PUBLICAS } from "@/lib/sessao";

// Guarda de rota (guia 01, Passo 6), aplicada uma vez só no layout: toda página
// que não está em ROTAS_PUBLICAS exige login, inclusive as que ainda vão nascer.
// Só confere se existe token; token que deixou de valer é tratado no lib/api.ts (401).
export function GuardaDeRota({ children }: { children: React.ReactNode }) {
  const caminho = usePathname();
  const router = useRouter();
  const publica = ROTAS_PUBLICAS.includes(caminho);
  const [logado, setLogado] = useState(false);

  useEffect(() => {
    if (publica) return;
    if (localStorage.getItem("token")) setLogado(true);
    else router.replace("/login");
  }, [publica, caminho, router]);

  // Página privada só aparece depois de confirmar o token: evita piscar a tela sem login.
  if (!publica && !logado) return null;
  return <>{children}</>;
}
