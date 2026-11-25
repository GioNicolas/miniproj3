"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Botao } from "@/components/Botao";
import { Campo } from "@/components/Campo";
import { Card } from "@/components/Card";
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
    <div className="mx-auto max-w-sm space-y-6 pt-2">
      <div className="flex flex-col items-center text-center">
        {/* O pintinho é a patente Frango: todo mundo começa aqui. */}
        <Image src="/frangos/frango.png" alt="" width={372} height={520} priority className="h-36 w-auto" />
        <h1 className="mt-2 font-titulo text-4xl">{GLOSSARIO.rede}</h1>
        <p className="mt-2 text-suave">Cada treino registrado faz seu frango crescer.</p>
        <p className="mt-1 font-semibold text-destaque">{GLOSSARIO.slogan}</p>
      </div>

      <Card>
        <form onSubmit={entrar} className="space-y-4">
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
            fim={
              <button
                type="button"
                onClick={() => setVerSenha((v) => !v)}
                aria-pressed={verSenha}
                aria-label={verSenha ? "Esconder a senha" : "Mostrar a senha"}
                className="min-h-11 rounded-r-lg px-3 text-sm font-semibold text-ceu focus-visible:outline-2 focus-visible:outline-ceu"
              >
                {verSenha ? "Ocultar" : "Mostrar"}
              </button>
            }
          />
          {erro && (
            <p id="erro-login" role="alert" className="rounded-lg bg-brasa-fundo px-3 py-2 text-sm text-brasa">
              {erro}
            </p>
          )}
          <Botao type="submit" disabled={enviando} className="w-full">
            {enviando ? "Entrando..." : "Entrar"}
          </Botao>
        </form>
      </Card>

      <p className="text-center text-sm text-suave">
        Ainda não tem conta?{" "}
        <Link href="/registro" className="inline-flex min-h-11 items-center font-semibold text-destaque underline">
          Criar conta
        </Link>
      </p>
    </div>
  );
}
