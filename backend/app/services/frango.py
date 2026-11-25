"""Liga o core/frango.py aos treinos do banco (#9)."""

from collections import defaultdict
from datetime import date, datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.datas import dia_em_recife
from app.core.frango import calcular_frango
from app.models.treino import Treino
from app.schemas.user import FrangoOut


def _hoje() -> date:
    return dia_em_recife(datetime.now(timezone.utc))


def do_usuario(db: Session, user_id: int) -> FrangoOut:
    dias = db.scalars(select(Treino.dia).where(Treino.autor_id == user_id).distinct())
    estado = calcular_frango(dias, _hoje())
    return FrangoOut(**estado.__dict__)


def niveis(db: Session, autor_ids: set[int]) -> dict[int, str]:
    """Nível do frango de cada autor de uma página de posts, com uma query só."""
    if not autor_ids:
        return {}
    dias_por_autor: dict[int, set[date]] = defaultdict(set)
    consulta = select(Treino.autor_id, Treino.dia).where(Treino.autor_id.in_(autor_ids)).distinct()
    for autor_id, dia in db.execute(consulta).all():
        dias_por_autor[autor_id].add(dia)
    hoje = _hoje()
    return {autor_id: calcular_frango(dias_por_autor[autor_id], hoje).nivel for autor_id in autor_ids}
