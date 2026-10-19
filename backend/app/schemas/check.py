"""Schemas for the safety-check flow: upload -> extract -> confirm -> evaluate."""
from typing import List, Optional

from pydantic import BaseModel, Field, field_validator

from app.schemas.common import EntityKind, EvidenceGrade, Language, Severity, Verdict


class UploadResponse(BaseModel):
    upload_id: str
    mime: str
    size_bytes: int
    expires_in_seconds: int


class Candidate(BaseModel):
    """One possible match for a token found in the document."""
    kind: EntityKind
    raw_text: str
    canonical_id: int
    canonical_name: str
    display_name: str
    matched_term: str
    score: float = Field(ge=0, le=100)
    status: str  # accepted | needs_confirmation
    via: str  # 'exact' | 'synonym' | 'brand' | 'fuzzy'


class ExtractRequest(BaseModel):
    prescription_upload_id: Optional[str] = None
    product_upload_id: Optional[str] = None

    @field_validator("product_upload_id")
    @classmethod
    def _at_least_one(cls, v, info):
        if v is None and info.data.get("prescription_upload_id") is None:
            raise ValueError("Provide at least one upload id.")
        return v


class DocumentExtraction(BaseModel):
    document: str  # 'prescription' | 'product'
    engine: str
    raw_text: str
    candidates: List[Candidate]
    warnings: List[str] = Field(default_factory=list)


class ExtractResponse(BaseModel):
    documents: List[DocumentExtraction]
    drugs: List[Candidate]
    herbs: List[Candidate]
    unrecognised: List[str]
    needs_confirmation: bool


class ManualEntity(BaseModel):
    kind: EntityKind
    text: str = Field(min_length=1, max_length=128)


class ResolveRequest(BaseModel):
    """Resolve free-text entries (manual entry fallback or edits) to canonical entities."""
    entities: List[ManualEntity] = Field(min_length=1, max_length=40)


class ResolveResponse(BaseModel):
    resolved: List[Candidate]
    unrecognised: List[str]


class EvaluateRequest(BaseModel):
    drug_ids: List[int] = Field(default_factory=list, max_length=30)
    herb_ids: List[int] = Field(default_factory=list, max_length=30)
    unrecognised: List[str] = Field(default_factory=list, max_length=30)
    language: Language = "en"
    state: Optional[str] = Field(default=None, max_length=64)
    source: str = "web"

    @field_validator("herb_ids", "drug_ids")
    @classmethod
    def _unique(cls, v: List[int]) -> List[int]:
        return sorted(set(v))


class SourceOut(BaseModel):
    title: str
    source_type: str
    doi: Optional[str] = None
    pmid: Optional[str] = None
    url: Optional[str] = None
    year: Optional[int] = None
    verification_status: str


class EntityOut(BaseModel):
    id: int
    name: str
    detail: Optional[str] = None  # latin name / drug class


class MatchedInteraction(BaseModel):
    code: str
    herb: EntityOut
    drug: EntityOut  # the user's actual drug; detail = class if matched by class
    matched_by: str  # 'drug' | 'drug_class'
    severity: Severity
    verdict: Verdict  # per-row verdict after rule application
    interaction_type: str
    mechanism: str
    effect: str
    management: str
    timing_gap_hours: Optional[float] = None
    evidence_grade: EvidenceGrade
    population_flags: List[str]
    rule_applied: str  # human-readable rule trace, e.g. "severity=moderate -> AMBER"
    sources: List[SourceOut]
    patient_summary_en: Optional[str] = None
    patient_summary_hi: Optional[str] = None


class PairStatus(BaseModel):
    herb: EntityOut
    drug: EntityOut
    verdict: Verdict
    interaction_codes: List[str]


class Explanation(BaseModel):
    """Grounded explainer output. `origin` tells the UI whether the LLM or the deterministic fallback produced it."""
    summary_en: str
    summary_hi: str
    timing_gap: Optional[str] = None
    doctor_questions: List[str] = Field(min_length=3, max_length=3)
    origin: str  # 'llm' | 'kb_fallback'
    llm_provider: Optional[str] = None
    notice: Optional[str] = None


class EvaluateResponse(BaseModel):
    query_id: int
    verdict: Verdict
    verdict_reason: str
    kb_version: str
    drugs: List[EntityOut]
    herbs: List[EntityOut]
    unrecognised: List[str]
    pairs: List[PairStatus]
    interactions: List[MatchedInteraction]
    explanation: Explanation
    disclaimer: str
