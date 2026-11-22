from datetime import date

from sqlalchemy import ForeignKey, Index, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


class Treino(Base):
    """Check-in: os detalhes do treino de um post. O texto fica no post."""

    __tablename__ = "treinos"
    # frango e granja perguntam "em quais dias fulano treinou desde X"
    __table_args__ = (Index("ix_treinos_autor_dia", "autor_id", "dia"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    post_id: Mapped[int] = mapped_column(ForeignKey("posts.id"), unique=True)
    autor_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    dia: Mapped[date]
    progressao: Mapped[str | None] = mapped_column(String(50))
    series: Mapped[int | None]
    reps: Mapped[int | None]
