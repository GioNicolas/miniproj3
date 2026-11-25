from sqlalchemy import ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column
from app.db import Base


class EquipamentoUsuario(Base):
    __tablename__ = "equipamentos_usuarios"
    __table_args__ = (UniqueConstraint("user_id", "equipamento"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    equipamento: Mapped[str] = mapped_column(String(30))
