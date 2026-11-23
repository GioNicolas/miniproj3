from fastapi import HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.contadores import contador_iniciais
from app.models.user import User
from app.schemas.user import UserCreate


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
