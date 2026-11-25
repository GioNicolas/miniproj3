"""Seed mínimo: usuários de exemplo para a rede não abrir vazia.

Roda na subida da API com SEED_ON_BOOT=true quando o banco não tem nenhum
usuário (ver o lifespan em main.py) e também por `make seed`. Num banco que já tem gente, não
faz nada.
"""

import bcrypt
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User

# A mesma senha para todo usuário do seed, para dar para logar na demo.
SENHA_SEED = "senha-forte-123"

USUARIOS = [
    ("ada", "Ada Lovelace", "a primeira a programar"),
    ("linus", "Linus Torvalds", "just for fun"),
    ("grace", "Grace Hopper", "caçadora de bugs literais"),
]


def semear_se_vazio(db: Session) -> int:
    """Cria os usuários do seed se o banco não tem nenhum. Devolve quantos criou."""
    if db.scalar(select(User.id).limit(1)) is not None:
        return 0
    hash_seed = bcrypt.hashpw(SENHA_SEED.encode(), bcrypt.gensalt()).decode()
    db.add_all(
        User(username=username, name=name, bio=bio, password_hash=hash_seed)
        for username, name, bio in USUARIOS
    )
    db.commit()
    return len(USUARIOS)
