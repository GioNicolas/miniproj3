"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Botao } from "@/components/Botao";
import { Campo } from "@/components/Campo";
import { BotaoVerSenha } from "@/components/BotaoVerSenha";
import { Erro } from "@/components/Erro";
import { FilaDosFrangos } from "@/components/FilaDosFrangos";
import { apiPost } from "@/lib/api";
import { GLOSSARIO } from "@/lib/glossario";

// O backend responde 401 com "usuário ou senha inválidos". Aqui vira uma frase que
// diz o que conferir; qualquer outra falha (rede, servidor fora) ganha a sua.
function mensagemDeErro(err: unknown): string {
  const texto = err instanceof Error ? err.message : "";
  if (/inv[aá]lid/i.test(texto)) {
    return "Usuário ou senha não batem. O usuário é tudo minúsculo, sem @.";
  }
  return "Não deu pra entrar agora. Confere a internet e tenta de novo.";
}

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [verSenha, setVerSenha] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setErro(null);
    try {
      const { token } = await apiPost<{ token: string }>("/auth/login", { username, password });
      localStorage.setItem("token", token);
      router.push("/");
    } catch (err) {
      setErro(mensagemDeErro(err));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-7.5rem)] max-w-sm flex-col md:min-h-[calc(100dvh-4rem)] md:justify-center">
      <header className="flex min-h-11 items-center pb-4 pt-5">
        <span className="font-titulo text-[22px]">{GLOSSARIO.rede}</span>
      </header>

      <form onSubmit={entrar} className="flex flex-1 flex-col gap-6 md:flex-none pt-8">
        <div>
          <div className="mb-5">
            <FilaDosFrangos />
          </div>
          <h1 className="text-[28px] font-bold leading-[1.15] tracking-[-0.02em] text-balance">
            Entra pra registrar o treino de hoje
          </h1>
          <p className="mt-2 text-[15px] leading-normal text-pretty text-suave">
            {GLOSSARIO.rede} é a rede de calistenia da UFPB. Cada treino que você registra faz seu frango crescer; se você some, ele definha.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <Campo
            rotulo="Usuário"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value.toLowerCase());
              setErro(null);
            }}
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            aria-invalid={erro ? true : undefined}
            aria-describedby={erro ? "erro-login" : undefined}
            required
          />
          <Campo
            rotulo="Senha"
            type={verSenha ? "text" : "password"}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErro(null);
            }}
            autoComplete="current-password"
            aria-invalid={erro ? true : undefined}
            aria-describedby={erro ? "erro-login" : undefined}
            required
            fim={<BotaoVerSenha ver={verSenha} alternar={() => setVerSenha((v) => !v)} />}
          />
          {erro && (
            <div id="erro-login">
              <Erro>{erro}</Erro>
            </div>
          )}
        </div>

        <Botao type="submit" disabled={enviando} className="w-full">
          {enviando ? "Entrando..." : "Entrar"}
        </Botao>
      </form>

      <p className="flex items-center justify-center gap-1 pb-8 pt-4 text-center text-sm text-suave">
        Ainda não tem conta?
        <Link href="/registro" className="inline-flex min-h-11 items-center px-1 font-semibold text-tinta underline">
          Criar conta
        </Link>
      </p>
    </div>
  );
}
