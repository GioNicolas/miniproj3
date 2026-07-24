# Guia 10 — Do zero ao esqueleto em ~30 minutos

No hackathon não vai ter template: a primeira hora é a página em branco. Este
guia recria, do zero, um esqueleto equivalente ao deste repo — backend FastAPI
+ SQLite e front Next falando entre si. Treine antes; no dia, isso sai no
piloto automático.

## Os 10 comandos

```bash
# backend
mkdir meu-projeto && cd meu-projeto            # 1
uv init backend && cd backend                  # 2
uv add fastapi "uvicorn[standard]" sqlalchemy  # 3
# crie app.py com os blocos 1 e 2 abaixo       # 4
uv run uvicorn app:app --reload                # 5
curl localhost:8000/ping                       # 6  → {"pong":true}

# frontend (em outro terminal, na raiz do projeto)
npx create-next-app@latest frontend --ts --tailwind --app --no-src-dir --yes  # 7
cd frontend                                    # 8
# crie lib/api.ts com o bloco 3 abaixo         # 9
npm run dev                                    # 10 → localhost:3000
```

## Os 3 blocos de cola

Decore onde encontrá-los, não o conteúdo — no hackathon você cola daqui.

**Bloco 1 — FastAPI + CORS** (sem isso o front toma erro de CORS na primeira
chamada):

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/ping")
def ping():
    return {"pong": True}
```

**Bloco 2 — SQLite + sessão** (o `db.py` de qualquer projeto):

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

engine = create_engine("sqlite:///./app.db", connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)

class Base(DeclarativeBase):
    pass

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

(Models: classe herdando de `Base` + `Base.metadata.create_all(engine)` no
startup — igual ao `main.py` deste repo.)

**Bloco 3 — fetch tipado no front** (`lib/api.ts`):

```ts
const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`GET ${path} → ${res.status}`);
  return res.json();
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${path} → ${res.status}`);
  return res.json();
}
```

## Prova de fogo

Uma página `"use client"` chamando `apiGet("/ping")` e mostrando o resultado.
Se apareceu `pong` na tela, o esqueleto está de pé: model → rota → fetch →
tela é o mesmo caminho do slice `/usuarios` deste repo.

**Faça isso 1 vez na semana antes do hackathon, cronometrado.** Meta: 30
minutos sem consultar nada além desta página.
