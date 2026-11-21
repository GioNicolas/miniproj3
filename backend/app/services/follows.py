from fastapi import HTTPException
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.core.grafo_follows import grafo_follows
from app.models.follow import Follow
from app.models.user import User


def _buscar_usuario(db: Session, username: str) -> User:
    user = db.scalar(select(User).where(User.username == username))
    if not user:
        raise HTTPException(status_code=404, detail="usuário não encontrado")
    return user


def seguir(db: Session, seguidor: User, username: str) -> None:
    seguido = _buscar_usuario(db, username)
    if seguido.id == seguidor.id:
        raise HTTPException(status_code=422, detail="não dá para seguir a si mesmo")
    if grafo_follows.segue(seguidor.id, seguido.id):
        return  # idempotente: seguir de novo não duplica

    db.add(Follow(seguidor_id=seguidor.id, seguido_id=seguido.id))
    db.commit()
    grafo_follows.seguir(seguidor.id, seguido.id)


def deixar_de_seguir(db: Session, seguidor: User, username: str) -> None:
    seguido = _buscar_usuario(db, username)
    db.execute(
        delete(Follow).where(
            Follow.seguidor_id == seguidor.id, Follow.seguido_id == seguido.id
        )
    )
    db.commit()
    grafo_follows.deixar_de_seguir(seguidor.id, seguido.id)


def contadores(user_id: int) -> dict[str, int]:
    """Para o perfil: `{"seguidores": n, "seguindo": n}` em O(1)."""
    return {
        "seguidores": grafo_follows.qtd_seguidores(user_id),
        "seguindo": grafo_follows.qtd_seguindo(user_id),
    }


def _pagina_de_usuarios(
    db: Session, ids: set[int], offset: int, limit: int
) -> tuple[list[User], int]:
    if not ids:
        return [], 0
    users = list(
        db.scalars(
            select(User)
            .where(User.id.in_(ids))
            .order_by(User.username)
            .offset(offset)
            .limit(limit)
        )
    )
    return users, len(ids)


def listar_seguidores(
    db: Session, username: str, offset: int, limit: int
) -> tuple[list[User], int]:
    user = _buscar_usuario(db, username)
    return _pagina_de_usuarios(db, grafo_follows.seguidores(user.id), offset, limit)


def listar_seguindo(
    db: Session, username: str, offset: int, limit: int
) -> tuple[list[User], int]:
    user = _buscar_usuario(db, username)
    return _pagina_de_usuarios(db, grafo_follows.seguindo(user.id), offset, limit)
