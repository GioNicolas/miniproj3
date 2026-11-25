from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=30, pattern=r"^[a-z0-9_]+$")
    name: str = Field(min_length=1, max_length=80)
    bio: str = Field(default="", max_length=280)
    avatar_url: str = Field(default="", max_length=300)


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    name: str
    bio: str
    avatar_url: str
    created_at: datetime


class UserPage(BaseModel):
    """Padrão de paginação do projeto: todo endpoint de listagem devolve isto."""

    items: list[UserOut]
    total: int
    offset: int
    limit: int


class UserUpdate(BaseModel):
    """Só o que veio no corpo muda (PATCH): mandar só a bio não apaga o nome."""

    name: str | None = Field(default=None, min_length=1, max_length=80)
    bio: str | None = Field(default=None, max_length=280)
    avatar_url: str | None = Field(default=None, max_length=300)


class PerfilOut(UserOut):
    """Contrato combinado na issue #3 para GET /usuarios/{username}.

    seguidores, seguindo e eu_sigo vêm do follow (#4). frango (#11) fica null
    até a Sofia ligar o core/frango.py aqui.
    """

    seguidores: int
    seguindo: int
    eu_sigo: bool
    frango: dict | None = None
