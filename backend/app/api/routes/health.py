from fastapi import APIRouter
from sqlalchemy import func, select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db.session import get_sessionmaker
from app.models.kb import Interaction
from app.schemas.common import HealthResponse
from app.services import ocr_service, tinyfish_service

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
def health():
    s = get_settings()
    db_status = "ok"
    count = None
    try:
        db: Session = get_sessionmaker()()
        try:
            count = db.scalar(select(func.count(Interaction.id)).where(Interaction.is_active.is_(True)))
        finally:
            db.close()
    except SQLAlchemyError:
        db_status = "unavailable"
    ocr = ocr_service.describe()
    return HealthResponse(
        status="ok" if db_status == "ok" else "degraded",
        app_env=s.app_env,
        kb_version=s.kb_version,
        database=db_status,
        ocr_engine="none" if not ocr["available"] else "+".join(ocr["chain"]),
        ocr_available=ocr["available"],
        ocr_detail=ocr,
        llm_provider=s.effective_llm_provider if s.effective_llm_key else "none",
        llm_model=(s.llm_model or ("openai/gpt-oss-120b" if s.effective_llm_provider == "openai_compatible" else "")) if s.effective_llm_key else None,
        interactions_active=count,
        tinyfish_configured=tinyfish_service.configured(),
        db_dialect=s.database_url.split(":", 1)[0].split("+")[0],
    )
