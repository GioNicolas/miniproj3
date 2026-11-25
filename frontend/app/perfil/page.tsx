"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card } from "@/components/Card";
import { Carregando } from "@/components/Carregando";
import { Erro } from "@/components/Erro";
import { EstadoVazio } from "@/components/EstadoVazio";
import { apiGet, type User } from "@/lib/api";

type Dominada = { codigo: string; nome: string; trilha: string };
export default function PerfilPage() {
  const [dados, setDados] = useState<{ user: User; dominadas: Dominada[] } | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  useEffect(() => {
    apiGet<User>("/auth/eu").then(async user => ({ user, dominadas: await apiGet<Dominada[]>(`/usuarios/${encodeURIComponent(user.username)}/progressoes`) })).then(setDados).catch(e => setErro(e instanceof Error ? e.message : "N?o foi poss?vel carregar o perfil."));
  }, []);
  if (erro) return <Erro>{erro}</Erro>;
  if (!dados) return <Carregando texto="Carregando perfil?" />;
  return <div className="space-y-6"><h1 className="font-titulo text-4xl">Perfil</h1>
    <Card><h2 className="text-xl font-semibold">{dados.user.name}</h2><p className="text-suave">@{dados.user.username}</p>{dados.user.bio && <p>{dados.user.bio}</p>}</Card>
    <section className="space-y-3"><h2 className="font-titulo text-3xl">Progress?es dominadas</h2>
      {dados.dominadas.length ? <Card><ul className="space-y-2">{dados.dominadas.map(p => <li key={p.codigo}>{p.nome} <span className="text-sm text-suave">? {p.trilha}</span></li>)}</ul></Card> : <EstadoVazio titulo="Ainda sem progress?es dominadas" texto="Comece pela ?rvore de treinos." acao={<Link href="/treinos" className="inline-flex min-h-11 items-center underline">Ver ?rvore</Link>} />}
    </section></div>;
}
