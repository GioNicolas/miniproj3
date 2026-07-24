# Guia 04 — Erros clássicos (erro → causa → conserto)

Procure a mensagem que você está vendo (Ctrl+F ajuda). Cada bloco traz a
mensagem literal, a causa e o conserto. Regra geral antes de tudo: leia o
traceback **de baixo para cima** (guia 03, item 5).

## Resumo

| Você vê | Vá para |
|---|---|
| `422 Unprocessable Entity` | [1](#1-422-no-post) |
| `blocked by CORS policy` no console | [2](#2-cors) |
| `useState only works in a Client Component` | [3](#3-use-client) |
| `TypeError: Failed to fetch` | [4](#4-failed-to-fetch) |
| `401 {"detail":"não autenticado"}` com login feito | [5](#5-401-com-login-feito) |
| deslogou sozinho no F5 | [6](#6-token-some-no-refresh) |
| `no such column` | [7](#7-no-such-column) |
| contador/estrutura do core/ zera sozinho | [8](#8-core-zerando) |
| conflito em `app.db` | [9](#9-conflito-binario) |
| `error reading bcrypt version` | [10](#10-bcrypt) |

## 1. 422 no POST

```
POST /posts → 422
{"detail":[{"type":"missing","loc":["body","texto"],"msg":"Field required",...}]}
```

**Causa:** o corpo não bate com o schema — campo faltando/nome errado, ou o
fetch foi sem `Content-Type: application/json` / sem `JSON.stringify(body)`.
**Conserto:** o `loc` diz exatamente qual campo. No front, use sempre
`apiPost()` do `lib/api.ts` (ele já põe header e stringify). Teste o endpoint
puro no Swagger (`:8000/docs`): funcionou lá = o problema é o seu fetch.

## 2. CORS

```
Access to fetch at 'http://localhost:8000/posts' from origin
'http://localhost:3000' has been blocked by CORS policy
```

**Causa:** quase nunca é CORS de verdade — o backend caiu ou a URL está
errada, e o browser reporta como CORS. O template já libera
`localhost:3000`.
**Conserto:** confira o terminal do `make dev-back` (está de pé? deu
traceback?) e o `NEXT_PUBLIC_API_URL` no `.env.local` (é `http://localhost:8000`?).
Mudou o `.env.local`? Reinicie o `make dev-front`.

## 3. use client

```
You're importing a component that needs `useState`. This React Hook only
works in a Client Component. To fix, mark the file (or its parent) with
the "use client" directive.
```

**Causa:** página com estado/efeito sem a primeira linha `"use client"`.
**Conserto:** adicione `"use client";` na PRIMEIRA linha do arquivo (antes dos
imports). Referência: `app/usuarios/page.tsx`.

## 4. failed to fetch

```
TypeError: Failed to fetch
```

**Causa:** backend fora do ar, porta errada, ou http/https trocado.
**Conserto:** `curl localhost:8000/usuarios` num terminal. Não respondeu →
suba com `make dev-back`. Respondeu → confira `NEXT_PUBLIC_API_URL`.

## 5. 401 com login feito

```
GET /feed → 401 {"detail":"não autenticado"}
```

**Causa:** o token não está indo no request — você fez login mas esqueceu o
Passo 4 do guia 01 (o `headers()` do `lib/api.ts` que lê o `localStorage`).
**Conserto:** F12 → Network → clique no request → o header
`Authorization: Bearer ...` existe? Não → Passo 4. Existe e mesmo assim 401 →
o token não está na tabela `sessions` (banco apagado? faça login de novo).

## 6. token some no refresh

**Sintoma:** logado, aperta F5, deslogou.
**Causa:** token guardado em variável/useState — memória de JS morre no reload.
**Conserto:** `localStorage.setItem("token", ...)` no login (guia 01, Passo 5)
e leitura no `headers()`. Confira no console: `localStorage.getItem("token")`.

## 7. no such column

```
sqlite3.OperationalError: no such column: users.password_hash
```

**Causa:** você mudou um model, mas o `app.db` foi criado antes — SQLite não
altera tabela sozinho (migração de verdade é o Alembic, fora do escopo).
**Conserto:**

```bash
rm backend/app.db && make seed
```

Perder o banco local é normal e barato — dado que importa se recria com seed.

## 8. core/ zerando

**Sintoma:** o contador/estrutura em `core/` volta a zero "sozinho" durante o
desenvolvimento.
**Causa:** `uvicorn --reload` reinicia o processo a cada arquivo salvo — o
singleton zera e é **reconstruído do banco** no startup. Se a sua estrutura
não é alimentada no startup, ela renasce vazia.
**Conserto:** garanta que ela entra no rebuild do lifespan (`main.py`) — o
padrão completo está em `backend/app/core/README.md`.

## 9. conflito binário

```
CONFLICT (content): Merge conflict in backend/app.db
warning: Cannot merge binary files
```

**Causa:** alguém commitou o banco.
**Conserto:** receita completa no guia 02 ("Commitei o app.db") —
`git rm --cached` + confere `.gitignore`. Nunca tente "resolver" o conflito
do binário: apague e re-seede.

## 10. bcrypt

```
(trapped) error reading bcrypt version
AttributeError: module 'bcrypt' has no attribute '__about__'
```

**Causa:** essa é a incompatibilidade famosa entre `passlib` e `bcrypt`
moderno. Você instalou `passlib` por conta própria (algum tutorial mandou).
**Conserto:** não use passlib — o projeto pina `bcrypt` no `pyproject.toml` e
o guia 01 usa `bcrypt.hashpw`/`bcrypt.checkpw` direto. Remova o passlib:
`uv remove passlib` e siga o guia 01, Passo 1.4.

---

Não achou seu erro aqui? Antes de chamar monitor: traceback de baixo para
cima, Swagger para isolar back×front, e `git diff` para ver o que mudou desde
o último estado que funcionava.
