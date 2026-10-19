"""Anonymised analytics for the pharmacist / Ministry dashboard. Nothing here identifies a person."""
from typing import Dict, List, Optional

from pydantic import BaseModel


class VerdictCounts(BaseModel):
    GREEN: int = 0
    AMBER: int = 0
    RED: int = 0
    GREY: int = 0


class DailyPoint(BaseModel):
    date: str
    total: int
    GREEN: int = 0
    AMBER: int = 0
    RED: int = 0
    GREY: int = 0


class PairCount(BaseModel):
    herb: str
    drug: str
    count: int
    worst_verdict: str


class NameCount(BaseModel):
    name: str
    detail: Optional[str] = None
    count: int


class InteractionCount(BaseModel):
    code: str
    herb: str
    target: str
    severity: str
    evidence_grade: str
    count: int


class StateCount(BaseModel):
    state: str
    count: int


class ADRSummaryItem(BaseModel):
    reference: str
    ts: str
    product: str
    outcome: str
    seriousness: Optional[str] = None
    reporter_type: str
    state: Optional[str] = None
    drugs: List[str]


class FeedbackCount(BaseModel):
    issue_type: str
    count: int


class Totals(BaseModel):
    queries: int
    queries_web: int
    queries_demo: int
    queries_period: int
    adr_reports: int
    adr_serious: int
    feedback_total: int
    feedback_open: int
    kb_interactions: int
    kb_sources: int
    kb_sources_verified: int
    curation_drafts_pending: int = 0
    curation_drafts_mismatch: int = 0


class AnalyticsSummary(BaseModel):
    generated_at: str
    kb_version: str
    period_days: int
    totals: Totals
    verdicts: VerdictCounts
    daily: List[DailyPoint]
    top_pairs: List[PairCount]
    top_herbs: List[NameCount]
    top_drugs: List[NameCount]
    top_interactions: List[InteractionCount]
    by_state: List[StateCount]
    adr_outcomes: Dict[str, int]
    recent_adr: List[ADRSummaryItem]
    feedback_by_type: List[FeedbackCount]
