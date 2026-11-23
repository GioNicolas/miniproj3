from datetime import datetime, timezone
from typing import Annotated

from pydantic import BaseModel, ConfigDict, StringConstraints, field_validator

# Espaços nas pontas saem antes de validar: post só com espaço vira 422.
Texto = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=500)]


class PostCreate(BaseModel):
    texto: Texto


class PostUpdate(BaseModel):
    texto: Texto


class AutorOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    username: str
    name: str
    avatar_url: str


class ExercicioOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    progressao: str
    series: int | None
    reps: int | None


class TreinoOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    exercicios: list[ExercicioOut]


class PostOut(BaseModel):
    """Contrato único de post (issue #2): feed, perfil e explorar devolvem isto.

    Quem cria um campo novo (curtidas #6, comentários #7, treino #9) acrescenta
    aqui e preenche em services/posts.py::montar_posts, sem schema paralelo.
    """

    model_config = ConfigDict(from_attributes=True)

    id: int
    texto: str
    autor: AutorOut
    created_at: datetime
    curtidas: int = 0
    comentarios: int = 0
    eu_curti: bool = False
    treino: TreinoOut | None = None

    @field_validator("created_at")
    @classmethod
    def em_utc(cls, valor: datetime) -> datetime:
        # SQLite devolve datetime sem fuso; o valor gravado já é UTC.
        return valor if valor.tzinfo else valor.replace(tzinfo=timezone.utc)
