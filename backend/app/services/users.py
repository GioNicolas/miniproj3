from fastapi import HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.contadores import contador_iniciais
from app.models.user import User
from app.schemas.user import PerfilOut, UserCreate, UserOut, UserUpdate
from app.services import follows, frango, progressoes


def listar(db: Session, offset: int, limit: int) -> tuple[list[User], int]:
    total = db.scalar(select(func.count()).select_from(User)) or 0
    users = list(
        db.scalars(
            select(User).order_by(User.username).offset(offset).limit(limit)
        )
    )
    return users, total


def criar(db: Session, dados: UserCreate, password_hash: str = "") -> User:
    ja_existe = db.scalar(select(User).where(User.username == dados.username))
    if ja_existe:
        raise HTTPException(status_code=409, detail="username já existe")

    user = User(**dados.model_dump(), password_hash=password_hash)
    db.add(user)
    db.commit()
    db.refresh(user)

    contador_iniciais.incrementar(user.username)
    return user


def atualizar(db: Session, eu: User, dados: UserUpdate) -> User:
    mudancas = dados.model_dump(exclude_unset=True)
    equipamentos = mudancas.pop("equipamentos", None)
    if equipamentos is not None:
        progressoes.trocar_equipamentos(db, eu, equipamentos)
    for campo, valor in mudancas.items():
        setattr(eu, campo, valor)
    db.commit()
    db.refresh(eu)
    return eu


def buscar_por_username(db: Session, username: str) -> User:
    user = db.scalar(select(User).where(User.username == username))
    if user is None:
        raise HTTPException(status_code=404, detail="usuário não encontrado")
    return user


def perfil(db: Session, username: str, eu: User) -> PerfilOut:
    user = buscar_por_username(db, username)
    return PerfilOut(
        **UserOut.model_validate(user).model_dump(),
        **follows.contadores(user.id, eu.id),
        frango=frango.do_usuario(db, user.id),
    )
