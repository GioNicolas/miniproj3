from fastapi import HTTPException
from sqlalchemy import delete, select
from sqlalchemy.orm import Session
from app.core.progressoes import PROGRESSOES, disponiveis, ordem_topologica
from app.models.equipamento_usuario import EquipamentoUsuario
from app.models.progressao_dominada import ProgressaoDominada
from app.models.user import User


def dominadas(db: Session, user_id: int) -> set[str]:
    return set(db.scalars(select(ProgressaoDominada.codigo).where(ProgressaoDominada.user_id == user_id)))


def equipamentos(db: Session, user_id: int) -> list[str]:
    return list(db.scalars(select(EquipamentoUsuario.equipamento).where(EquipamentoUsuario.user_id == user_id).order_by(EquipamentoUsuario.equipamento)))


def arvore(db: Session, user_id: int):
    feitas = dominadas(db, user_id)
    itens = equipamentos(db, user_id)
    livres = set(disponiveis(feitas, itens))
    niveis = {}
    progressoes = []
    for codigo in ordem_topologica():
        dados = PROGRESSOES[codigo]
        niveis[codigo] = 1 + max((niveis[p] for p in dados["prerequisitos"]), default=0)
        estado = "dominada" if codigo in feitas else "disponivel" if codigo in livres else "bloqueada"
        progressoes.append({"codigo": codigo, **dados, "nivel": niveis[codigo], "estado": estado})
    return {"equipamentos": itens, "progressoes": progressoes}


def atualizar_equipamentos(db: Session, user: User, itens: list[str]):
    db.execute(delete(EquipamentoUsuario).where(EquipamentoUsuario.user_id == user.id))
    db.add_all(EquipamentoUsuario(user_id=user.id, equipamento=item) for item in sorted(set(itens)))
    db.commit()
    return {"equipamentos": equipamentos(db, user.id)}


def dominar(db: Session, user: User, codigo: str):
    if codigo not in PROGRESSOES:
        raise HTTPException(404, "Progress?o n?o encontrada")
    feitas = dominadas(db, user.id)
    if codigo in feitas:
        return
    if not set(PROGRESSOES[codigo]["prerequisitos"]) <= feitas:
        raise HTTPException(409, "Domine os pr?-requisitos primeiro")
    if not set(PROGRESSOES[codigo]["equipamento"]) <= set(equipamentos(db, user.id)):
        raise HTTPException(409, "Equipamento necess?rio n?o dispon?vel")
    db.add(ProgressaoDominada(user_id=user.id, codigo=codigo))
    db.commit()


def desfazer(db: Session, user: User, codigo: str):
    if codigo not in PROGRESSOES:
        raise HTTPException(404, "Progress?o n?o encontrada")
    feitas = dominadas(db, user.id)
    if any(codigo in dados["prerequisitos"] and outro in feitas for outro, dados in PROGRESSOES.items()):
        raise HTTPException(409, "Desfa?a primeiro as progress?es que dependem desta")
    db.execute(delete(ProgressaoDominada).where(ProgressaoDominada.user_id == user.id, ProgressaoDominada.codigo == codigo))
    db.commit()
