from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


class Exercicio(Base):
    """Um exercício do treino do dia: a progressão da árvore (#10), séries e reps."""

    __tablename__ = "exercicios"

    id: Mapped[int] = mapped_column(primary_key=True)
    treino_id: Mapped[int] = mapped_column(ForeignKey("treinos.id"), index=True)
    progressao: Mapped[str] = mapped_column(String(50))
    series: Mapped[int | None]
    reps: Mapped[int | None]
