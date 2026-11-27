// Fetch tipado, único ponto de contato com o backend.
// Já preparado para receber o token da auth (guia 01, Parte 2).

import type { Patente } from "@/lib/glossario";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

function headers(): HeadersInit {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  // Token salvo no login (guia 01, Passo 4). Único lugar que monta o Authorization.
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token) h["Authorization"] = `Bearer ${token}`;
  return h;
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: headers(),
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });

  // 401 com token salvo = token que não vale mais (ex.: o banco foi apagado ou o
  // servidor do deploy reiniciou). Joga o token fora e volta para o login.
  if (res.status === 401 && typeof window !== "undefined" && localStorage.getItem("token")) {
    localStorage.removeItem("token");
    if (window.location.pathname !== "/login") window.location.href = "/login";
  }

  if (!res.ok) {
    // 422 = corpo inválido; 409 = conflito (ex.: username repetido). Ver guia 04.
    const erro = await res.json().catch(() => null);
    const detail = typeof erro?.detail === "string" ? erro.detail : null;
    throw new Error(detail ?? `${method} ${path} → ${res.status}`);
  }

  // 204 No Content (seguir, curtir, apagar...) não tem corpo: não há JSON para ler.
  if (res.status === 204) return undefined as T;
  return res.json();
}

export function apiGet<T>(path: string): Promise<T> {
  return request<T>("GET", path);
}

export function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return request<T>("POST", path, body);
}

export function apiPatch<T>(path: string, body: unknown): Promise<T> {
  return request<T>("PATCH", path, body);
}

export function apiDelete<T = void>(path: string): Promise<T> {
  return request<T>("DELETE", path);
}

/** URL completa de um caminho da API, para <img src> (a foto do post vem como "/posts/1/imagem/..."). */
export function urlDaApi(path: string): string {
  return `${BASE}${path}`;
}

/** Sobe a foto opcional do post (multipart, campo "arquivo"). Só o autor. */
export async function subirFotoDoPost(postId: number, foto: Blob): Promise<{ imagem_url: string }> {
  const corpo = new FormData();
  corpo.append("arquivo", foto, "foto.jpg");
  const token = localStorage.getItem("token");
  // sem Content-Type: o navegador monta o multipart com o boundary certo
  const res = await fetch(`${BASE}/posts/${postId}/imagem`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: corpo,
  });
  if (!res.ok) {
    const erro = await res.json().catch(() => null);
    throw new Error(typeof erro?.detail === "string" ? erro.detail : `a foto não subiu (${res.status})`);
  }
  return res.json();
}

async function enviarFoto<T>(method: "POST" | "DELETE", path: string, foto?: Blob): Promise<T> {
  let corpo: FormData | undefined;
  if (foto) {
    corpo = new FormData();
    corpo.append("arquivo", foto, "foto.jpg");
  }
  const token = localStorage.getItem("token");
  // sem Content-Type: o navegador monta o multipart com o boundary certo
  const res = await fetch(`${BASE}${path}`, { method, headers: token ? { Authorization: `Bearer ${token}` } : {}, body: corpo });
  if (!res.ok) {
    const erro = await res.json().catch(() => null);
    throw new Error(typeof erro?.detail === "string" ? erro.detail : `a foto não subiu (${res.status})`);
  }
  return res.json();
}

/** Troca a foto de perfil por uma escolhida dos arquivos. Devolve o usuário com o avatar_url novo. */
export function subirFotoDePerfil(foto: Blob): Promise<User> {
  return enviarFoto<User>("POST", "/usuarios/eu/foto", foto);
}

/** Tira a foto de perfil: o avatar volta para as iniciais do nome. */
export function removerFotoDePerfil(): Promise<User> {
  return enviarFoto<User>("DELETE", "/usuarios/eu/foto");
}

// ---- tipos do slice de exemplo (espelham backend/app/schemas/user.py) ----

export type User = {
  id: number;
  username: string;
  name: string;
  bio: string;
  avatar_url: string;
  created_at: string;
};

export type Page<T> = {
  items: T[];
  total: number;
  offset: number;
  limit: number;
};

// ---- posts (espelham backend/app/schemas/post.py) ----

export type Autor = {
  username: string;
  name: string;
  avatar_url: string;
  nivel?: Patente | null; // patente do frango (#11), vem nos posts
};

export type Exercicio = {
  progressao: string;
  series: number | null;
  reps: number | null;
};

export type Treino = {
  exercicios: Exercicio[];
};

export type Post = {
  id: number;
  texto: string;
  autor: Autor;
  created_at: string;
  curtidas: number;
  comentarios: number;
  eu_curti: boolean;
  treino: Treino | null;
  imagem_url: string | null; // caminho na API; usar urlDaApi() para montar o src
};

export type Comentario = {
  id: number;
  post_id: number;
  texto: string;
  autor: Autor;
  created_at: string;
};

// ---- perfil (espelha PerfilOut de backend/app/schemas/user.py) ----

export type Perfil = User & {
  seguidores: number;
  seguindo: number;
  eu_sigo: boolean;
  frango: Frango;
};

// espelha FrangoOut: o estado calculado por backend/app/core/frango.py (#11)
export type Frango = {
  nivel: Patente;
  forca: number;
  dias_sem_treinar: number | null; // null: nunca treinou
  definhando: boolean;
  proximo_nivel: Patente | null;
  falta_para_proximo: number;
};

// ---- chat (espelham backend/app/schemas/conversa.py) ----

export type Mensagem = {
  id: number;
  conversa_id: number;
  texto: string;
  autor: Autor;
  created_at: string;
};

export type Conversa = {
  id: number;
  nome: string | null;
  direta: boolean;
  participantes: Autor[]; // inclui você
  ultima_mensagem: Mensagem | null;
  nao_lidas: number;
  atualizada_em: string;
};

// ---- Granja da Semana (espelha backend/app/schemas/granja.py) ----

export type UsuarioNaGranja = {
  username: string;
  name: string;
  avatar_url: string;
  nivel?: Patente | null; // patente do frango (#11), para o pódio
};

export type Colocado = {
  posicao: number;
  usuario: UsuarioNaGranja;
  dias_treinados: number;
};

export type Granja = {
  semana_inicio: string;
  items: Colocado[];
  eu: Colocado;
  alvo: { usuario: UsuarioNaGranja; dias_treinados: number; faltam_dias: number } | null;
  dias_que_ainda_contam: number;
};

// ---- árvore de progressões (espelha backend/app/schemas/progressao.py, #10) ----

export type Equipamento = "barra_fixa" | "paralelas" | "elastico";
export type EstadoDaSkill = "dominada" | "disponivel" | "bloqueada";

export type SkillNaArvore = {
  codigo: string;
  nome: string;
  trilha: string;
  prerequisitos: string[];
  equipamento: Equipamento[];
  nivel: number; // 1 = raiz
  estado: EstadoDaSkill;
};

// GET /progressoes: a árvore de quem está logado, em ordem topológica
export type Arvore = {
  equipamentos: Equipamento[];
  progressoes: SkillNaArvore[];
};

// GET /usuarios/{username}/progressoes
export type SkillDominada = { codigo: string; nome: string; trilha: string };
