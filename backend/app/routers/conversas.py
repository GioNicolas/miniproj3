from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session

from app.db import get_db
from app.deps import get_current_user
from app.models.user import User
from app.schemas.conversa import (
    ConversaCreate,
    ConversaOut,
    ConversaPage,
    MensagemCreate,
    MensagemOut,
    MensagemPage,
    NaoLidasOut,
)
from app.services import conversas as service

router = APIRouter(prefix="/conversas", tags=["conversas"])


@router.post("", response_model=ConversaOut, status_code=201)
def criar_conversa(
    dados: ConversaCreate,
    response: Response,
    eu: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    conversa, criada = service.criar(db, eu, dados)
    if not criada:
        response.status_code = 200  # conversa direta que já existia
    return service.montar(db, [conversa], eu)[0]


@router.get("", response_model=ConversaPage)
def listar_conversas(
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=100),
    eu: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    items, total = service.listar(db, eu, offset, limit)
    return ConversaPage(items=items, total=total, offset=offset, limit=limit)


# Antes de /{conversa_id}: senão "nao-lidas" seria lido como id.
@router.get("/nao-lidas", response_model=NaoLidasOut)
def nao_lidas(eu: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return NaoLidasOut(total=service.total_nao_lidas(db, eu))


@router.get("/{conversa_id}", response_model=ConversaOut)
def buscar_conversa(
    conversa_id: int, eu: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    return service.buscar(db, conversa_id, eu)


@router.get("/{conversa_id}/mensagens", response_model=MensagemPage)
def listar_mensagens(
    conversa_id: int,
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=100),
    eu: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    items, total = service.mensagens(db, conversa_id, eu, offset, limit)
    return MensagemPage(items=items, total=total, offset=offset, limit=limit)


@router.post("/{conversa_id}/mensagens", response_model=MensagemOut, status_code=201)
def enviar_mensagem(
    conversa_id: int,
    dados: MensagemCreate,
    eu: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return service.enviar(db, conversa_id, eu, dados)
