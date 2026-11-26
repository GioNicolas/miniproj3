"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Avatar } from "@/components/Avatar";
import { Botao } from "@/components/Botao";
import { BotaoSeguir } from "@/components/BotaoSeguir";
import { Card } from "@/components/Card";
import { Carregando } from "@/components/Carregando";
import { EditarPerfil } from "@/components/EditarPerfil";
import { Erro } from "@/components/Erro";
import { EstadoVazio } from "@/components/EstadoVazio";
import { CartaoDoFrango } from "@/components/Frango";
import { ListaDePosts } from "@/components/ListaDePosts";
import { SemanaDeTreinos } from "@/components/SemanaDeTreinos";
import { apiGet, type Perfil as PerfilDados } from "@/lib/api";
import { useEu } from "@/lib/eu";

const ESTILO_LINK_BOTAO =
  "inline-flex min-h-11 items-center justify-center rounded-[10px] border border-borda-forte px-4 text-sm font-semibold text-tinta hover:bg-superficie-2";

/** A "carteirinha" do frango: usada em /perfil (o meu) e em /u/[username]. */
export function Perfil({ username }: { username: string }) {
  const eu = useEu();
  const [perfil, setPerfil] = useState<PerfilDados | null>(null);
  const [naoAchou, setNaoAchou] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [editando, setEditando] = useState(false);

  useEffect(() => {
    setPerfil(null);
    setNaoAchou(false);
    setErro(null);
    apiGet<PerfilDados>(`/usuarios/${username}`)
      .then(setPerfil)
      .catch((err) => {
        if (err instanceof Error && err.message === "usuário não encontrado") setNaoAchou(true);
        else setErro(err instanceof Error ? err.message : "não deu para carregar o perfil");
      });
  }, [username]);

  if (naoAchou) {
    return (
      <EstadoVazio
        titulo="Frango não encontrado"
        texto={`Ninguém aqui se chama @${username}.`}
        acao={
          <Link href="/" className="text-sm font-semibold text-destaque-texto underline">
            Voltar para o feed
          </Link>
        }
      />
    );
  }
  if (erro) return <Erro>{erro}</Erro>;
  if (!perfil || !eu) return <Carregando />;

  const souEu = eu.username === perfil.username;

  return (
    <div className="space-y-6">
      <Card>
        {editando ? (
          <EditarPerfil
            atual={perfil}
            onSalvo={(user) => {
              setPerfil({ ...perfil, ...user });
              setEditando(false);
            }}
            onCancelar={() => setEditando(false)}
          />
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar name={perfil.name} avatarUrl={perfil.avatar_url} patente={perfil.frango.nivel} grande />
              <div className="min-w-0">
                <h1 className="truncate text-2xl font-bold leading-tight tracking-[-0.02em]">{perfil.name}</h1>
                <p className="truncate text-suave">@{perfil.username}</p>
              </div>
            </div>

            {perfil.bio ? (
              <p className="whitespace-pre-wrap break-words">{perfil.bio}</p>
            ) : (
              souEu && <p className="text-sm text-suave">Conta em uma frase em que pé está o seu treino.</p>
            )}

            <CartaoDoFrango frango={perfil.frango} souEu={souEu} />

            <div className="flex gap-6">
              <Link href={`/u/${perfil.username}/seguidores`} className="flex min-h-11 items-center gap-1 hover:underline">
                <span className="text-[17px] font-bold tabular-nums">{perfil.seguidores}</span>{" "}
                <span className="text-sm text-suave">{perfil.seguidores === 1 ? "seguidor" : "seguidores"}</span>
              </Link>
              <Link href={`/u/${perfil.username}/seguindo`} className="flex min-h-11 items-center gap-1 hover:underline">
                <span className="text-[17px] font-bold tabular-nums">{perfil.seguindo}</span>{" "}
                <span className="text-sm text-suave">seguindo</span>
              </Link>
            </div>

            {souEu ? (
              <Botao variante="contorno" onClick={() => setEditando(true)} className="w-full">
                Editar perfil
              </Botao>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <BotaoSeguir
                  key={perfil.username}
                  username={perfil.username}
                  euSigoInicial={perfil.eu_sigo}
                  aoMudar={(delta) => setPerfil((p) => (p ? { ...p, seguidores: p.seguidores + delta, eu_sigo: delta > 0 } : p))}
                />
                <Link href={`/chat?com=${perfil.username}`} className={ESTILO_LINK_BOTAO}>
                  Mensagem
                </Link>
              </div>
            )}
          </div>
        )}
      </Card>

      <SemanaDeTreinos username={perfil.username} titulo={souEu ? "Sua semana" : "Semana"} />

      <section className="space-y-3">
        <h2 className="text-[17px] font-bold tracking-[-0.02em]">Posts</h2>
        <ListaDePosts
          caminho={`/usuarios/${perfil.username}/posts`}
          vazio={
            souEu
              ? { titulo: "Nenhum post ainda", texto: "Registre o treino de hoje: ele aparece aqui e no feed de quem te segue." }
              : { titulo: "Nenhum post ainda", texto: `@${perfil.username} ainda não postou nada.` }
          }
        />
      </section>
    </div>
  );
}
