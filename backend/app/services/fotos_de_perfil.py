"""Foto de perfil escolhida dos arquivos: valida, guarda, serve e remove.

A validação (2 MB, JPG/PNG/WEBP pelos primeiros bytes) é a mesma da foto do
post. O front reduz a foto antes de mandar.
"""

from fastapi import HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.models.foto_de_perfil import FotoDePerfil
from app.models.user import User
from app.services.imagens import ler_foto


def url(username: str, chave: str) -> str:
    return f"/usuarios/{username}/foto/{chave}"


def _apagar(db: Session, user_id: int) -> None:
    antiga = db.get(FotoDePerfil, user_id)
    if antiga is not None:
        db.delete(antiga)
        db.flush()


async def trocar(db: Session, eu: User, arquivo: UploadFile) -> User:
    dados, tipo = await ler_foto(arquivo)
    _apagar(db, eu.id)  # trocar a foto: a nova ganha outra chave
    foto = FotoDePerfil(user_id=eu.id, tipo=tipo, conteudo=dados)
    db.add(foto)
    db.flush()
    eu.avatar_url = url(eu.username, foto.chave)
    db.commit()
    db.refresh(eu)
    return eu


def remover(db: Session, eu: User) -> User:
    """Volta para as iniciais do nome."""
    _apagar(db, eu.id)
    eu.avatar_url = ""
    db.commit()
    db.refresh(eu)
    return eu


def esquecer_se_trocou_por_link(db: Session, eu: User, avatar_url: str) -> None:
    """Quem troca a foto por um link (PATCH avatar_url) não deixa a foto antiga no banco."""
    foto = db.get(FotoDePerfil, eu.id)
    if foto is not None and avatar_url != url(eu.username, foto.chave):
        db.delete(foto)


def buscar(db: Session, user: User, chave: str) -> FotoDePerfil:
    foto = db.get(FotoDePerfil, user.id)
    if foto is None or foto.chave != chave:
        raise HTTPException(status_code=404, detail="foto não encontrada")
    return foto
