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

  async function criarConta(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setErro(null);
    try {
      await apiPost("/auth/registro", { username, name, password });
      // conta criada: já entra direto, sem obrigar a digitar tudo de novo
      const { token } = await apiPost<{ token: string }>("/auth/login", { username, password });
      localStorage.setItem("token", token);
      router.push("/");
    } catch (err) {
      setErro(err instanceof Error ? err.message : "não consegui criar a conta");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm space-y-6 pt-6">
      <div className="text-center">
        <h1 className="font-titulo text-5xl tracking-wide">Bota teu frango pra treinar</h1>
        <p className="text-suave">{GLOSSARIO.slogan}</p>
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
            dica="3 a 30 caracteres: letras minúsculas, números e _"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
            autoComplete="username"
            pattern="[a-z0-9_]{3,30}"
            title="3 a 30 caracteres: letras minúsculas, números e _"
            required
          />
          <Campo
            rotulo="Senha"
            type="password"
            dica="Pelo menos 8 caracteres"
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
          <Botao type="submit" disabled={enviando} className="w-full">
            {enviando ? "Criando..." : "Criar conta"}
          </Botao>
        </form>
      </Card>

      <p className="text-center text-sm text-suave">
        Já tem conta?{" "}
        <Link href="/login" className="font-semibold text-destaque-texto underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}
