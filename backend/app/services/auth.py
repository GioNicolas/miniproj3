import secrets

import bcrypt
from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.sessao import Sessao
from app.models.user import User
from app.schemas.auth import LoginIn, RegistroIn
from app.schemas.user import UserCreate
from app.services import users


def registrar(db: Session, dados: RegistroIn) -> User:
    # gensalt() embute um salt aleatório no hash: senhas iguais geram hashes diferentes.
    password_hash = bcrypt.hashpw(dados.password.encode(), bcrypt.gensalt()).decode()
    perfil = UserCreate(username=dados.username, name=dados.name)
    return users.criar(db, perfil, password_hash=password_hash)


def logar(db: Session, dados: LoginIn) -> str:
    user = db.scalar(select(User).where(User.username == dados.username))
    # Mesmo 401 para usuário inexistente, sem senha ou senha errada: não revela
    # quais usernames existem. O hash vazio é checado antes porque o bcrypt
    # explode (ValueError: Invalid salt) em vez de devolver False.
    if not user or not user.password_hash or not bcrypt.checkpw(
        dados.password.encode(), user.password_hash.encode()
    ):
        raise HTTPException(status_code=401, detail="usuário ou senha inválidos")

    sessao = Sessao(token=secrets.token_urlsafe(32), user_id=user.id)
    db.add(sessao)
    db.commit()
    return sessao.token


def usuario_do_token(db: Session, token: str) -> User | None:
    sessao = db.get(Sessao, token)
    return db.get(User, sessao.user_id) if sessao else None
