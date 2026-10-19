from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from app.core.security import rate_limited
from app.db.session import get_db
from app.schemas.adr import ADRCreate, ADRResponse, FeedbackCreate, FeedbackResponse
from app.models.ops import Feedback
from app.services import adr_service, pdf_service

router = APIRouter(tags=["adr"], dependencies=[Depends(rate_limited)])


@router.post("/adr", response_model=ADRResponse, status_code=201)
def create_adr(payload: ADRCreate, db: Session = Depends(get_db)):
    r = adr_service.create_report(db, payload)
    return ADRResponse(id=r.id, reference=r.reference, status=r.status, official_portal_url=adr_service.official_portal_url(), note=adr_service.NOTE)


@router.post("/adr/pdf")
def adr_pdf(payload: ADRCreate, db: Session = Depends(get_db)):
    """Creates (and stores, if consented) the report and streams the PDF in one call."""
    r = adr_service.create_report(db, payload)
    r.exported_pdf = True
    pdf = pdf_service.build_adr_report(adr_service.report_to_dict(r))
    return Response(content=pdf, media_type="application/pdf", headers={"Content-Disposition": f'attachment; filename="{r.reference}.pdf"', "X-ADR-Reference": r.reference})


@router.post("/feedback", response_model=FeedbackResponse, status_code=201)
def feedback(payload: FeedbackCreate, db: Session = Depends(get_db)):
    fb = Feedback(issue_type=payload.issue_type, description=payload.description, interaction_code=payload.interaction_code, page=payload.page)
    db.add(fb)
    db.flush()
    return FeedbackResponse(id=fb.id, status=fb.status)
