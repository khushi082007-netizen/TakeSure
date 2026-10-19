"""Evidence-curation endpoints backed by TinyFish. Offline from the verdict path by design."""
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.curation import CurationStatus, DiscoverRequest, DraftList, DraftOut, ProductRequest, ReviewRequest, VerifyRequest, VerifyResult
from app.services import tinyfish_service as tf

router = APIRouter(prefix="/curation", tags=["curation"])


@router.get("/status", response_model=CurationStatus)
def curation_status(db: Session = Depends(get_db)):
    """Is TinyFish configured, and how much of the knowledge base is verified?"""
    return tf.status(db)


@router.post("/verify-sources", response_model=VerifyResult)
def verify_sources(req: VerifyRequest, db: Session = Depends(get_db)):
    """Fetch every citation (DOI / PubMed / URL) with the TinyFish Fetch API and mark matching sources verified."""
    out = tf.verify_sources(db, limit=req.limit, only_unverified=req.only_unverified, source_ids=req.source_ids)
    out["drafts"] = [tf.draft_out(d) for d in out["drafts"]]
    return out


@router.post("/discover", response_model=DraftOut)
def discover(req: DiscoverRequest, db: Session = Depends(get_db)):
    """Use the TinyFish Web Agent to read a monograph and draft candidate interaction rows for a herb."""
    return tf.draft_out(tf.discover(db, req.herb, req.url))


@router.post("/map-product", response_model=DraftOut)
def map_product(req: ProductRequest, db: Session = Depends(get_db)):
    """Find an Indian product page (Search API) and extract its ingredient list (Web Agent) as a draft."""
    return tf.draft_out(tf.map_product(db, req.brand, req.url))


@router.get("/drafts", response_model=DraftList)
def drafts(status: Optional[str] = Query(default=None, pattern="^(pending|approved|rejected|mismatch)$"), kind: Optional[str] = Query(default=None, pattern="^(verify|discover|product)$"), limit: int = Query(default=50, ge=1, le=200), db: Session = Depends(get_db)):
    out = tf.list_drafts(db, status, kind, limit)
    return {"total": out["total"], "items": [tf.draft_out(d) for d in out["items"]]}


@router.post("/drafts/{draft_id}/approve", response_model=DraftOut)
def approve(draft_id: int, req: ReviewRequest, db: Session = Depends(get_db)):
    return tf.draft_out(tf.review(db, draft_id, True, req.reviewer, req.note))


@router.post("/drafts/{draft_id}/reject", response_model=DraftOut)
def reject(draft_id: int, req: ReviewRequest, db: Session = Depends(get_db)):
    return tf.draft_out(tf.review(db, draft_id, False, req.reviewer, req.note))
