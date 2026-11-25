from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db import get_db
from app.deps import get_current_user
from app.models.user import User
from app.schemas.post import PostPage
from app.services import posts as service

router = APIRouter(tags=["feed"])


@router.get("/explorar", response_model=PostPage)
def explorar(
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    eu: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    posts, total = service.explorar(db, offset, limit)
    return PostPage(
        items=service.montar_posts(db, posts, eu), total=total, offset=offset, limit=limit
    )


@router.get("/feed", response_model=PostPage)
def feed(
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    eu: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    posts, total = service.feed(db, eu, offset, limit)
    return PostPage(
        items=service.montar_posts(db, posts, eu), total=total, offset=offset, limit=limit
    )
