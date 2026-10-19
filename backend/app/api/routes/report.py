from fastapi import APIRouter, Depends, Response

from app.core.security import rate_limited
from app.schemas.check import EvaluateResponse
from app.services import pdf_service

router = APIRouter(tags=["report"], dependencies=[Depends(rate_limited)])


@router.post("/report/pdf")
def report_pdf(result: EvaluateResponse):
    pdf = pdf_service.build_safety_summary(result)
    return Response(content=pdf, media_type="application/pdf", headers={"Content-Disposition": f'attachment; filename="takesure-summary-{result.query_id}.pdf"'})
