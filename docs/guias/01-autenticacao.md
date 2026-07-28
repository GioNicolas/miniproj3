# Guia 01 — Autenticação (a feature que destrava tudo)

Auth **não vem pronta** — ela é do trio, de ponta a ponta, back e front. Mas este
guia decide o desenho por você e anda de mãos dadas com os testes: cada passo
termina com um comando e a saída esperada.

**O contrato é `tests/test_nucleo.py`**: `test_auth_registro`, `test_auth_login`
e `test_auth_eu`. A implementação está pronta quando os três testes ficam verdes
e o login funciona pelo Swagger.

## O desenho (leia antes de codar — 30 segundos)

1. Senha **nunca** é guardada — guarda-se o **hash** (bcrypt, já pinado no `pyproject.toml`).
2. Login troca senha por um **token opaco** (string aleatória) salvo numa tabela `sessions`.
3. Toda request protegida manda `Authorization: Bearer <token>`; `get_current_user`
   procura o token na tabela e devolve o `User`.
4. Por que não JWT? JWT é o guia 05 (opcional, depois). Token em tabela é mais
   simples de entender, debugar e revogar — e é auth de verdade.

---

## Passo 0 — destrave seus colegas

Quase tudo depende de "usuário logado", mas ninguém pode esperar a auth ficar
pronta. Cole isto em `app/deps.py` no lugar do `NotImplementedError` — e
**entenda as 3 linhas do if antes de commitar**:

```python
import os

from fastapi import Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.user import User


def get_current_user(
    x_user_id: int | None = Header(default=None),
    db: Session = Depends(get_db),
) -> User:
    # bypass de DESENVOLVIMENTO: só funciona com DEBUG=true.
    # O grader NUNCA roda com DEBUG — sem a auth real, rota protegida = 401.
    if os.environ.get("DEBUG") == "true" and x_user_id is not None:
        user = db.get(User, x_user_id)
        if user:
            return user
    raise HTTPException(status_code=401, detail="não autenticado")
```

As 3 linhas do if: (1) o bypass só existe se a variável de ambiente `DEBUG`
estiver ligada; (2) o header `X-User-Id` diz "finja que sou o usuário N";
(3) se o usuário existe no banco, a rota recebe ele como se estivesse logado.

**Verificação** — cole esta rota temporária no fim de `app/routers/users.py`
(apague no Passo 3, quando `/auth/eu` a substituir):

```python
from fastapi import Depends
from app.deps import get_current_user

@router.get("/eu-temporario")
def quem_sou(user=Depends(get_current_user)):
    return {"id": user.id, "username": user.username}
```

```bash
make seed
DEBUG=true make dev-back        # num terminal
curl localhost:8000/usuarios/eu-temporario -H "X-User-Id: 1"
# → {"id":1,"username":"ada"}
curl localhost:8000/usuarios/eu-temporario
# → {"detail":"não autenticado"}
```

Pronto: quem pegou posts/feed/curtidas já pode proteger rotas com
`Depends(get_current_user)` e desenvolver em paralelo desde hoje.

---

## Parte 1 — a auth de verdade (backend)

### Passo 1 — registro (`test_auth_registro`)

**1.1** Remova o `@pytest.mark.skip` de `test_auth_registro` e veja o contrato falhar:

```bash
cd backend && uv run pytest -q -k auth_registro
# → FAILED ... assert 404 == 201        (a rota não existe — sua tarefa é essa)
```

**1.2** Adicione a coluna do hash em `app/models/user.py`:

```python
password_hash: Mapped[str] = mapped_column(String(100), default="")
```

⚠️ SQLite não altera tabela sozinho: **apague o `app.db`** e rode `make seed`
de novo (erro "no such column" = você esqueceu isso; ver guia 04).

**1.3** Crie `app/schemas/auth.py`:

```python
from pydantic import BaseModel, Field


class RegistroIn(BaseModel):
    username: str = Field(min_length=3, max_length=30, pattern=r"^[a-z0-9_]+$")
    name: str = Field(min_length=1, max_length=80)
    password: str = Field(min_length=8)


class LoginIn(BaseModel):
    username: str
    password: str


class TokenOut(BaseModel):
    token: str
```

**1.4** Crie `app/routers/auth.py` com o `POST /auth/registro`. O hash:

```python
import bcrypt

hash_ = bcrypt.hashpw(dados.password.encode(), bcrypt.gensalt()).decode()
```

(`gensalt()` embute um salt aleatório no próprio hash — dois usuários com a
mesma senha têm hashes diferentes.) A resposta é o `UserOut` de sempre — o
teste confere que **nenhum** campo de senha vaza. Username duplicado → 409,
igual ao slice de exemplo. Registre o router em `main.py` (1 linha).

**1.5** Verificação:

```bash
uv run pytest -q -k auth_registro
# → 1 passed
```

### Passo 2 — login (`test_auth_login`)

**2.1** Remova o skip e veja falhar (`assert 404 == 200`).

**2.2** Crie `app/models/session.py` (e importe em `app/models/__init__.py`):

```python
from datetime import datetime, timezone

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


class Session(Base):
    __tablename__ = "sessions"

    token: Mapped[str] = mapped_column(String(64), primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(
        default=lambda: datetime.now(timezone.utc)
    )
```

**2.3** `POST /auth/login`: busque o user pelo username, confira a senha com
`bcrypt.checkpw(dados.password.encode(), user.password_hash.encode())`, crie a
sessão com `secrets.token_urlsafe(32)` e devolva `{"token": ...}`.

Senha errada **ou** username inexistente → o MESMO 401 genérico. (Responder
"usuário não existe" entrega a lista de usuários para quem está chutando.)

**2.4** Verificação:

```bash
uv run pytest -q -k auth_login
# → 1 passed
curl -s -X POST localhost:8000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"ada","password":"errada"}'
# → {"detail":"..."} com status 401
```

### Passo 3 — o `get_current_user` real (`test_auth_eu`)

**3.1** Remova o skip e veja falhar.

**3.2** **Troque o corpo** do `get_current_user` (o momento prometido no Passo
0): leia o header `Authorization`, aceite só o formato `Bearer <token>`, busque
a sessão, devolva o dono. O bypass DEBUG continua em cima — ele não atrapalha:
o grader roda sem DEBUG.

```python
import os

from fastapi import Depends, Header, HTTPException
from sqlalchemy.orm import Session as DbSession

from app.db import get_db
from app.models.session import Session
from app.models.user import User


def get_current_user(
    authorization: str | None = Header(default=None),
    x_user_id: int | None = Header(default=None),
    db: DbSession = Depends(get_db),
) -> User:
    if os.environ.get("DEBUG") == "true" and x_user_id is not None:
        user = db.get(User, x_user_id)
        if user:
            return user

    if authorization and authorization.startswith("Bearer "):
        token = authorization.removeprefix("Bearer ")
        sessao = db.get(Session, token)
        if sessao:
            return db.get(User, sessao.user_id)

    raise HTTPException(status_code=401, detail="não autenticado")
```

**3.3** `GET /auth/eu` em `routers/auth.py` — a rota protegida mais curta que existe:

```python
@router.get("/eu", response_model=UserOut)
def eu(user: User = Depends(get_current_user)):
    return user
```

Apague a `/eu-temporario` do Passo 0.

**3.4** Verificação:

```bash
uv run pytest -q -k auth
# → 3 passed
curl -s -X POST localhost:8000/auth/login -H 'Content-Type: application/json' \
  -d '{"username":"ada","password":"<a senha que você registrou>"}'
# copie o token e:
curl -s localhost:8000/auth/eu -H "Authorization: Bearer <token>"
# → seu usuário
```

Bônus imediato: a fixture `logar`/`auth_client` dos testes agora funciona — os
testes de posts/feed/curtidas ficam destraváveis para o resto do trio.

---

## Parte 2 — o front

Decisão tomada pelo guia: **token no `localStorage`**. Trade-off honesto em um
parágrafo: `localStorage` é vulnerável a XSS (script injetado lê o token),
cookie `httpOnly` é vulnerável a CSRF e exige config de CORS com credenciais.
Para este projeto, `localStorage` ganha por ser mais simples de entender e
debugar — em produção você estudaria as duas opções (e o guia 05 fala de JWT).

### Passo 4 — `lib/api.ts` manda o token

Troque a função `headers()` (ela já existe, esperando por você):

```ts
function headers(): HeadersInit {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token) h["Authorization"] = `Bearer ${token}`;
  return h;
}
```

### Passo 5 — páginas `/registro` e `/login` (suas, no molde do slice)

Copie a estrutura de `app/usuarios/page.tsx` (form `use client` controlado +
`apiPost`). O que muda no submit do login:

```ts
const { token } = await apiPost<{ token: string }>("/auth/login", { username, password });
localStorage.setItem("token", token);
router.push("/");   // useRouter() de "next/navigation"
```

Registro: chama `/auth/registro` e em seguida o mesmo fluxo de login (ou manda
para `/login`). Logout = `localStorage.removeItem("token")` num botão da navbar.

### Passo 6 — guarda de rota mínima

Um hook de 8 linhas resolve (crie `lib/useExigeLogin.ts` e chame no topo de
toda página privada):

```ts
"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function useExigeLogin() {
  const router = useRouter();
  useEffect(() => {
    if (!localStorage.getItem("token")) router.push("/login");
  }, [router]);
}
```

### Verificação final (ponta a ponta)

1. `make dev-back` (sem DEBUG!) + `make dev-front`.
2. Na UI: registrar → logar → abrir o DevTools (F12) → aba Network → qualquer
   request tem `Authorization: Bearer ...`.
3. `localStorage.getItem("token")` no console devolve o token.
4. Apagar o token no console e recarregar → a página privada manda para `/login`.

Deu erro? Os 4 clássicos desta parte estão no guia 04: **401 sem header**
(esqueceu o Passo 4), **token some no refresh** (salvou em variável em vez de
`localStorage`), **`use client` faltando** (useState em server component) e
**CORS** (backend fora do ar ou porta errada).
