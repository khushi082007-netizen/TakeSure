"""Schemas for the TinyFish-powered evidence-curation tools (offline from the verdict path)."""
from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, Field


class CurationStatus(BaseModel):
    configured: bool
    provider: str = "tinyfish"
    capabilities: List[str] = Field(default_factory=list)
    sources_total: int
    sources_verified: int
    sources_pending: int
    drafts_pending: int
    drafts_mismatch: int
    drafts_approved: int
    drafts_total: int
    note: str


class DraftOut(BaseModel):
    id: int
    ts: str
    kind: Literal["verify", "discover", "product"]
    status: Literal["pending", "approved", "rejected", "mismatch"]
    subject: str
    source_url: Optional[str] = None
    source_id: Optional[int] = None
    extracted: Dict[str, Any] = Field(default_factory=dict)
    score: Optional[float] = None
    note: Optional[str] = None
    tinyfish_run_id: Optional[str] = None
    steps: Optional[int] = None
    reviewed_by: Optional[str] = None


class DraftList(BaseModel):
    total: int
    items: List[DraftOut]


class VerifyRequest(BaseModel):
    limit: int = Field(default=10, ge=1, le=100)
    only_unverified: bool = True
    source_ids: Optional[List[int]] = None


class VerifyResult(BaseModel):
    checked: int
    verified: int
    mismatched: int
    failed: int
    drafts: List[DraftOut]


class DiscoverRequest(BaseModel):
    herb: str = Field(min_length=2, max_length=64)      # herb slug or name, e.g. "giloy"
    url: Optional[str] = Field(default=None, max_length=1024)  # override the monograph page; default = MSKCC About Herbs


class ProductRequest(BaseModel):
    brand: str = Field(min_length=2, max_length=128)    # e.g. "Dabur Giloy Ghanvati"
    url: Optional[str] = Field(default=None, max_length=1024)  # product page; found with Search API when omitted


class ReviewRequest(BaseModel):
    reviewer: str = Field(default="team", max_length=128)
    note: Optional[str] = Field(default=None, max_length=2000)
