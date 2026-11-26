"""Curtidas ("Tamo junto" no glossário): curtir e descurtir um post.

A contagem e o `eu_curti` aparecem no próprio PostOut, preenchidos em lote por
services/posts.py::montar_posts.
"""

from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from app.db import get_db
from app.deps import get_current_user
from app.models.user import User
from app.services import curtidas as service

router = APIRouter(prefix="/posts", tags=["curtidas"])


@router.post("/{post_id}/curtir", status_code=204)
def curtir(
    post_id: int,
    eu: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service.curtir(db, post_id, eu)
    return Response(status_code=204)


@router.delete("/{post_id}/curtir", status_code=204)
def descurtir(
    post_id: int,
    eu: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service.descurtir(db, post_id, eu)
    return Response(status_code=204)
