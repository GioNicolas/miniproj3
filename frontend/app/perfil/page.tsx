"use client";

import { Carregando } from "@/components/Carregando";
import { Perfil } from "@/components/Perfil";
import { useEu } from "@/lib/eu";

// A aba "Meu frango" da Navbar: o próprio perfil, sem trocar a URL (a aba fica marcada).
export default function MeuPerfilPage() {
  const eu = useEu();
  return eu ? <Perfil username={eu.username} /> : <Carregando />;
}
