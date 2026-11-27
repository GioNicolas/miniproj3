import secrets
from datetime import datetime, timezone

from sqlalchemy import ForeignKey, LargeBinary, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


class FotoDePerfil(Base):
    """A foto de perfil que a pessoa escolheu dos arquivos dela, guardada no banco.

    Mesmo jeito da foto do post (PostImagem): tabela à parte para listar usuários
    sem carregar os bytes, e no banco porque o disco do Render free zera a cada
    deploy. O User só guarda a URL dela em avatar_url.
    """

    __tablename__ = "fotos_de_perfil"

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), primary_key=True)
    tipo: Mapped[str] = mapped_column(String(20))  # image/jpeg, image/png, image/webp
    conteudo: Mapped[bytes] = mapped_column(LargeBinary)
    # vai na URL: trocar a foto muda a URL, e o navegador não mostra a antiga do cache
    chave: Mapped[str] = mapped_column(String(32), default=lambda: secrets.token_urlsafe(12))
    created_at: Mapped[datetime] = mapped_column(default=lambda: datetime.now(timezone.utc))
