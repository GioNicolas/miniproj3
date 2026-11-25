from typing import Literal

from pydantic import BaseModel

# Os mesmos de app/core/progressoes.py::EQUIPAMENTOS
Equipamento = Literal["barra_fixa", "paralelas", "elastico"]
Estado = Literal["dominada", "disponivel", "bloqueada"]


class ProgressaoOut(BaseModel):
    codigo: str
    nome: str
    trilha: str
    prerequisitos: list[str]
    equipamento: list[str]
    nivel: int  # 1 = raiz; para desenhar a árvore em níveis
    estado: Estado


class ArvoreOut(BaseModel):
    equipamentos: list[Equipamento]
    progressoes: list[ProgressaoOut]  # em ordem topológica


class DominadaOut(BaseModel):
    codigo: str
    nome: str
    trilha: str
