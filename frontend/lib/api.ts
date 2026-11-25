// Fetch tipado, único ponto de contato com o backend.
// Já preparado para receber o token da auth (guia 01, Parte 2).

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
};

export type Comentario = {
  id: number;
  post_id: number;
  texto: string;
  autor: Autor;
  created_at: string;
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
