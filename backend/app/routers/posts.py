from fastapi import APIRouter, Depends, Response, UploadFile
from sqlalchemy.orm import Session

from app.db import get_db
from app.deps import get_current_user
from app.models.user import User
from app.schemas.post import ImagemOut, PostCreate, PostOut, PostUpdate
from app.services import imagens
from app.services import posts as service

router = APIRouter(prefix="/posts", tags=["posts"])


@router.post("", response_model=PostOut, status_code=201)
def criar_post(
    dados: PostCreate,
    eu: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return service.montar_post(db, service.criar(db, eu, dados), eu)


@router.get("/{post_id}", response_model=PostOut)
def ver_post(
    post_id: int,
    eu: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return service.montar_post(db, service.buscar(db, post_id), eu)


@router.patch("/{post_id}", response_model=PostOut)
def editar_post(
    post_id: int,
    dados: PostUpdate,
    eu: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return service.montar_post(db, service.editar(db, post_id, eu, dados), eu)


@router.delete("/{post_id}", status_code=204)
def apagar_post(
    post_id: int,
    eu: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service.apagar(db, post_id, eu)
    return Response(status_code=204)


@router.post("/{post_id}/imagem", response_model=ImagemOut)
async def subir_imagem(
    post_id: int,
    arquivo: UploadFile,
    eu: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Foto opcional do post (CONTRATO: Posts com imagem). Só o autor; manda de novo para trocar."""
    service.do_autor_ou_403(db, post_id, eu)
    imagem = await imagens.salvar(db, post_id, arquivo)
    return ImagemOut(imagem_url=imagens.url(post_id, imagem.chave))


@router.get("/{post_id}/imagem/{chave}")
def ver_imagem(post_id: int, chave: str, db: Session = Depends(get_db)):
    """Sem login: a tag <img> não manda o token. A chave na URL é o que protege a foto."""
    imagem = imagens.buscar(db, post_id, chave)
    # a URL muda quando a foto muda, então o navegador pode guardar para sempre
    return Response(
        content=imagem.conteudo,
        media_type=imagem.tipo,
        headers={"Cache-Control": "public, max-age=31536000, immutable"},
    )
