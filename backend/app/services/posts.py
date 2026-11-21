from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.post import Post
from app.models.user import User
from app.schemas.post import PostCreate, PostOut, PostUpdate


def buscar(db: Session, post_id: int) -> Post:
    post = db.get(Post, post_id)
    if post is None:
        raise HTTPException(status_code=404, detail="post não encontrado")
    return post


def _do_autor(db: Session, post_id: int, eu: User) -> Post:
    post = buscar(db, post_id)
    if post.autor_id != eu.id:
        raise HTTPException(status_code=403, detail="só o autor pode mexer no post")
    return post


def criar(db: Session, eu: User, dados: PostCreate) -> Post:
    post = Post(autor_id=eu.id, texto=dados.texto)
    db.add(post)
    db.commit()
    db.refresh(post)
    return post


def editar(db: Session, post_id: int, eu: User, dados: PostUpdate) -> Post:
    post = _do_autor(db, post_id, eu)
    post.texto = dados.texto
    db.commit()
    db.refresh(post)
    return post


def apagar(db: Session, post_id: int, eu: User) -> None:
    post = _do_autor(db, post_id, eu)
    db.delete(post)
    db.commit()


def montar_posts(db: Session, posts: list[Post], eu: User) -> list[PostOut]:
    """Único ponto que transforma Post em PostOut, para uma página inteira.

    Recebe a lista toda para que curtidas (#6) e comentários (#7) sejam contados
    com uma query agrupada por página, e não uma por post.
    """
    return [PostOut.model_validate(post) for post in posts]


def montar_post(db: Session, post: Post, eu: User) -> PostOut:
    return montar_posts(db, [post], eu)[0]
