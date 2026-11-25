import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select

from app.core.contadores import contador_iniciais
from app.core.grafo_follows import grafo_follows
from app.db import Base, SessionLocal, engine
from app.models.follow import Follow
from app.models.user import User
from app.routers import auth, comentarios, curtidas, explorar, follows, granja, posts, treinos, users
from app.seed import semear_se_vazio
from app.services import granja as granja_service


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(engine)
    # Reconstrói as estruturas do core/ a partir do banco (memória zera a cada
    # restart — inclusive no --reload; ver core/README.md).
    with SessionLocal() as db:
        # SEED_ON_BOOT=true (deploy, issue #14): banco vazio sobe já com o seed.
        # Sem a variável nada muda, e os testes começam do zero.
        if os.getenv("SEED_ON_BOOT", "").lower() == "true":
            semear_se_vazio(db)
        usernames = list(db.scalars(select(User.username)))
        arestas = list(db.execute(select(Follow.seguidor_id, Follow.seguido_id)).tuples())
        granja_service.reconstruir(db)
    contador_iniciais.reconstruir(usernames)
    grafo_follows.reconstruir(arestas)
    yield


app = FastAPI(title="Rede Social da Trilha", lifespan=lifespan)

origens_permitidas = ["http://localhost:3000"]
# O navegador manda a origem sem barra no fim; "https://x.app/" nunca casaria.
frontend_url = os.getenv("FRONTEND_URL", "").rstrip("/")
if frontend_url:
    origens_permitidas.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origens_permitidas,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1 linha por feature — registre o seu router aqui.
app.include_router(users.router)
app.include_router(auth.router)
app.include_router(posts.router)
app.include_router(treinos.router)
app.include_router(comentarios.router)
app.include_router(explorar.router)
app.include_router(follows.router)
app.include_router(curtidas.router)
app.include_router(granja.router)
