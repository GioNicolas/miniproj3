from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db import get_db
from app.deps import get_current_user
from app.models.user import User
from app.schemas.post import PostOut
from app.schemas.treino import DiasTreinadosOut, TreinoCreate
from app.services import posts
from app.services import treinos as service

router = APIRouter(tags=["treinos"])


@router.post("/treinos", response_model=PostOut, status_code=201)
def registrar_treino(
    dados: TreinoCreate,
    eu: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return posts.montar_post(db, service.registrar(db, eu, dados), eu)


@router.get(
    "/usuarios/{username}/treinos",
    response_model=DiasTreinadosOut,
    dependencies=[Depends(get_current_user)],
)
def dias_treinados(
    username: str,
    dias: int = Query(default=28, ge=1, le=365),
    db: Session = Depends(get_db),
):
    return DiasTreinadosOut(dias=service.dias_do_usuario(db, username, dias))
