import secrets
from datetime import datetime, timezone

from sqlalchemy import ForeignKey, LargeBinary, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


class PostImagem(Base):
    """A foto opcional de um post, guardada no próprio banco.

    Fica numa tabela à parte para o feed não carregar os bytes: ele só pergunta
    quais posts têm foto. Fica no banco, e não numa pasta, porque o disco do
    Render free zera a cada deploy; assim a foto dura o mesmo que o post.
    """

    __tablename__ = "post_imagens"

    post_id: Mapped[int] = mapped_column(ForeignKey("posts.id"), primary_key=True)
    tipo: Mapped[str] = mapped_column(String(20))  # image/jpeg, image/png, image/webp
    conteudo: Mapped[bytes] = mapped_column(LargeBinary)
    # vai na URL: ninguém adivinha a foto de um post pelo id, e trocar a foto muda a URL (cache)
    chave: Mapped[str] = mapped_column(String(32), default=lambda: secrets.token_urlsafe(12))
    created_at: Mapped[datetime] = mapped_column(default=lambda: datetime.now(timezone.utc))
