from datetime import datetime, timezone

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base
from app.models.treino import Treino
from app.models.user import User


class Post(Base):
    __tablename__ = "posts"

    id: Mapped[int] = mapped_column(primary_key=True)
    autor_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    texto: Mapped[str] = mapped_column(String(500))
    created_at: Mapped[datetime] = mapped_column(
        default=lambda: datetime.now(timezone.utc), index=True
    )

    # joined: todo PostOut mostra o autor, então ele vem na mesma query.
    autor: Mapped[User] = relationship(lazy="joined")
    # Só posts de check-in (#9) têm treino; apagar o post apaga o treino junto.
    treino: Mapped[Treino | None] = relationship(lazy="joined", cascade="all, delete-orphan")
