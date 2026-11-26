"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Avatar } from "@/components/Avatar";
import { BotaoSeguir } from "@/components/BotaoSeguir";
import { Card } from "@/components/Card";
import { Carregando } from "@/components/Carregando";
import { EditarPerfil } from "@/components/EditarPerfil";
import { Erro } from "@/components/Erro";
import { EstadoVazio } from "@/components/EstadoVazio";
import { CartaoDoFrango } from "@/components/Frango";
import { GradeDePosts } from "@/components/GradeDePosts";
import { apiGet, type Perfil as PerfilDados, type SkillDominada as Dominada } from "@/lib/api";
import { diaIso, ultimosDias, useDiasTreinados } from "@/lib/dias";
import { useEu } from "@/lib/eu";
import { GLOSSARIO } from "@/lib/glossario";

const ESTILO_LINK_BOTAO =
  "inline-flex min-h-11 items-center justify-center rounded-[10px] border border-borda-forte px-4 text-sm font-semibold text-tinta hover:bg-superficie-2";


/** Últimos 28 dias em 2 linhas de 14, como no canvas. Hoje ganha borda tracejada. */
function Calendario({ username, diasSemTreinar }: { username: string; diasSemTreinar: number | null }) {
  const treinados = useDiasTreinados(username, 28);
  const dias = ultimosDias(28);
  const hoje = diaIso(new Date());
  const carregou = treinados instanceof Set;
  const total = carregou ? dias.filter((d) => treinados.has(d)).length : 0;

  // Sequência: dias seguidos com treino até hoje (ou até ontem, se hoje ainda não treinou).
  let seguidos = 0;
  if (carregou) {
    let i = dias.length - 1;
    if (!treinados.has(dias[i])) i -= 1;
    while (i >= 0 && treinados.has(dias[i])) {
      seguidos += 1;
      i -= 1;
    }
  }
  const sumiu = diasSemTreinar !== null && diasSemTreinar >= 2;
  const resumo = !carregou
    ? treinados === "erro"
      ? "não deu para carregar"
      : "…"
    : sumiu
      ? `treinou em ${total} · ${diasSemTreinar} dias sem treinar`
      : seguidos > 1
        ? `treinou em ${total} · ${seguidos} dias seguidos`
        : `treinou em ${total}`;

  return (
    <section aria-label={`Últimos 28 dias: ${resumo}`} className="py-1">
      <div className="mb-2 flex items-baseline justify-between">
        <h2 className="text-[13px] font-semibold">Últimos 28 dias</h2>
        <span className={`text-xs ${sumiu ? "font-semibold text-brasa" : "text-suave"}`}>{resumo}</span>
      </div>
      <div aria-hidden="true" className="grid grid-cols-14 gap-[3px]">
        {dias.map((d) => (
          <div
            key={d}
            className={`aspect-square rounded-[3px] ${carregou && treinados.has(d) ? "bg-[#b8891f]" : "bg-superficie-2"} ${
              d === hoje ? "border-2 border-dashed border-destaque" : ""
            }`}
          />
        ))}
      </div>
    </section>
  );
}

/** Progressões que a pessoa já domina (#10), em selos de folha. */
function JaDomina({ username, souEu }: { username: string; souEu: boolean }) {
  const [dominadas, setDominadas] = useState<Dominada[] | null>(null);
  useEffect(() => {
    apiGet<Dominada[]>(`/usuarios/${username}/progressoes`)
      .then(setDominadas)
      .catch(() => setDominadas([]));
  }, [username]);
  if (dominadas === null) return null;

  return (
    <section aria-label="Já domina">
      <h2 className="mb-2 text-[13px] font-semibold">Já domina</h2>
      <div className="flex flex-wrap items-center gap-2">
        {dominadas.length === 0 && (
          <span className="text-[13px] text-suave">{souEu ? "Nenhuma progressão ainda." : "Nenhuma progressão ainda."}</span>
        )}
        {dominadas.map((p) => (
          <span key={p.codigo} className="rounded-full border border-folha-borda bg-folha-fundo px-3 py-1 text-xs text-folha">
            {p.nome}
          </span>
        ))}
        {souEu && (
          <Link href="/treinos" className="inline-flex min-h-11 items-center text-[13px] font-semibold hover:underline">
            Ver a árvore toda
          </Link>
        )}
      </div>
    </section>
  );
}

/** A "carteirinha" do frango: usada em /perfil (o meu) e em /u/[username]. */
export function Perfil({ username }: { username: string }) {
  const eu = useEu();
  const [perfil, setPerfil] = useState<PerfilDados | null>(null);
  const [naoAchou, setNaoAchou] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [editando, setEditando] = useState(false);
  const [totalPosts, setTotalPosts] = useState<number | null>(null);

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
          <Link href="/" className="text-sm font-semibold underline">
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
    <div className="flex flex-col gap-4">
      <header className="flex min-h-11 items-center justify-between gap-3 pt-2">
        <h1 className="truncate font-titulo text-[22px]">{souEu ? GLOSSARIO.perfil : perfil.name}</h1>
        {souEu && !editando && (
          <button
            type="button"
            onClick={() => setEditando(true)}
            className="inline-flex min-h-11 shrink-0 items-center rounded-full bg-superficie px-4 text-[13px] font-medium hover:bg-superficie-2"
          >
            Editar perfil
          </button>
        )}
      </header>

      {editando ? (
        <Card>
          <EditarPerfil
            atual={perfil}
            onSalvo={(user) => {
              setPerfil({ ...perfil, ...user });
              setEditando(false);
            }}
            onCancelar={() => setEditando(false)}
          />
        </Card>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <Avatar name={perfil.name} avatarUrl={perfil.avatar_url} patente={perfil.frango.nivel} tamanho="l" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-semibold">{perfil.name}</p>
              <p className="truncate text-xs text-suave">
                @{perfil.username}
                {perfil.bio ? ` · ${perfil.bio}` : ""}
              </p>
              <p className="flex items-center gap-1 text-xs">
                <Link href={`/u/${perfil.username}/seguidores`} className="inline-flex min-h-11 items-center hover:underline">
                  <strong className="tabular-nums">{perfil.seguidores}</strong>&nbsp;{perfil.seguidores === 1 ? "seguidor" : "seguidores"}
                </Link>
                <span aria-hidden="true">·</span>
                <Link href={`/u/${perfil.username}/seguindo`} className="inline-flex min-h-11 items-center hover:underline">
                  <strong className="tabular-nums">{perfil.seguindo}</strong>&nbsp;seguindo
                </Link>
              </p>
            </div>
          </div>

          {!souEu && (
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
        </>
      )}

      <CartaoDoFrango frango={perfil.frango} souEu={souEu} />

      <Calendario username={perfil.username} diasSemTreinar={perfil.frango.dias_sem_treinar} />

      <JaDomina username={perfil.username} souEu={souEu} />

      <section aria-label="Posts">
        <div className="mb-2 flex min-h-11 items-center justify-between">
          <h2 className="text-[13px] font-semibold">{souEu ? "Seus posts" : "Posts"}</h2>
          {totalPosts !== null && totalPosts > 4 && (
            <Link href={`/u/${perfil.username}/posts`} className="inline-flex min-h-11 items-center text-[13px] font-semibold hover:underline">
              Ver os {totalPosts}
            </Link>
          )}
        </div>
        <GradeDePosts
          username={perfil.username}
          limite={4}
          onTotal={setTotalPosts}
          vazio={souEu ? "Registra o treino de hoje: ele aparece aqui e no feed de quem te segue." : `@${perfil.username} ainda não postou nada.`}
        />
      </section>
    </div>
  );
}
