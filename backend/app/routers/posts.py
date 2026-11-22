from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from app.db import get_db
from app.deps import get_current_user
from app.models.user import User
from app.schemas.post import PostCreate, PostOut, PostUpdate
from app.services import posts as service

router = APIRouter(prefix="/posts", tags=["posts"])


@router.post("", response_model=PostOut, status_code=201)
def criar_post(
    dados: PostCreate,
    eu: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return service.montar_post(db, service.criar(db, eu, dados), eu)


@router.get("/{post_id}", response_model=PostOut)
def ver_post(
    post_id: int,
    eu: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return service.montar_post(db, service.buscar(db, post_id), eu)


@router.patch("/{post_id}", response_model=PostOut)
def editar_post(
    post_id: int,
    dados: PostUpdate,
    eu: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return service.montar_post(db, service.editar(db, post_id, eu, dados), eu)


@router.delete("/{post_id}", status_code=204)
def apagar_post(
    post_id: int,
    eu: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service.apagar(db, post_id, eu)
    return Response(status_code=204)
