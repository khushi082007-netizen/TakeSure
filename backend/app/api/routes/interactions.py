from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.kb import DrugOut, HerbOut, InteractionDetail, InteractionListResponse, KBStats
from app.services import kb_service

router = APIRouter(tags=["knowledge-base"])


@router.get("/interactions", response_model=InteractionListResponse)
def list_interactions(q: Optional[str] = Query(default=None, max_length=64), severity: Optional[str] = Query(default=None, pattern="^(minor|moderate|major)$"), grade: Optional[str] = Query(default=None, pattern="^[ABC]$"), herb: Optional[str] = Query(default=None, max_length=64), limit: int = Query(default=50, ge=1, le=200), offset: int = Query(default=0, ge=0), db: Session = Depends(get_db)):
    return kb_service.list_interactions(db, q, severity, grade, herb, limit, offset)


@router.get("/interactions/{code}", response_model=InteractionDetail)
def get_interaction(code: str, db: Session = Depends(get_db)):
    return kb_service.get_interaction(db, code)


@router.get("/kb/herbs", response_model=List[HerbOut])
def herbs(db: Session = Depends(get_db)):
    return kb_service.list_herbs(db)


@router.get("/kb/drugs", response_model=List[DrugOut])
def drugs(db: Session = Depends(get_db)):
    return kb_service.list_drugs(db)


@router.get("/kb/stats", response_model=KBStats)
def stats(db: Session = Depends(get_db)):
    return kb_service.stats(db)
