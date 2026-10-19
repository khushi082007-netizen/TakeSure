from typing import List, Optional

from pydantic import BaseModel

from app.schemas.check import SourceOut


class HerbOut(BaseModel):
    id: int
    slug: str
    english_name: str
    latin_name: str
    hindi_name: Optional[str] = None
    sanskrit_name: Optional[str] = None
    category: Optional[str] = None
    synonyms: List[str]


class DrugOut(BaseModel):
    id: int
    slug: str
    generic: str
    drug_class: str
    brands: List[str]


class InteractionListItem(BaseModel):
    code: str
    herb: str
    herb_latin: str
    drug: Optional[str] = None
    drug_class: Optional[str] = None
    severity: str
    evidence_grade: str
    interaction_type: str
    timing_gap_hours: Optional[float] = None
    reviewed_on: Optional[str] = None
    kb_version: str


class InteractionDetail(InteractionListItem):
    mechanism: str
    effect: str
    management: str
    population_flags: List[str]
    reviewer: Optional[str] = None
    patient_summary_en: Optional[str] = None
    patient_summary_hi: Optional[str] = None
    sources: List[SourceOut]


class InteractionListResponse(BaseModel):
    total: int
    kb_version: str
    items: List[InteractionListItem]


class KBStats(BaseModel):
    kb_version: str
    herbs: int
    drugs: int
    drug_classes: int
    interactions: int
    sources: int
    sources_verified: int
