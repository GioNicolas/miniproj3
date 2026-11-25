"use client";

import { useState } from "react";

import { AreaDeTexto } from "@/components/AreaDeTexto";
import { Botao } from "@/components/Botao";
import { Campo } from "@/components/Campo";
import { Erro } from "@/components/Erro";
import { apiPatch, type User } from "@/lib/api";

type Props = { atual: User; onSalvo: (user: User) => void; onCancelar: () => void };

/** Nome, bio e foto (link de uma imagem). O PATCH só muda o que foi mandado. */
export function EditarPerfil({ atual, onSalvo, onCancelar }: Props) {
  const [name, setName] = useState(atual.name);
  const [bio, setBio] = useState(atual.bio);
  const [avatarUrl, setAvatarUrl] = useState(atual.avatar_url);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setSalvando(true);
    try {
      onSalvo(await apiPatch<User>("/usuarios/eu", { name: name.trim(), bio: bio.trim(), avatar_url: avatarUrl.trim() }));
    } catch (err) {
      setErro(err instanceof Error ? err.message : "não deu para salvar");
      setSalvando(false);
    }
  }

  return (
    <form onSubmit={salvar} className="space-y-4">
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
      <Campo
        rotulo="Foto (link de uma imagem)"
        type="url"
        value={avatarUrl}
        onChange={(e) => setAvatarUrl(e.target.value)}
        maxLength={300}
        placeholder="https://..."
        dica="Deixe vazio para usar a inicial do nome."
      />
      {erro && <Erro>{erro}</Erro>}
      <div className="flex gap-2">
        <Botao type="submit" disabled={salvando || !name.trim()} className="flex-1">
          {salvando ? "Salvando..." : "Salvar"}
        </Botao>
        <Botao variante="contorno" onClick={onCancelar} disabled={salvando}>
          Cancelar
        </Botao>
      </div>
    </form>
  );
}
