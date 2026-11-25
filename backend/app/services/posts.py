from fastapi import HTTPException
from sqlalchemy import delete, func, select
from sqlalchemy.orm import Session

from app.core.grafo_follows import grafo_follows
from app.models.comentario import Comentario
from app.models.post import Post
from app.models.user import User
from app.schemas.post import PostCreate, PostOut, PostUpdate
from app.services import frango


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
    # sem isso o SQLite deixa comentários órfãos apontando para um post que não existe
    db.execute(delete(Comentario).where(Comentario.post_id == post.id))
    db.delete(post)
    db.commit()


def explorar(db: Session, offset: int, limit: int) -> tuple[list[Post], int]:
    """Posts de toda a rede, mais novo primeiro.

    Quando as curtidas (#6) entrarem, os mais curtidos dos últimos 7 dias sobem.
    """
    total = db.scalar(select(func.count()).select_from(Post)) or 0
    pagina = db.scalars(
        select(Post).order_by(Post.created_at.desc(), Post.id.desc()).offset(offset).limit(limit)
    )
    return list(pagina), total


def feed(db: Session, eu: User, offset: int, limit: int) -> tuple[list[Post], int]:
    """Posts de quem eu sigo e os meus, mais novo primeiro (cronológico, sem ranking).

    "Quem eu sigo" sai do grafo em memória (core/grafo_follows.py) em O(1), sem
    join com a tabela de follows. Os meus posts entram para quem acabou de postar
    se ver no topo, como em qualquer rede.
    """
    autores = grafo_follows.seguindo(eu.id) | {eu.id}
    filtro = Post.autor_id.in_(autores)
    total = db.scalar(select(func.count()).select_from(Post).where(filtro)) or 0
    pagina = db.scalars(
        select(Post)
        .where(filtro)
        .order_by(Post.created_at.desc(), Post.id.desc())
        .offset(offset)
        .limit(limit)
    )
    return list(pagina), total


def do_autor(db: Session, autor_id: int, offset: int, limit: int) -> tuple[list[Post], int]:
    """Posts de uma pessoa, mais novo primeiro: a lista do perfil (#3)."""
    filtro = Post.autor_id == autor_id
    total = db.scalar(select(func.count()).select_from(Post).where(filtro)) or 0
    pagina = db.scalars(
        select(Post)
        .where(filtro)
        .order_by(Post.created_at.desc(), Post.id.desc())
        .offset(offset)
        .limit(limit)
    )
    return list(pagina), total


def montar_posts(db: Session, posts: list[Post], eu: User) -> list[PostOut]:
    """Único ponto que transforma Post em PostOut, para uma página inteira.

    Recebe a lista toda para que curtidas (#6) e comentários (#7) sejam contados
    com uma query agrupada por página, e não uma por post.
    """
    ids = [post.id for post in posts]
    comentarios = dict(
        db.execute(
            select(Comentario.post_id, func.count())
            .where(Comentario.post_id.in_(ids))
            .group_by(Comentario.post_id)
        ).tuples().all()
    )
    niveis = frango.niveis(db, {post.autor_id for post in posts})
    saida = []
    for post in posts:
        out = PostOut.model_validate(post)
        out.comentarios = comentarios.get(post.id, 0)
        out.autor.nivel = niveis.get(post.autor_id)
        saida.append(out)
    return saida


def montar_post(db: Session, post: Post, eu: User) -> PostOut:
    return montar_posts(db, [post], eu)[0]
