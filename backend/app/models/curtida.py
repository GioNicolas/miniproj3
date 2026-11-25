from datetime import datetime, timezone

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


class Curtida(Base):
    """Uma linha = `usuario` deu "tamo junto" no `post`. A chave composta impede duplicata."""

    __tablename__ = "likes"

    usuario_id: Mapped[int] = mapped_column(ForeignKey("users.id"), primary_key=True)
    post_id: Mapped[int] = mapped_column(
        ForeignKey("posts.id"), primary_key=True, index=True
    )
    created_at: Mapped[datetime] = mapped_column(
        default=lambda: datetime.now(timezone.utc)
    )
