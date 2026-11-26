"""Liga o catálogo da árvore (core/progressoes.py) ao que cada pessoa dominou."""

from fastapi import HTTPException
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.core.progressoes import NIVEIS, ORDEM, PROGRESSOES, dependentes_dominadas, disponiveis
from app.models.equipamento_usuario import EquipamentoUsuario
from app.models.progressao_dominada import ProgressaoDominada
from app.models.user import User
from app.schemas.progressao import ArvoreOut, DominadaOut, ProgressaoOut


def dominadas(db: Session, user_id: int) -> set[str]:
    return set(db.scalars(select(ProgressaoDominada.codigo).where(ProgressaoDominada.user_id == user_id)))


def equipamentos(db: Session, user_id: int) -> list[str]:
    consulta = (
        select(EquipamentoUsuario.equipamento)
        .where(EquipamentoUsuario.user_id == user_id)
        .order_by(EquipamentoUsuario.equipamento)
    )
    return list(db.scalars(consulta))


def arvore(db: Session, user_id: int) -> ArvoreOut:
    feitas = dominadas(db, user_id)
    itens = equipamentos(db, user_id)
    livres = set(disponiveis(feitas, itens))
    progressoes = []
    for codigo in ORDEM:
        estado = "dominada" if codigo in feitas else "disponivel" if codigo in livres else "bloqueada"
        progressoes.append(ProgressaoOut(codigo=codigo, **PROGRESSOES[codigo], nivel=NIVEIS[codigo], estado=estado))
    return ArvoreOut(equipamentos=itens, progressoes=progressoes)


def dominadas_do_perfil(db: Session, user_id: int) -> list[DominadaOut]:
    feitas = dominadas(db, user_id)
    return [
        DominadaOut(codigo=c, nome=PROGRESSOES[c]["nome"], trilha=PROGRESSOES[c]["trilha"])
        for c in ORDEM
        if c in feitas
    ]


def trocar_equipamentos(db: Session, user: User, itens: list[str]) -> None:
    """Chamado pelo PATCH /usuarios/eu (contrato da #10). Não faz commit: quem chama faz."""
    db.execute(delete(EquipamentoUsuario).where(EquipamentoUsuario.user_id == user.id))
    db.add_all(EquipamentoUsuario(user_id=user.id, equipamento=item) for item in sorted(set(itens)))


def _existe(codigo: str) -> None:
    if codigo not in PROGRESSOES:
        raise HTTPException(status_code=404, detail="progressão não encontrada")


def dominar(db: Session, user: User, codigo: str) -> None:
    _existe(codigo)
    feitas = dominadas(db, user.id)
    if codigo in feitas:
        return  # idempotente
    faltam = [p for p in PROGRESSOES[codigo]["prerequisitos"] if p not in feitas]
    if faltam:
        nomes = ", ".join(PROGRESSOES[p]["nome"] for p in faltam)
        raise HTTPException(status_code=409, detail=f"domine antes: {nomes}")
    tenho = set(equipamentos(db, user.id))
    sem = [e for e in PROGRESSOES[codigo]["equipamento"] if e not in tenho]
    if sem:
        raise HTTPException(status_code=409, detail=f"precisa de equipamento: {', '.join(sem)}")
    db.add(ProgressaoDominada(user_id=user.id, codigo=codigo))
    db.commit()


def desfazer(db: Session, user: User, codigo: str) -> None:
    _existe(codigo)
    presas = dependentes_dominadas(codigo, dominadas(db, user.id))
    if presas:
        nomes = ", ".join(PROGRESSOES[p]["nome"] for p in presas)
        raise HTTPException(status_code=409, detail=f"desfaça antes: {nomes}")
    db.execute(
        delete(ProgressaoDominada).where(
            ProgressaoDominada.user_id == user.id, ProgressaoDominada.codigo == codigo
        )
    )
    db.commit()
