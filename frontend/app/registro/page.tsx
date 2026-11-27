"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Botao } from "@/components/Botao";
import { Campo } from "@/components/Campo";
import { BotaoVerSenha } from "@/components/BotaoVerSenha";
import { Erro } from "@/components/Erro";
import { ArteDoFrango } from "@/components/Frango";
import { apiPost } from "@/lib/api";
import { GLOSSARIO } from "@/lib/glossario";

export default function RegistroPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [verSenha, setVerSenha] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [contaCriada, setContaCriada] = useState(false);

  async function criarConta(e: React.FormEvent) {
    e.preventDefault();
    if (new TextEncoder().encode(password).length > 72) {
      setErro("Senha comprida demais. Usa até 72 caracteres (acentos e emoji contam como mais de um).");
      return;
    }
    setEnviando(true);
    setErro(null);
    try {
      await apiPost("/auth/registro", { username, name, password });
      setContaCriada(true);
      try {
        const { token } = await apiPost<{ token: string }>("/auth/login", { username, password });
        localStorage.setItem("token", token);
        router.push("/");
      } catch {
        setErro("Conta criada, mas não foi possível entrar automaticamente. Acesse a tela de login para entrar.");
      }
    } catch (err) {
      setErro(err instanceof Error ? err.message : "não deu pra criar a conta");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-7.5rem)] max-w-sm flex-col md:min-h-[calc(100dvh-4rem)] md:justify-center">
      <header className="-ml-3 flex min-h-11 items-center gap-1 pb-4 pt-5">
        <Link
          href="/login"
          aria-label="Voltar pro login"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full hover:bg-superficie"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </Link>
        <span className="font-titulo text-[22px]">{GLOSSARIO.rede}</span>
      </header>

      <form onSubmit={criarConta} className="flex flex-1 flex-col gap-6 md:flex-none pt-4">
        <div>
          {/* o frango no topo da patente: o que a pessoa pode virar treinando */}
          <div className="mb-4 animate-subir">
            <ArteDoFrango patente="Monstro" altura={96} alt="Frango Monstro, a patente mais alta" />
          </div>
          <h1 className="text-[28px] font-bold leading-[1.15] tracking-[-0.02em] text-balance">
            Bota seu frango pra treinar
          </h1>
          <p className="mt-2 text-[15px] leading-normal text-pretty text-suave">
            A rede social de quem pratica calistenia. Você entra no ranking da semana e conquista novos frangos conforme evolui.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <Campo
            rotulo="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            maxLength={80}
            required
          />
          <Campo
            rotulo="Usuário"
            dica="Letras minúsculas, números e _ (de 3 a 30)"
            placeholder="ex.: analu"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            pattern="[a-z0-9_]{3,30}"
            title="Letras minúsculas, números e _ (de 3 a 30)"
            required
          />
          <Campo
            rotulo="Senha"
            type={verSenha ? "text" : "password"}
            dica="Pelo menos 8 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
            fim={<BotaoVerSenha ver={verSenha} alternar={() => setVerSenha((v) => !v)} />}
          />
          {erro && <Erro>{erro}</Erro>}
        </div>

        <Botao type="submit" disabled={enviando || contaCriada} className="w-full">
          {enviando ? "Criando..." : "Criar conta"}
        </Botao>
      </form>

      <p className="flex items-center justify-center gap-1 pb-8 pt-4 text-center text-sm text-suave">
        Já tem conta?
        <Link href="/login" className="inline-flex min-h-11 items-center px-1 font-semibold text-tinta underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}
