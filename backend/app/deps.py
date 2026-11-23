"""Dependências compartilhadas dos endpoints.

get_current_user é a porta de entrada da autenticação: toda rota protegida
declara `user: User = Depends(get_current_user)`.
"""

import os

from fastapi import Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.user import User
from app.services.auth import usuario_do_token


def get_current_user(
    authorization: str | None = Header(default=None),
    x_user_id: int | None = Header(default=None),
    db: Session = Depends(get_db),
) -> User:
    # Bypass de DESENVOLVIMENTO (guia 01, Passo 0): só funciona com DEBUG=true.
    # Em produção não existe DEBUG, então só o token abaixo autentica.
    if os.environ.get("DEBUG") == "true" and x_user_id is not None:
        user = db.get(User, x_user_id)
        if user:
            return user

    # Auth real: header "Authorization: Bearer <token>" de uma sessão do login.
    if authorization and authorization.startswith("Bearer "):
        user = usuario_do_token(db, authorization.removeprefix("Bearer "))
        if user:
            return user

    raise HTTPException(status_code=401, detail="não autenticado")
