from sqlalchemy import ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column
from app.db import Base


class ProgressaoDominada(Base):
    __tablename__ = "progressoes_dominadas"
    __table_args__ = (UniqueConstraint("user_id", "codigo"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    codigo: Mapped[str] = mapped_column(String(80))
