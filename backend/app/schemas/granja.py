from datetime import date

from pydantic import BaseModel, ConfigDict


class UsuarioNaGranja(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    username: str
    name: str
    avatar_url: str
    nivel: str | None = None  # patente do frango (#11), para o pódio


class ColocadoOut(BaseModel):
    posicao: int
    usuario: UsuarioNaGranja
    dias_treinados: int


class AlvoOut(BaseModel):
    """Quem está logo acima de mim, e quantos dias faltam para passar."""

    usuario: UsuarioNaGranja
    dias_treinados: int
    faltam_dias: int


class GranjaOut(BaseModel):
    semana_inicio: date
    items: list[ColocadoOut]
    # Além do contrato da #12: a minha linha mesmo fora do top-K, para a tela
    # destacar a posição e dizer quanto falta para passar quem está na frente.
    eu: ColocadoOut
    alvo: AlvoOut | None
    # Dias desta semana em que um treino novo ainda muda a minha contagem
    # (de hoje até domingo, sem hoje se eu já treinei hoje).
    dias_que_ainda_contam: int
