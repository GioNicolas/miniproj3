from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session

from app.db import get_db
from app.deps import get_current_user
from app.models.user import User
from app.schemas.comentario import ComentarioCreate, ComentarioOut, ComentarioPage
from app.services import comentarios as service

router = APIRouter(prefix="/posts/{post_id}/comentarios", tags=["comentarios"])


@router.post("", response_model=ComentarioOut, status_code=201)
def comentar(
    post_id: int,
    dados: ComentarioCreate,
    eu: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return service.comentar(db, post_id, eu, dados)


@router.get("", response_model=ComentarioPage)
def listar_comentarios(
    post_id: int,
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=100),
    eu: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    items, total = service.listar(db, post_id, offset, limit)
    return ComentarioPage(items=items, total=total, offset=offset, limit=limit)


@router.delete("/{comentario_id}", status_code=204)
def apagar_comentario(
    post_id: int,
    comentario_id: int,
    eu: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service.apagar(db, post_id, comentario_id, eu)
    return Response(status_code=204)
