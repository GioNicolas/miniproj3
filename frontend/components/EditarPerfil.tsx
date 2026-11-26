"use client";

import { useEffect, useRef, useState } from "react";

import { AreaDeTexto } from "@/components/AreaDeTexto";
import { Avatar } from "@/components/Avatar";
import { Botao } from "@/components/Botao";
import { Campo } from "@/components/Campo";
import { Erro } from "@/components/Erro";
import { apiPatch, removerFotoDePerfil, subirFotoDePerfil, type User } from "@/lib/api";
import { reduzirFoto } from "@/lib/foto";

type Props = { atual: User; onSalvo: (user: User) => void; onCancelar: () => void };

// O avatar aparece no máximo com 96px; 512px sobra para telas de alta densidade.
const LADO_DA_FOTO = 512;

/** Nome, bio e foto (escolhida dos arquivos, #75). O PATCH só muda o que foi mandado. */
export function EditarPerfil({ atual, onSalvo, onCancelar }: Props) {
  const [name, setName] = useState(atual.name);
  const [bio, setBio] = useState(atual.bio);
  // null: mantém a foto que já tem; Blob: foto nova escolhida; "tirar": volta para as iniciais
  const [foto, setFoto] = useState<Blob | "tirar" | null>(null);
  const [previa, setPrevia] = useState<string | null>(null);
  const [preparando, setPreparando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const seletor = useRef<HTMLInputElement>(null);

  // a prévia é um link local para a foto escolhida; some quando ela muda
  useEffect(() => {
    if (!(foto instanceof Blob)) return setPrevia(null);
    const url = URL.createObjectURL(foto);
    setPrevia(url);
    return () => URL.revokeObjectURL(url);
  }, [foto]);

  const fotoNaTela = foto === "tirar" ? "" : previa ?? atual.avatar_url;

  async function escolher(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    e.target.value = ""; // escolher a mesma foto de novo também dispara
    if (!arquivo) return;
    setErro(null);
    setPreparando(true);
    try {
      setFoto(await reduzirFoto(arquivo, LADO_DA_FOTO));
    } catch {
      setErro("não deu para abrir essa foto, tenta outra");
    } finally {
      setPreparando(false);
    }
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setSalvando(true);
    try {
      let user = await apiPatch<User>("/usuarios/eu", { name: name.trim(), bio: bio.trim() });
      if (foto instanceof Blob) user = await subirFotoDePerfil(foto);
      else if (foto === "tirar") user = await removerFotoDePerfil();
      onSalvo(user);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "não deu para salvar");
      setSalvando(false);
    }
  }

  return (
    <form onSubmit={salvar} className="space-y-4">
      <fieldset className="flex items-center gap-4">
        <legend className="sr-only">Foto de perfil</legend>
        <Avatar name={name || atual.name} avatarUrl={fotoNaTela} tamanho="g" />
        <div className="flex flex-col items-start gap-1">
          <input ref={seletor} type="file" accept="image/*" onChange={escolher} className="hidden" />
          <Botao variante="contorno" onClick={() => seletor.current?.click()} disabled={preparando || salvando}>
            {preparando ? "Preparando…" : fotoNaTela ? "Trocar foto" : "Escolher foto"}
          </Botao>
          {fotoNaTela && (
            <button
              type="button"
              onClick={() => setFoto(atual.avatar_url ? "tirar" : null)}
              disabled={salvando}
              className="min-h-11 text-[13px] font-semibold text-suave hover:text-tinta"
            >
              Tirar foto
            </button>
          )}
          {foto !== null && <span className="text-xs text-suave">A foto muda quando você salvar.</span>}
        </div>
      </fieldset>
      <Campo rotulo="Nome" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} required />
      <label className="flex flex-col gap-1 text-sm font-semibold">
        Bio
        <AreaDeTexto
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={280}
          rows={3}
          placeholder="Ex.: 2 meses de barra, atrás da primeira barra fixa"
          className="font-normal"
        />
        <span className="text-xs font-normal text-suave">{bio.length}/280</span>
      </label>
      {erro && <Erro>{erro}</Erro>}
      <div className="flex gap-2">
        <Botao type="submit" disabled={salvando || preparando || !name.trim()} className="flex-1">
          {salvando ? "Salvando..." : "Salvar"}
        </Botao>
        <Botao variante="contorno" onClick={onCancelar} disabled={salvando}>
          Cancelar
        </Botao>
      </div>
    </form>
  );
}
