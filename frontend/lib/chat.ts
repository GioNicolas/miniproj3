"use client";

// Peças do chat usadas em mais de um lugar: título da conversa, abrir conversa
// com alguém e o aviso de não lidas da Navbar.

import { useEffect, useSyncExternalStore } from "react";

import { apiGet, apiPost, type Autor, type Conversa } from "@/lib/api";

/** Os outros participantes: quem está logado não aparece no próprio chat. */
export function outros(conversa: Conversa, eu: string | undefined): Autor[] {
  return conversa.participantes.filter((p) => p.username !== eu);
}

/** Nome do grupo; sem nome, os primeiros nomes de quem está na conversa. */
export function tituloDaConversa(conversa: Conversa, eu: string | undefined): string {
  if (conversa.nome) return conversa.nome;
  const nomes = outros(conversa, eu).map((p) => (conversa.direta ? p.name : p.name.split(" ")[0]));
  if (nomes.length <= 1) return nomes[0] ?? "Conversa";
  return `${nomes.slice(0, -1).join(", ")} e ${nomes.at(-1)}`;
}

/**
 * Abre (ou cria) a conversa. Com um username só é a conversa direta: se ela já
 * existe, o backend devolve a mesma. Para um botão "Mandar mensagem" em outra
 * tela, basta um link para /chat?com=<username>.
 */
export function abrirConversa(usernames: string[], nome?: string): Promise<Conversa> {
  return apiPost<Conversa>("/conversas", { participantes: usernames, nome: nome?.trim() || null });
}

// ---- aviso de não lidas (Navbar) ----

const INTERVALO_MS = 15_000;

let naoLidas = 0;
const ouvintes = new Set<() => void>();

/** Busca de novo o total. A conversa aberta chama isto depois de ler mensagens. */
export async function atualizarNaoLidas() {
  try {
    const { total } = await apiGet<{ total: number }>("/conversas/nao-lidas");
    if (total === naoLidas) return;
    naoLidas = total;
    ouvintes.forEach((avisar) => avisar());
  } catch {
    // Sem rede ou sem login: o aviso só some, a tela segue funcionando.
  }
}

function ouvir(avisar: () => void) {
  ouvintes.add(avisar);
  return () => {
    ouvintes.delete(avisar);
  };
}

/** Total de mensagens não lidas; confere a cada 15 s com a aba visível e a cada troca de página. */
export function useNaoLidas(ligado: boolean, caminho: string): number {
  useEffect(() => {
    if (!ligado || !localStorage.getItem("token")) return;
    atualizarNaoLidas();
    const id = setInterval(() => {
      if (document.visibilityState === "visible") atualizarNaoLidas();
    }, INTERVALO_MS);
    return () => clearInterval(id);
  }, [ligado, caminho]);
  return useSyncExternalStore(ouvir, () => naoLidas, () => 0);
}
