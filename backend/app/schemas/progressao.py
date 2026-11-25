from typing import Literal
from pydantic import BaseModel

Equipamento = Literal["barra_fixa", "paralelas", "elastico"]


class EquipamentosIn(BaseModel):
    equipamentos: list[Equipamento]


class ProgressaoOut(BaseModel):
    codigo: str
    nome: str
    trilha: str
    prerequisitos: list[str]
    equipamento: list[str]
    nivel: int
    estado: Literal["dominada", "disponivel", "bloqueada"]


class ArvoreOut(BaseModel):
    equipamentos: list[Equipamento]
    progressoes: list[ProgressaoOut]
