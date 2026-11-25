from datetime import date

from pydantic import BaseModel, Field, field_validator

from app.core.progressoes import PROGRESSOES
from app.schemas.post import Texto


class ExercicioIn(BaseModel):
    # Código de progressão do catálogo da árvore (#10): core/progressoes.py.
    progressao: str = Field(max_length=50, pattern=r"^[a-z0-9_]+$")
    series: int | None = Field(default=None, ge=1, le=100)
    reps: int | None = Field(default=None, ge=1, le=1000)

    @field_validator("progressao")
    @classmethod
    def do_catalogo(cls, codigo: str) -> str:
        if codigo not in PROGRESSOES:
            raise ValueError("progressão fora do catálogo da árvore")
        return codigo


class TreinoCreate(BaseModel):
    texto: Texto
    # O treino do dia inteiro num registro só. Lista vazia vale: quem ainda não
    # sabe o nome da progressão também conta o dia.
    exercicios: list[ExercicioIn] = Field(default_factory=list, max_length=20)


class DiasTreinadosOut(BaseModel):
    dias: list[date]
