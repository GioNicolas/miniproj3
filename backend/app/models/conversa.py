from datetime import datetime, timezone

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base
from app.models.user import User


class Participante(Base):
    """Quem está numa conversa e até qual mensagem já leu."""

    __tablename__ = "participantes"

    conversa_id: Mapped[int] = mapped_column(ForeignKey("conversas.id"), primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), primary_key=True, index=True)
    # id da última mensagem lida: o que vier depois (e for de outra pessoa) é não lida.
    lida_ate_id: Mapped[int] = mapped_column(default=0)


class Conversa(Base):
    """Com 2 pessoas é uma conversa direta; com 3 ou mais é um grupo."""

    __tablename__ = "conversas"

    id: Mapped[int] = mapped_column(primary_key=True)
    nome: Mapped[str | None] = mapped_column(String(60))
    # "id_menor:id_maior" nas diretas, NULL nos grupos. O unique garante uma
    # conversa direta só por dupla, mesmo com dois cliques ao mesmo tempo.
    chave_direta: Mapped[str | None] = mapped_column(String(40), unique=True)
    created_at: Mapped[datetime] = mapped_column(default=lambda: datetime.now(timezone.utc))
    # Hora da última mensagem (ou da criação): ordena a lista de conversas.
    atualizada_em: Mapped[datetime] = mapped_column(
        default=lambda: datetime.now(timezone.utc), index=True
    )

    membros: Mapped[list[User]] = relationship(
        secondary="participantes", lazy="selectin", viewonly=True, order_by=User.username
    )
