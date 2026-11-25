from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from app.db import get_db
from app.deps import get_current_user
from app.models.user import User
from app.schemas.progressao import ArvoreOut, DominadaOut
from app.services import progressoes as service
from app.services.users import buscar_por_username

# Os equipamentos mudam pelo PATCH /usuarios/eu (routers/users.py), como diz o contrato da #10.
router = APIRouter(tags=["progressoes"])


@router.get("/progressoes", response_model=ArvoreOut)
def minha_arvore(eu: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return service.arvore(db, eu.id)


@router.post("/progressoes/{codigo}/dominar", status_code=204)
def dominar(codigo: str, eu: User = Depends(get_current_user), db: Session = Depends(get_db)):
    service.dominar(db, eu, codigo)
    return Response(status_code=204)


@router.delete("/progressoes/{codigo}/dominar", status_code=204)
def desfazer(codigo: str, eu: User = Depends(get_current_user), db: Session = Depends(get_db)):
    service.desfazer(db, eu, codigo)
    return Response(status_code=204)


@router.get("/usuarios/{username}/progressoes", response_model=list[DominadaOut])
def dominadas_de(username: str, _: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """As skills dominadas de alguém, para o perfil (#3)."""
    return service.dominadas_do_perfil(db, buscar_por_username(db, username).id)
