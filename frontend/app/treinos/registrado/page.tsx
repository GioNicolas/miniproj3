"use client";

// Treino registrado (canvas "04b"): a resposta do app logo depois de registrar.
// Mostra o que o treino mudou: a força do frango (antes → depois), a sequência
// de dias seguidos e a posição na Granja da semana.

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Card } from "@/components/Card";
import { Carregando } from "@/components/Carregando";
import { Confirmacao } from "@/components/Confirmacao";
import { Erro } from "@/components/Erro";
import { ArteDoFrango, FAIXA_DA_PATENTE, TEXTO_DA_PATENTE } from "@/components/Frango";
import { SemanaDeTreinos } from "@/components/SemanaDeTreinos";
import { apiDelete, apiGet, type Granja, type Perfil } from "@/lib/api";
import { diasSeguidos, useDiasTreinados } from "@/lib/dias";
import { useEu } from "@/lib/eu";
import { fraseDaDisputa } from "@/lib/granja";
import { GLOSSARIO, PATENTES, type Patente } from "@/lib/glossario";

function patenteDaForca(forca: number): Patente {
  return PATENTES.find((p) => forca <= FAIXA_DA_PATENTE[p][1]) ?? "Monstro";
}

/** "Quinta, 26 de nov" */
function dataDeHoje(): string {
  const d = new Date();
  const semana = d.toLocaleDateString("pt-BR", { weekday: "long" }).replace("-feira", "");
  const mes = d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
  return `${semana[0].toUpperCase()}${semana.slice(1)}, ${d.getDate()} de ${mes}`;
}

/** Posição da força dentro da faixa da patente, de 0 a 100. */
function naFaixa(forca: number, patente: Patente): number {
  const [min, max] = FAIXA_DA_PATENTE[patente];
  return Math.max(0, Math.min(100, ((forca - min) / (max - min)) * 100));
}

function Forca({ antes, depois, frango }: { antes: number | null; depois: number; frango: Perfil["frango"] }) {
  const ganho = antes === null ? null : Math.max(0, depois - antes);
  const subiu = antes !== null && patenteDaForca(antes) !== frango.nivel;
  // A barra parte de onde a força estava e enche até onde chegou.
  const inicio = antes === null || subiu ? 0 : naFaixa(antes, frango.nivel);
  const fim = naFaixa(depois, frango.nivel);
  const [largura, setLargura] = useState(inicio);
  useEffect(() => {
    const t = setTimeout(() => setLargura(fim), 350);
    return () => clearTimeout(t);
  }, [fim]);

  const [min, max] = FAIXA_DA_PATENTE[frango.nivel];
  const proximo = frango.proximo_nivel;

  return (
    <Card aria-label="Força do frango" className="flex flex-col gap-3 lg:col-start-1 lg:row-start-3">
      <div className="flex items-end justify-between">
        <div className="flex flex-col gap-2">
          <h2 className="text-[13px] font-semibold">Força</h2>
          {ganho !== null && (
            <span className={`self-start rounded-[10px] border px-2 py-0.5 text-[13px] font-bold ${ganho > 0 ? "border-folha-borda bg-folha-fundo text-folha" : "border-borda bg-superficie-2 text-suave"}`}>
              +{ganho}
            </span>
          )}
        </div>
        <p aria-label={antes !== null && ganho ? `Força foi de ${antes} para ${depois}` : `Força ${depois}`} className="flex items-baseline gap-2">
          {antes !== null && ganho !== 0 && (
            <>
              <span className="text-[22px] font-semibold tabular-nums text-suave">{antes}</span>
              <svg width="20" height="14" viewBox="0 0 20 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-suave">
                <path d="M2 7h15M12 2l5 5-5 5" />
              </svg>
            </>
          )}
          <span className="font-placar text-5xl leading-[0.9]">{depois}</span>
        </p>
      </div>

      <div
        role="progressbar"
        aria-label={proximo ? `Força até o ${proximo}: ${depois} de ${max + 1}` : `Força: ${depois} de ${max}`}
        aria-valuemin={min}
        aria-valuemax={proximo ? max + 1 : max}
        aria-valuenow={depois}
        className="h-3 overflow-hidden rounded-md bg-superficie-2"
      >
        <div className="h-3 rounded-md bg-destaque transition-[width] duration-[1100ms] ease-saida" style={{ width: `${largura}%` }} />
      </div>

      <div className="flex items-center gap-3">
        <p className="flex-1 text-[19px] font-bold leading-snug tracking-[-0.02em]">
          {subiu ? (
            <>
              Virou <span style={{ color: TEXTO_DA_PATENTE[frango.nivel] }}>{frango.nivel}</span>.
              {proximo && ` Faltam ${frango.falta_para_proximo} de força pro ${proximo}.`}
            </>
          ) : proximo ? (
            <>
              Faltam <span style={{ color: TEXTO_DA_PATENTE[proximo] }}>{frango.falta_para_proximo} de força</span> pro {proximo}
            </>
          ) : (
            "Força máxima. Agora é manter."
          )}
        </p>
        {proximo && <ArteDoFrango patente={proximo} altura={52} apagada />}
      </div>
    </Card>
  );
}

function NaGranja({ granja, treinados }: { granja: Granja; treinados: Set<string> | "erro" | null }) {
  const { eu, alvo } = granja;
  return (
    <Card aria-label={GLOSSARIO.ranking} className="flex flex-col gap-3 lg:col-start-2 lg:row-start-3">
      <div className="flex items-end justify-between">
        <h2 className="text-[13px] font-semibold">{GLOSSARIO.ranking}</h2>
        <p className="flex items-baseline gap-2">
          <span className="font-placar text-[44px] leading-[0.9]">{eu.dias_treinados}</span>
          <span className="text-sm font-semibold">{eu.dias_treinados === 1 ? "dia" : "dias"}</span>
        </p>
      </div>
      <SemanaDeTreinos treinados={treinados} />
      <p className="text-sm leading-snug">
        Você tá em <strong>{eu.posicao}º</strong>.{" "}
        {alvo
          ? fraseDaDisputa(granja)
          : "Ninguém na sua frente essa semana."}
      </p>
    </Card>
  );
}

function Desfazer({ postId }: { postId: number }) {
  const router = useRouter();
  const [confirmando, setConfirmando] = useState(false);
  const [apagando, setApagando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function apagar() {
    setApagando(true);
    setErro(null);
    try {
      await apiDelete(`/posts/${postId}`);
      router.push("/treinos");
    } catch {
      setErro("Não deu pra apagar. Tenta de novo.");
      setApagando(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirmando(true)}
        aria-label="Registrei sem querer: desfazer o treino"
        className="inline-flex min-h-11 items-center rounded-full px-3 text-[13px] font-semibold text-suave hover:bg-superficie hover:text-tinta"
      >
        Desfazer
      </button>
      <Confirmacao
        aberta={confirmando}
        titulo="Apagar esse treino?"
        texto="Seu progresso de hoje vai junto: o dia sai da granja e o frango perde a força que ganhou."
        ocupado={apagando}
        erro={erro}
        aoConfirmar={apagar}
        aoCancelar={() => {
          setConfirmando(false);
          setErro(null);
        }}
      />
    </>
  );
}

export default function TreinoRegistradoPage() {
  const eu = useEu();
  const [postId, setPostId] = useState<number | null>(null);
  const [antes, setAntes] = useState<number | null>(null);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [granja, setGranja] = useState<Granja | null>(null);
  const [erro, setErro] = useState(false);
  // 60 dias bastam para contar a sequência e desenhar a semana
  const treinados = useDiasTreinados(eu?.username, 60);

  useEffect(() => {
    const busca = new URLSearchParams(window.location.search);
    const post = Number.parseInt(busca.get("post") ?? "", 10);
    const forca = Number.parseInt(busca.get("antes") ?? "", 10);
    if (!Number.isNaN(post)) setPostId(post);
    if (!Number.isNaN(forca)) setAntes(forca);
  }, []);

  useEffect(() => {
    if (!eu) return;
    Promise.all([apiGet<Perfil>(`/usuarios/${eu.username}`), apiGet<Granja>("/granja?k=3")])
      .then(([p, g]) => {
        setPerfil(p);
        setGranja(g);
      })
      .catch(() => setErro(true));
  }, [eu]);

  if (erro) {
    return (
      <div className="flex flex-col gap-4 pt-6">
        <Erro>O treino foi registrado, mas não deu pra carregar seu frango agora.</Erro>
        <Link href="/" className="inline-flex min-h-11 items-center font-semibold underline underline-offset-4">
          Voltar pro feed
        </Link>
      </div>
    );
  }
  if (!perfil || !granja) return <Carregando />;

  const { frango } = perfil;
  const contouHoje = antes === null || frango.forca > antes;
  const seguidos = treinados instanceof Set ? diasSeguidos(treinados) : null;

  return (
    // No computador (lg), tudo centralizado e sem rolar: frango e título em cima, os cards
    // de força e granja lado a lado, e os botões embaixo. No celular, tudo em coluna, como no canvas.
    <div className="pagina-larga mx-auto flex max-w-xl flex-col gap-4 lg:grid lg:max-w-3xl lg:grid-cols-2 lg:gap-x-4 lg:gap-y-4">
      {/* X à esquerda e "desfazer" à direita: no topo nunca fica atrás da barra fixa */}
      <header className="-mb-12 -ml-3 flex items-start justify-between pt-2 lg:col-span-2 lg:-mb-14">
        <Link href="/" aria-label="Fechar e voltar pro feed" className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-superficie">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </Link>
        {postId !== null && contouHoje && <Desfazer postId={postId} />}
      </header>

      <div className="flex flex-col items-center text-center lg:col-span-2 lg:row-start-2">
        <div className="animate-surgir [&>img]:!h-24 lg:[&>img]:!h-[104px]">
          <ArteDoFrango patente={frango.nivel} altura={168} alt={`Seu frango, patente ${frango.nivel}`} />
        </div>
        <h1 className="mt-2 font-titulo text-[24px] leading-[0.95] lg:text-[30px]">{contouHoje ? "Treino registrado" : "Hoje já tava contado"}</h1>
        <p className="mt-2 text-[13px] text-balance text-suave">
          {dataDeHoje()}
          {seguidos !== null && seguidos > 0 && (
            <>
              {" · "}
              <strong className="font-semibold text-tinta">{seguidos === 1 ? "1º dia da sequência" : `${seguidos} dias seguidos`}</strong>
            </>
          )}
        </p>
        {!contouHoje && <p className="mt-1 text-[13px] text-suave">O post tá no feed. Só o 1º treino do dia soma força.</p>}
      </div>

      <Forca antes={antes} depois={frango.forca} frango={frango} />
      <NaGranja granja={granja} treinados={treinados} />

      {/* No celular, os botões ficam presos acima da barra de baixo, ao alcance do polegar (como o
          "Registrar treino" de Treinos). Precisam ser filhos diretos da tela para o sticky funcionar.
          No computador, lado a lado, centralizados. */}
      <div className="sticky bottom-[calc(4.25rem+max(1rem,env(safe-area-inset-bottom)))] z-10 -mx-5 flex gap-2 border-t border-borda bg-fundo px-5 py-3 md:bottom-0 md:mx-0 md:px-0 lg:static lg:col-span-2 lg:row-start-4 lg:mx-auto lg:w-full lg:max-w-xl lg:border-0 lg:bg-transparent lg:py-0">
        <Link
          href="/granja"
          className="flex min-h-[52px] flex-1 items-center justify-center whitespace-nowrap rounded-xl bg-destaque px-4 font-titulo text-[15px] text-sobre-destaque transition-[transform,filter] duration-150 ease-out hover:brightness-105 active:scale-[0.97] lg:text-[17px]"
        >
          Ver a granja
        </Link>
        {postId !== null && (
          <Link href={`/posts/${postId}`} className="flex min-h-[52px] flex-1 items-center justify-center rounded-xl border border-borda-forte bg-fundo text-sm font-semibold hover:bg-superficie-2">
            Ver meu post
          </Link>
        )}
      </div>
    </div>
  );
}
