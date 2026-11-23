from datetime import date

from sqlalchemy import ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base
from app.models.exercicio import Exercicio


class Treino(Base):
    """Check-in: o treino do dia de um post. O texto fica no post."""

    __tablename__ = "treinos"
    # frango e granja perguntam "em quais dias fulano treinou desde X"
    __table_args__ = (Index("ix_treinos_autor_dia", "autor_id", "dia"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    post_id: Mapped[int] = mapped_column(ForeignKey("posts.id"), unique=True)
    autor_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    dia: Mapped[date]

    # selectin: os exercícios de uma página inteira de posts vêm numa query só.
    exercicios: Mapped[list[Exercicio]] = relationship(
        lazy="selectin", order_by=Exercicio.id, cascade="all, delete-orphan"
    )
