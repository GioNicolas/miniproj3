from fastapi import HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.comentario import Comentario
from app.models.user import User
from app.schemas.comentario import ComentarioCreate
from app.services import posts


def comentar(db: Session, post_id: int, eu: User, dados: ComentarioCreate) -> Comentario:
    posts.buscar(db, post_id)
    comentario = Comentario(post_id=post_id, autor_id=eu.id, texto=dados.texto)
    db.add(comentario)
    db.commit()
    db.refresh(comentario)
    return comentario


def listar(db: Session, post_id: int, offset: int, limit: int) -> tuple[list[Comentario], int]:
    """Mais antigo primeiro: a conversa se lê de cima para baixo."""
    posts.buscar(db, post_id)
    total = db.scalar(select(func.count()).where(Comentario.post_id == post_id)) or 0
    comentarios = db.scalars(
        select(Comentario)
        .where(Comentario.post_id == post_id)
        .order_by(Comentario.created_at, Comentario.id)
        .offset(offset)
        .limit(limit)
    )
    return list(comentarios), total


def apagar(db: Session, post_id: int, comentario_id: int, eu: User) -> None:
    """Apaga quem escreveu o comentário ou o dono do post (moderação da própria conversa)."""
    post = posts.buscar(db, post_id)
    comentario = db.get(Comentario, comentario_id)
    if comentario is None or comentario.post_id != post_id:
        raise HTTPException(status_code=404, detail="comentário não encontrado")
    if eu.id not in (comentario.autor_id, post.autor_id):
        raise HTTPException(status_code=403, detail="só o autor ou o dono do post podem apagar")
    db.delete(comentario)
    db.commit()

