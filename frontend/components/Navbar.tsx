"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { GLOSSARIO } from "@/lib/glossario";
import { ROTAS_PUBLICAS, sair } from "@/lib/sessao";

// Os 5 destinos da rede. Explorar é uma aba dentro do Feed; a árvore de
// progressões fica dentro de Treinos; Chat reúne os posts sem treino
// (dúvidas, combinados, resenha). Mudou uma rota? Mude só esta lista.
const ITENS = [
  { href: "/", rotulo: "Feed", icone: "M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" },
  { href: "/granja", rotulo: "Granja", icone: "M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3" },
  { href: "/treinos", rotulo: "Treinos", icone: "M6 6v12M18 6v12M3 9v6M21 9v6M6 12h12" },
  { href: "/chat", rotulo: GLOSSARIO.conversa, icone: "M4 5h16v11H9l-5 4z" },
  { href: "/perfil", rotulo: GLOSSARIO.perfil, icone: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0" },
];

function Icone({ d }: { d: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

export function Navbar() {
  const caminho = usePathname();
  const ativo = (href: string) => (href === "/" ? caminho === "/" : caminho.startsWith(href));

  // Login e cadastro são telas cheias, sem navegação.
  if (ROTAS_PUBLICAS.includes(caminho)) return null;

  return (
    <>
      {/* computador: barra no topo */}
      <header className="sticky top-0 z-20 hidden border-b border-borda bg-superficie md:block">
        <nav aria-label="Navegação principal" className="mx-auto flex max-w-3xl items-center gap-6 px-5 py-3">
          <Link href="/" className="mr-auto font-titulo text-[22px]">
            {GLOSSARIO.rede}
          </Link>
          {ITENS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={ativo(item.href) ? "page" : undefined}
              className={`flex min-h-11 items-center border-b-[3px] text-sm ${ativo(item.href) ? "border-tinta font-semibold text-tinta" : "border-transparent text-suave hover:text-tinta"}`}
            >
              {item.rotulo}
            </Link>
          ))}
          <button type="button" onClick={sair} className="min-h-11 text-sm text-suave hover:text-tinta">
            Sair
          </button>
        </nav>
      </header>

      {/* celular: só a marca e o Sair no topo; a navegação fica na barra de baixo */}
      <header className="flex items-center justify-between px-5 pb-2 pt-5 md:hidden">
        <Link href="/" className="flex min-h-11 items-center font-titulo text-[22px]">
          {GLOSSARIO.rede}
        </Link>
        <button type="button" onClick={sair} className="min-h-11 px-2 text-sm text-suave">
          Sair
        </button>
      </header>

      {/* celular: barra fixa embaixo, perto do polegar; o ativo ganha traço de tinta em cima */}
      <nav aria-label="Navegação principal" className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t border-borda bg-superficie px-1 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2 md:hidden">
        {ITENS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={ativo(item.href) ? "page" : undefined}
            className={`flex min-h-11 flex-col items-center gap-0.5 whitespace-nowrap border-t-[3px] py-2 text-xs ${ativo(item.href) ? "border-tinta font-semibold text-tinta" : "border-transparent text-suave"}`}
          >
            <Icone d={item.icone} />
            {item.rotulo}
          </Link>
        ))}
      </nav>
    </>
  );
}
