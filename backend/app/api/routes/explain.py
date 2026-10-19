"""Standalone explainer endpoint. Accepts a previously computed EvaluateResponse body and (re)generates the
explanation in another language. The verdict and matched rows are taken as-is from the KB result - the LLM can't alter them."""
from fastapi import APIRouter, Depends

from app.core.security import rate_limited
from app.schemas.check import EvaluateResponse, Explanation, Language
from app.services import llm_service
from pydantic import BaseModel

router = APIRouter(tags=["explain"], dependencies=[Depends(rate_limited)])


class ExplainRequest(BaseModel):
    result: EvaluateResponse
    language: Language = "en"


@router.post("/explain", response_model=Explanation)
def explain(payload: ExplainRequest):
    r = payload.result
    return llm_service.explain(r.verdict, r.interactions, r.drugs, r.herbs, r.unrecognised, payload.language)
