from pydantic import BaseModel, ConfigDict

from app.schemas.post import AutorOut, DataUTC, Texto


class ComentarioCreate(BaseModel):
    texto: Texto


class ComentarioOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    post_id: int
    texto: str
    autor: AutorOut
    created_at: DataUTC


class ComentarioPage(BaseModel):
    items: list[ComentarioOut]
    total: int
    offset: int
    limit: int
