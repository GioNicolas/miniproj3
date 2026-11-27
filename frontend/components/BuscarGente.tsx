"use client";

// Busca de gente pra seguir (o "Chamar mais gente pra granja" da Granja, como a
// tela "Achar gente" do canvas). A rede é pequena: a lista de usuários vem uma vez
// e o filtro roda aqui, por nome ou @, sem acento e sem diferença de maiúscula.

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Avatar } from "@/components/Avatar";
import { BotaoSeguir } from "@/components/BotaoSeguir";
import { Campo } from "@/components/Campo";
import { apiGet, type Page, type User } from "@/lib/api";
import { useEu } from "@/lib/eu";
import { useSeguindo } from "@/lib/seguindo";

const LIMITE_DA_LISTA = 100; // o máximo que GET /usuarios devolve numa página
const RESULTADOS = 8;

function normalizar(texto: string): string {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export function BuscarGente({ aoSeguir }: { aoSeguir: () => void }) {
  const eu = useEu();
  const sigo = useSeguindo();
  const [usuarios, setUsuarios] = useState<User[] | null>(null);
  const [erro, setErro] = useState(false);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    apiGet<Page<User>>(`/usuarios?offset=0&limit=${LIMITE_DA_LISTA}`)
      .then((p) => setUsuarios(p.items))
      .catch(() => setErro(true));
  }, []);

  const termo = normalizar(busca.trim().replace(/^@/, ""));
  const achados = useMemo(() => {
    if (!usuarios || !termo) return [];
    return usuarios
      .filter((u) => u.username !== eu?.username)
      .filter((u) => normalizar(u.name).includes(termo) || u.username.toLowerCase().includes(termo))
      .slice(0, RESULTADOS);
  }, [usuarios, termo, eu]);

  return (
    <section aria-label="Buscar gente pra seguir" className="flex animate-surgir flex-col gap-3 rounded-2xl bg-superficie p-4">
      <Campo
        autoFocus
        rotulo="Chamar mais gente pra granja"
        type="search"
        placeholder="Nome ou @"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        autoComplete="off"
        className="bg-elevado"
      />
      {erro && <p className="text-[13px] text-brasa">Não deu pra carregar a lista agora. Tenta de novo daqui a pouco.</p>}
      {!erro && !termo && <p className="text-[13px] text-suave">Busca quem treina com você: cada pessoa que você segue entra na disputa da semana.</p>}
      {termo && usuarios && achados.length === 0 && (
        <p className="text-[13px] text-suave">
          Ninguém com esse nome por aqui. Que tal olhar quem tá treinando no{" "}
          <Link href="/" className="font-semibold text-tinta underline underline-offset-4">
            Explorar
          </Link>
          ?
        </p>
      )}
      {achados.length > 0 && (
        <ul>
          {achados.map((u) => (
            <li key={u.username} className="flex items-center gap-3 border-b border-borda py-2.5 last:border-b-0">
              <Avatar name={u.name} avatarUrl={u.avatar_url} />
              <Link href={`/u/${u.username}`} className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{u.name}</span>
                <span className="block truncate text-xs text-suave">@{u.username}</span>
              </Link>
              {sigo && <BotaoSeguir username={u.username} euSigoInicial={sigo.has(u.username)} aoMudar={aoSeguir} className="w-24 shrink-0" />}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
