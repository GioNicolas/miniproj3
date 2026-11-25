"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { AreaDeTexto } from "@/components/AreaDeTexto";
import { Botao } from "@/components/Botao";
import { Card } from "@/components/Card";
import { Erro } from "@/components/Erro";
import { SemanaDeTreinos } from "@/components/SemanaDeTreinos";
import { apiPost, type Post } from "@/lib/api";
import { useEu } from "@/lib/eu";
import { GLOSSARIO } from "@/lib/glossario";
import { TRILHAS } from "@/lib/progressoes";

const LIMITE_TEXTO = 500;
const LIMITE_EXERCICIOS = 20; // o mesmo do backend

// Os números ficam como texto enquanto a pessoa digita; viram int só no envio.
type Linha = { progressao: string; series: string; reps: string };
const LINHA_VAZIA: Linha = { progressao: "", series: "", reps: "" };

const ESTILO_CAMPO =
  "min-h-11 w-full rounded-lg border border-borda bg-superficie px-3 text-tinta outline-none focus:border-destaque";

function numero(valor: string): number | null {
  const n = Number.parseInt(valor, 10);
  return Number.isNaN(n) ? null : n;
}

export default function RegistrarTreinoPage() {
  const eu = useEu();
  const router = useRouter();
  const [texto, setTexto] = useState("");
  const [linhas, setLinhas] = useState<Linha[]>([{ ...LINHA_VAZIA }]);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  function mudar(i: number, campo: keyof Linha, valor: string) {
    setLinhas((atuais) => atuais.map((linha, j) => (j === i ? { ...linha, [campo]: valor } : linha)));
  }

  async function registrar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      // Linha sem progressão escolhida não vai: treino sem exercício também conta o dia.
      const exercicios = linhas
        .filter((l) => l.progressao)
        .map((l) => ({ progressao: l.progressao, series: numero(l.series), reps: numero(l.reps) }));
      await apiPost<Post>("/treinos", { texto, exercicios });
      router.push("/");
    } catch (err) {
      setErro(err instanceof Error ? err.message : "não deu para registrar o treino");
      setEnviando(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="font-titulo text-4xl tracking-wide">{GLOSSARIO.registrarTreino}</h1>

      {eu && <SemanaDeTreinos username={eu.username} />}

      <Card>
        <form onSubmit={registrar} className="space-y-5">
          <label className="flex flex-col gap-1 text-sm font-semibold">
            Como foi o treino
            <AreaDeTexto
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              maxLength={LIMITE_TEXTO}
              rows={3}
              placeholder="Ex.: primeira vez que segurei 3 negativas inteiras!"
              className="font-normal"
            />
            <span className="text-xs font-normal text-suave">
              Escreva algo para liberar o registro: é o texto que aparece no feed.
            </span>
          </label>

          <fieldset className="space-y-3">
            <legend className="mb-1 text-sm font-semibold">O que você treinou</legend>
            {linhas.map((linha, i) => (
              <div key={i} className="space-y-2 rounded-lg border border-borda bg-fundo p-3">
                <select
                  aria-label={`Progressão do exercício ${i + 1}`}
                  value={linha.progressao}
                  onChange={(e) => mudar(i, "progressao", e.target.value)}
                  className={ESTILO_CAMPO}
                >
                  <option value="">Escolha a progressão</option>
                  {TRILHAS.map((trilha) => (
                    <optgroup key={trilha.nome} label={trilha.nome}>
                      {trilha.progressoes.map((p) => (
                        <option key={p.codigo} value={p.codigo}>
                          {p.nome}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <div className="flex items-end gap-2">
                  <label className="flex flex-1 flex-col gap-1 text-xs text-suave">
                    Séries
                    <input
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={100}
                      value={linha.series}
                      onChange={(e) => mudar(i, "series", e.target.value)}
                      className={ESTILO_CAMPO}
                    />
                  </label>
                  <label className="flex flex-1 flex-col gap-1 text-xs text-suave">
                    Reps (ou segundos)
                    <input
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={1000}
                      value={linha.reps}
                      onChange={(e) => mudar(i, "reps", e.target.value)}
                      className={ESTILO_CAMPO}
                    />
                  </label>
                  {linhas.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setLinhas((atuais) => atuais.filter((_, j) => j !== i))}
                      aria-label={`Tirar o exercício ${i + 1}`}
                      className="min-h-11 px-2 text-sm text-suave hover:text-perigo"
                    >
                      Tirar
                    </button>
                  )}
                </div>
              </div>
            ))}
            {linhas.length < LIMITE_EXERCICIOS && (
              <Botao variante="contorno" onClick={() => setLinhas((atuais) => [...atuais, { ...LINHA_VAZIA }])}>
                + Exercício
              </Botao>
            )}
          </fieldset>

          {erro && <Erro>{erro}</Erro>}

          <Botao type="submit" disabled={enviando || !texto.trim()} className="w-full">
            {enviando ? "Registrando..." : GLOSSARIO.registrarTreino}
          </Botao>
        </form>
      </Card>
    </div>
  );
}
