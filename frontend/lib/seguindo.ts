"use client";

// Quem eu sigo, compartilhado pela página toda. Seguir alguém num post esconde o
// botão em todos os posts da mesma pessoa e avisa a home, sem recarregar nada.

import { useEffect, useSyncExternalStore } from "react";

import { apiDelete, apiGet, apiPost, type Page, type User } from "@/lib/api";
import { useEu } from "@/lib/eu";

const POR_PAGINA = 100; // o máximo que GET /usuarios/{username}/seguindo aceita

let sigo: ReadonlySet<string> | null = null;
let pedido: Promise<void> | null = null;
const ouvintes = new Set<() => void>();

function trocar(novo: ReadonlySet<string>) {
  sigo = novo;
  ouvintes.forEach((avisar) => avisar());
}

async function carregar(eu: string) {
  const nomes = new Set<string>();
  for (let offset = 0; ; offset += POR_PAGINA) {
    const pagina = await apiGet<Page<User>>(`/usuarios/${eu}/seguindo?offset=${offset}&limit=${POR_PAGINA}`);
    pagina.items.forEach((u) => nomes.add(u.username));
    if (offset + POR_PAGINA >= pagina.total) break;
  }
  trocar(nomes);
}

function ouvir(avisar: () => void) {
  ouvintes.add(avisar);
  return () => {
    ouvintes.delete(avisar);
  };
}

/** Usernames que eu sigo; null enquanto carrega. */
export function useSeguindo(): ReadonlySet<string> | null {
  const eu = useEu();
  useEffect(() => {
    if (!eu) return;
    // Se a lista falhar, segue como se eu não seguisse ninguém: o pior caso é
    // aparecer "Seguir" para quem eu já sigo, e o follow é idempotente.
    pedido ??= carregar(eu.username).catch(() => trocar(new Set()));
  }, [eu]);
  return useSyncExternalStore(ouvir, () => sigo, () => null);
}

export async function seguir(username: string) {
  await apiPost(`/usuarios/${username}/follow`);
  trocar(new Set(sigo).add(username));
}

export async function deixarDeSeguir(username: string) {
  await apiDelete(`/usuarios/${username}/follow`);
  const novo = new Set(sigo);
  novo.delete(username);
  trocar(novo);
}
