from datetime import date

from pydantic import BaseModel, Field

from app.schemas.post import Texto


class TreinoCreate(BaseModel):
    texto: Texto
    # Código de progressão da árvore (#10). Enquanto o catálogo não entra,
    # só o formato do código é validado.
    progressao: str | None = Field(default=None, max_length=50, pattern=r"^[a-z0-9_]+$")
    series: int | None = Field(default=None, ge=1, le=100)
    reps: int | None = Field(default=None, ge=1, le=1000)


class DiasTreinadosOut(BaseModel):
    dias: list[date]
