"use client";

// Treino registrado (canvas "04b"): a resposta do app logo depois de registrar.
// Mostra o que o treino mudou: a força do frango (antes → depois), a sequência
// de dias seguidos e a posição na Granja da semana.

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Botao } from "@/components/Botao";
import { Card } from "@/components/Card";
import { Carregando } from "@/components/Carregando";
import { Erro } from "@/components/Erro";
import { ArteDoFrango, FAIXA_DA_PATENTE, TEXTO_DA_PATENTE } from "@/components/Frango";
import { SemanaDeTreinos } from "@/components/SemanaDeTreinos";
import { apiDelete, apiGet, type Granja, type Perfil } from "@/lib/api";
import { diasSeguidos, useDiasTreinados } from "@/lib/dias";
import { useEu } from "@/lib/eu";
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
    <Card aria-label="Força do frango" className="flex flex-col gap-3">
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
    <Card aria-label={GLOSSARIO.ranking} className="flex flex-col gap-3">
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
          ? `Mais ${alvo.faltam_dias} ${alvo.faltam_dias === 1 ? "dia" : "dias"} e você passa ${alvo.usuario.name.split(" ")[0]}.`
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

  if (!confirmando) {
    return (
      <button type="button" onClick={() => setConfirmando(true)} className="inline-flex min-h-11 items-center self-center text-[13px] font-semibold text-suave hover:text-tinta">
        Registrei sem querer · desfazer
      </button>
    );
  }
  return (
    <div className="flex animate-surgir flex-col gap-2 rounded-xl bg-superficie p-3">
      <p className="text-sm">Apagar o post e tirar o dia de hoje da granja?</p>
      {erro && <Erro>{erro}</Erro>}
      <div className="grid grid-cols-2 gap-2">
        <Botao variante="contorno" onClick={() => setConfirmando(false)} disabled={apagando}>
          Manter
        </Botao>
        <Botao variante="contorno" onClick={apagar} disabled={apagando} className="border-brasa text-brasa">
          {apagando ? "Apagando..." : "Apagar"}
        </Botao>
      </div>
    </div>
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
    <div className="flex flex-col gap-4">
      <header className="-ml-3 flex pt-2">
        <Link href="/" aria-label="Fechar e voltar pro feed" className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-superficie">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </Link>
      </header>

      <div className="flex flex-col items-center text-center">
        <div className="animate-surgir">
          <ArteDoFrango patente={frango.nivel} altura={168} alt={`Seu frango, patente ${frango.nivel}`} />
        </div>
        <h1 className="mt-2 font-titulo text-[30px] leading-[0.95]">{contouHoje ? "Treino registrado" : "Hoje já tava contado"}</h1>
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

      <div className="flex flex-col gap-2 pt-1">
        <Link
          href="/granja"
          className="flex min-h-[52px] items-center justify-center rounded-xl bg-destaque px-4 font-titulo text-[17px] text-sobre-destaque transition-[transform,filter] duration-150 ease-out hover:brightness-105 active:scale-[0.97]"
        >
          Ver a granja
        </Link>
        {postId !== null && (
          <Link href={`/posts/${postId}`} className="flex min-h-12 items-center justify-center rounded-[10px] border border-borda-forte text-sm font-semibold hover:bg-superficie-2">
            Ver meu post
          </Link>
        )}
        {postId !== null && contouHoje && <Desfazer postId={postId} />}
      </div>
    </div>
  );
}
