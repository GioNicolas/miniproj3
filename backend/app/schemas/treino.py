from datetime import date

from pydantic import BaseModel, Field

from app.schemas.post import Texto


class ExercicioIn(BaseModel):
    # Código de progressão da árvore (#10). Enquanto o catálogo não entra,
    # só o formato do código é validado.
    progressao: str = Field(max_length=50, pattern=r"^[a-z0-9_]+$")
    series: int | None = Field(default=None, ge=1, le=100)
    reps: int | None = Field(default=None, ge=1, le=1000)


class TreinoCreate(BaseModel):
    texto: Texto
    # O treino do dia inteiro num registro só. Lista vazia vale: quem ainda não
    # sabe o nome da progressão também conta o dia.
    exercicios: list[ExercicioIn] = Field(default_factory=list, max_length=20)


class DiasTreinadosOut(BaseModel):
    dias: list[date]
