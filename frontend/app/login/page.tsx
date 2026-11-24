"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Botao } from "@/components/Botao";
import { Campo } from "@/components/Campo";
import { Card } from "@/components/Card";
import { apiPost } from "@/lib/api";
import { GLOSSARIO } from "@/lib/glossario";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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
      setErro(err instanceof Error ? err.message : "não consegui entrar");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm space-y-6 pt-6">
      <div className="text-center">
        <h1 className="font-titulo text-5xl tracking-wide">{GLOSSARIO.rede}</h1>
        <p className="text-suave">{GLOSSARIO.slogan}</p>
      </div>

      <Card>
        <form onSubmit={entrar} className="space-y-4">
          <Campo
            rotulo="Usuário"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />
          <Campo
            rotulo="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
          {erro && (
            <p role="alert" className="rounded-lg bg-perigo-fundo px-3 py-2 text-sm text-perigo">
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
        <Link href="/registro" className="font-semibold text-destaque-texto underline">
          Criar conta
        </Link>
      </p>
    </div>
  );
}
