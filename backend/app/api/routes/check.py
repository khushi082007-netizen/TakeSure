"""Safety-check flow: upload -> extract -> resolve/confirm -> evaluate."""
from __future__ import annotations

import logging
from typing import List

from fastapi import APIRouter, BackgroundTasks, Depends, File, Request, UploadFile
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.errors import UploadNotFound, ValidationFailed
from app.core.security import delete_temp_upload, find_temp_upload, purge_expired_uploads, rate_limited, save_temp_upload, validate_upload
from app.db.session import get_db
from app.schemas.check import Candidate, DocumentExtraction, EvaluateRequest, EvaluateResponse, ExtractRequest, ExtractResponse, ResolveRequest, ResolveResponse, UploadResponse
from app.services import llm_service, ocr_service
from app.services.interaction_service import DISCLAIMER, evaluate
from app.services.matching_service import get_dictionary, match_text, resolve_manual
from app.services.normalization_service import drug_out, herb_out, load_entities

log = logging.getLogger("takesure.check")
router = APIRouter(prefix="/check", tags=["check"], dependencies=[Depends(rate_limited)])


@router.post("/upload", response_model=UploadResponse, status_code=201)
async def upload(background: BackgroundTasks, file: UploadFile = File(...)):
    data = await file.read()
    mime = validate_upload(data, file.content_type or "")
    upload_id, _ = save_temp_upload(data, mime)
    background.add_task(purge_expired_uploads)
    return UploadResponse(upload_id=upload_id, mime=mime, size_bytes=len(data), expires_in_seconds=get_settings().upload_ttl_seconds)


def _process(kind: str, upload_id: str, dictionary) -> DocumentExtraction:
    path = find_temp_upload(upload_id)
    if path is None:
        raise UploadNotFound(f"The {kind} upload was not found or has expired. Please upload it again.", {"document": kind})
    try:
        ocr = ocr_service.extract_text(path)
    finally:
        # Privacy: the image is deleted as soon as text has been extracted, success or failure.
        delete_temp_upload(path)
    cands, _ = match_text(ocr.text, dictionary)
    return DocumentExtraction(document=kind, engine=ocr.engine, raw_text=ocr.text[:4000], candidates=cands, warnings=ocr.warnings)


@router.post("/extract", response_model=ExtractResponse)
def extract(payload: ExtractRequest, db: Session = Depends(get_db)):
    dictionary = get_dictionary(db)
    docs: List[DocumentExtraction] = []
    if payload.prescription_upload_id:
        docs.append(_process("prescription", payload.prescription_upload_id, dictionary))
    if payload.product_upload_id:
        docs.append(_process("product", payload.product_upload_id, dictionary))
    all_c: List[Candidate] = [c for d in docs for c in d.candidates]
    best = {}
    for c in all_c:
        k = (c.kind, c.canonical_id)
        if k not in best or c.score > best[k].score:
            best[k] = c
    drugs = sorted([c for c in best.values() if c.kind == "drug"], key=lambda c: -c.score)
    herbs = sorted([c for c in best.values() if c.kind == "herb"], key=lambda c: -c.score)
    unrecognised: List[str] = []
    for d in docs:
        _, unk = match_text(d.raw_text, dictionary)
        unrecognised.extend(u for u in unk if u not in unrecognised)
    return ExtractResponse(documents=docs, drugs=drugs, herbs=herbs, unrecognised=unrecognised[:10], needs_confirmation=any(c.status == "needs_confirmation" for c in best.values()))


@router.post("/resolve", response_model=ResolveResponse)
def resolve(payload: ResolveRequest, db: Session = Depends(get_db)):
    dictionary = get_dictionary(db)
    resolved, unrecognised = resolve_manual([(e.kind, e.text) for e in payload.entities], dictionary)
    return ResolveResponse(resolved=resolved, unrecognised=unrecognised)


@router.post("/evaluate", response_model=EvaluateResponse)
def evaluate_endpoint(payload: EvaluateRequest, db: Session = Depends(get_db)):
    if not payload.drug_ids and not payload.herb_ids and not payload.unrecognised:
        raise ValidationFailed("Nothing to evaluate. Add at least one medicine and one Ayurvedic product.")
    drugs, herbs = load_entities(db, payload.drug_ids, payload.herb_ids)
    result = evaluate(db, drugs, herbs, payload.unrecognised, state=payload.state, source=payload.source if payload.source in ("web", "demo") else "web")
    d_out = [drug_out(d) for d in drugs]
    h_out = [herb_out(h) for h in herbs]
    explanation = llm_service.explain(result.verdict, result.interactions, d_out, h_out, payload.unrecognised, payload.language)
    return EvaluateResponse(
        query_id=result.query_id, verdict=result.verdict, verdict_reason=result.verdict_reason, kb_version=get_settings().kb_version,
        drugs=d_out, herbs=h_out, unrecognised=list(payload.unrecognised), pairs=result.pairs, interactions=result.interactions, explanation=explanation, disclaimer=DISCLAIMER,
    )
