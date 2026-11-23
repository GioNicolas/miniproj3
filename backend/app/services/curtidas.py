from sqlalchemy import delete, func, select
from sqlalchemy.orm import Session

from app.models.curtida import Curtida
from app.models.user import User
from app.services import posts as posts_service


def curtir(db: Session, post_id: int, eu: User) -> None:
    posts_service.buscar(db, post_id)  # 404 se o post não existe
    if db.get(Curtida, (eu.id, post_id)):
        return  # idempotente: curtir de novo não duplica
    db.add(Curtida(usuario_id=eu.id, post_id=post_id))
    db.commit()


def descurtir(db: Session, post_id: int, eu: User) -> None:
    posts_service.buscar(db, post_id)
    db.execute(
        delete(Curtida).where(Curtida.usuario_id == eu.id, Curtida.post_id == post_id)
    )
    db.commit()


def resumo_em_lote(
    db: Session, post_ids: list[int], eu_id: int
) -> tuple[dict[int, int], set[int]]:
    """Curtidas de uma página inteira de posts em 2 queries, não 2 por post.

    Devolve (post_id -> quantidade, ids dos posts que `eu_id` curtiu).
    """
    if not post_ids:
        return {}, set()
    contagem = dict(
        db.execute(
            select(Curtida.post_id, func.count())
            .where(Curtida.post_id.in_(post_ids))
            .group_by(Curtida.post_id)
        ).all()
    )
    eu_curti = set(
        db.scalars(
            select(Curtida.post_id).where(
                Curtida.post_id.in_(post_ids), Curtida.usuario_id == eu_id
            )
        )
    )
    return contagem, eu_curti


def apagar_do_post(db: Session, post_id: int) -> None:
    """Chamado ao apagar um post. Sem isso, um post novo que herdasse o mesmo
    id (o SQLite reaproveita o maior id apagado) nasceria com curtidas alheias."""
    db.execute(delete(Curtida).where(Curtida.post_id == post_id))
