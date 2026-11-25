from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db import get_db
from app.deps import get_current_user
from app.models.user import User
from app.schemas.granja import GranjaOut
from app.services import granja as service

router = APIRouter(tags=["granja"])


@router.get("/granja", response_model=GranjaOut)
def granja_da_semana(
    k: int = Query(default=10, ge=1, le=100),
    eu: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return service.ranking(db, eu, k)
