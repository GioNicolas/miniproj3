"""Foto opcional do post: valida, guarda e devolve.

O front já reduz a foto no celular antes de mandar (cerca de 1080 px em JPEG),
então o limite de 2 MB só pega quem manda o arquivo original direto na API.
"""

from fastapi import HTTPException, UploadFile
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.post_imagem import PostImagem

MAX_BYTES = 2 * 1024 * 1024  # 2 MB, como no CONTRATO


def _tipo_pelo_conteudo(dados: bytes) -> str | None:
    """O tipo vem dos primeiros bytes, não do nome nem do Content-Type, que o cliente escolhe."""
    if dados.startswith(b"\xff\xd8\xff"):
        return "image/jpeg"
    if dados.startswith(b"\x89PNG\r\n\x1a\n"):
        return "image/png"
    if dados[:4] == b"RIFF" and dados[8:12] == b"WEBP":
        return "image/webp"
    return None


def url(post_id: int, chave: str) -> str:
    return f"/posts/{post_id}/imagem/{chave}"


async def salvar(db: Session, post_id: int, arquivo: UploadFile) -> PostImagem:
    dados = await arquivo.read(MAX_BYTES + 1)
    if len(dados) > MAX_BYTES:
        raise HTTPException(status_code=413, detail="a foto passa de 2 MB")
    tipo = _tipo_pelo_conteudo(dados)
    if tipo is None:
        raise HTTPException(status_code=422, detail="a foto precisa ser JPG, PNG ou WEBP")
    antiga = db.get(PostImagem, post_id)
    if antiga is not None:  # trocar a foto: a nova ganha outra chave
        db.delete(antiga)
        db.flush()
    imagem = PostImagem(post_id=post_id, tipo=tipo, conteudo=dados)
    db.add(imagem)
    db.commit()
    db.refresh(imagem)
    return imagem


def buscar(db: Session, post_id: int, chave: str) -> PostImagem:
    imagem = db.get(PostImagem, post_id)
    if imagem is None or imagem.chave != chave:
        raise HTTPException(status_code=404, detail="foto não encontrada")
    return imagem


def urls_em_lote(db: Session, post_ids: list[int]) -> dict[int, str]:
    """Quais posts da página têm foto, numa query só e sem ler os bytes."""
    linhas = db.execute(
        select(PostImagem.post_id, PostImagem.chave).where(PostImagem.post_id.in_(post_ids))
    ).tuples()
    return {post_id: url(post_id, chave) for post_id, chave in linhas}


def apagar(db: Session, post_id: int) -> None:
    imagem = db.get(PostImagem, post_id)
    if imagem is not None:
        db.delete(imagem)
