from datetime import date, datetime, timedelta, timezone

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.datas import dia_em_recife
from app.core.granja import granja
from app.models.exercicio import Exercicio
from app.models.post import Post
from app.models.treino import Treino
from app.models.user import User
from app.schemas.treino import TreinoCreate


def registrar(db: Session, eu: User, dados: TreinoCreate) -> Post:
    """O check-in vira um post no feed e um Treino, no mesmo commit."""
    agora = datetime.now(timezone.utc)
    post = Post(autor_id=eu.id, texto=dados.texto, created_at=agora)
    post.treino = Treino(
        autor_id=eu.id,
        dia=dia_em_recife(agora),
        exercicios=[Exercicio(**exercicio.model_dump()) for exercicio in dados.exercicios],
    )
    db.add(post)
    db.commit()
    # Granja da Semana (#12): o check-in conta na hora, sem esperar o restart. O(1).
    granja.registrar_treino(eu.id, post.treino.dia)
    db.refresh(post)
    return post


def dias_treinados(db: Session, autor_id: int, desde: date) -> list[date]:
    """Dias distintos com treino a partir de `desde`, do mais antigo ao mais novo.

    Dois check-ins no mesmo dia contam um dia só: é isto que frango e granja usam.
    """
    consulta = (
        select(Treino.dia)
        .where(Treino.autor_id == autor_id, Treino.dia >= desde)
        .distinct()
        .order_by(Treino.dia)
    )
    return list(db.scalars(consulta))


def dias_do_usuario(db: Session, username: str, dias: int) -> list[date]:
    user = db.scalar(select(User).where(User.username == username))
    if user is None:
        raise HTTPException(status_code=404, detail="usuário não encontrado")
    hoje = dia_em_recife(datetime.now(timezone.utc))
    return dias_treinados(db, user.id, desde=hoje - timedelta(days=dias - 1))
