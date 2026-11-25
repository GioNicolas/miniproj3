from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.db import get_db
from app.deps import get_current_user
from app.models.user import User
from app.schemas.progressao import ArvoreOut, EquipamentosIn, ProgressaoOut
from app.services import progressoes as service

router = APIRouter(tags=["progressoes"])


@router.get("/progressoes", response_model=ArvoreOut)
def listar(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return service.arvore(db, user.id)


@router.post("/progressoes/{codigo}/dominar", status_code=204)
def dominar(codigo: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    service.dominar(db, user, codigo)
    return Response(status_code=204)


@router.delete("/progressoes/{codigo}/dominar", status_code=204)
def desfazer(codigo: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    service.desfazer(db, user, codigo)
    return Response(status_code=204)


@router.patch("/usuarios/eu", response_model=EquipamentosIn)
def atualizar(dados: EquipamentosIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return service.atualizar_equipamentos(db, user, dados.equipamentos)


@router.get("/usuarios/{username}/progressoes", response_model=list[ProgressaoOut])
def perfil(username: str, _: User = Depends(get_current_user), db: Session = Depends(get_db)):
    dono = db.scalar(select(User).where(User.username == username))
    if dono is None:
        raise HTTPException(404, "Usu?rio n?o encontrado")
    return [p for p in service.arvore(db, dono.id)["progressoes"] if p["estado"] == "dominada"]
