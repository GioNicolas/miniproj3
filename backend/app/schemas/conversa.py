from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field, StringConstraints

from app.schemas.post import AutorOut, DataUTC, Texto

NomeDoGrupo = Annotated[str, StringConstraints(strip_whitespace=True, max_length=60)]


class ConversaCreate(BaseModel):
    # Os OUTROS participantes: você entra sozinho. 1 = direta; 2 a 9 = grupo (até 10 pessoas).
    participantes: list[str] = Field(min_length=1, max_length=9)
    nome: NomeDoGrupo | None = None


class MensagemCreate(BaseModel):
    texto: Texto


class MensagemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    conversa_id: int
    texto: str
    autor: AutorOut
    created_at: DataUTC


class MensagemPage(BaseModel):
    items: list[MensagemOut]
    total: int
    offset: int
    limit: int


class ConversaOut(BaseModel):
    id: int
    nome: str | None
    direta: bool
    # Todo mundo, inclusive você; a tela tira você na hora de mostrar o título.
    participantes: list[AutorOut]
    ultima_mensagem: MensagemOut | None
    nao_lidas: int
    atualizada_em: DataUTC


class ConversaPage(BaseModel):
    items: list[ConversaOut]
    total: int
    offset: int
    limit: int


class NaoLidasOut(BaseModel):
    total: int
