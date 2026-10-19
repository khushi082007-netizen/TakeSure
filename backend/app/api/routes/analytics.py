from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.analytics import AnalyticsSummary
from app.services import analytics_service

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/summary", response_model=AnalyticsSummary)
def analytics_summary(days: int = Query(default=30, ge=7, le=365), db: Session = Depends(get_db)):
    """Anonymised usage, verdict and pharmacovigilance aggregates for the dashboard."""
    return analytics_service.summary(db, days)
