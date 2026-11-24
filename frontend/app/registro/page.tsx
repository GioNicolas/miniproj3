"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Botao } from "@/components/Botao";
import { Campo } from "@/components/Campo";
import { Card } from "@/components/Card";
import { apiPost } from "@/lib/api";
import { GLOSSARIO } from "@/lib/glossario";

export default function RegistroPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [contaCriada, setContaCriada] = useState(false);

  async function criarConta(e: React.FormEvent) {
    e.preventDefault();
    if (new TextEncoder().encode(password).length > 72) {
      setErro("A senha deve ter no máximo 72 bytes em UTF-8. Caracteres acentuados podem ocupar mais de um byte.");
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
    <div className="mx-auto max-w-sm space-y-6 pt-6">
      <div className="text-center">
        <h1 className="font-titulo text-2xl leading-tight">Bota seu frango pra treinar</h1>
        <p className="mt-2 font-semibold text-destaque">{GLOSSARIO.slogan}</p>
      </div>

      <Card>
        <form onSubmit={criarConta} className="space-y-4">
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
            dica="Só letras minúsculas, números e _ (de 3 a 30)"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
            autoComplete="username"
            pattern="[a-z0-9_]{3,30}"
            title="Só letras minúsculas, números e _ (de 3 a 30)"
            required
          />
          <Campo
            rotulo="Senha"
            type="password"
            dica="Pelo menos 8 caracteres e no máximo 72 bytes em UTF-8"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
          />
          {erro && (
            <p role="alert" className="rounded-lg bg-perigo-fundo px-3 py-2 text-sm text-perigo">
              {erro}
            </p>
          )}
          <Botao type="submit" disabled={enviando || contaCriada} className="w-full">
            {enviando ? "Criando..." : "Criar conta"}
          </Botao>
        </form>
      </Card>

      <p className="text-center text-sm text-suave">
        Já tem conta?{" "}
        <Link href="/login" className="font-semibold text-destaque underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}
