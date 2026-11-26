from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.progressao import Equipamento


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
    # árvore (#10): o que a pessoa tem à mão; manda a lista inteira
    equipamentos: list[Equipamento] | None = Field(default=None, max_length=3)


class FrangoOut(BaseModel):
    """O estado do frango (#11), calculado por app/core/frango.py."""

    nivel: str
    forca: int
    dias_sem_treinar: int | None
    definhando: bool
    proximo_nivel: str | None
    falta_para_proximo: int


class PerfilOut(UserOut):
    """Contrato combinado na issue #3 para GET /usuarios/{username}.

    seguidores, seguindo e eu_sigo vêm do follow (#4); frango, do core/frango.py (#11).
    """

    seguidores: int
    seguindo: int
    eu_sigo: bool
    frango: FrangoOut
