"""Operational tables: anonymised query log, ADR reports, feedback."""
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import JSON, DateTime, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class QueryLog(Base):
    """Stores WHAT was checked (ids + verdict), never WHO or the photos."""
    __tablename__ = "queries_log"
    id: Mapped[int] = mapped_column(primary_key=True)
    ts: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, index=True)
    herb_ids: Mapped[list] = mapped_column(JSON, default=list)
    drug_ids: Mapped[list] = mapped_column(JSON, default=list)
    verdict: Mapped[str] = mapped_column(String(8), index=True)
    matched_interaction_ids: Mapped[list] = mapped_column(JSON, default=list)
    kb_version: Mapped[str] = mapped_column(String(16))
    state: Mapped[Optional[str]] = mapped_column(String(64))  # optional, user-provided Indian state for Ministry analytics
    source: Mapped[str] = mapped_column(String(16), default="web")  # web | demo


class ADRReport(Base):
    __tablename__ = "adr_reports"
    id: Mapped[int] = mapped_column(primary_key=True)
    reference: Mapped[str] = mapped_column(String(32), unique=True, index=True)
    ts: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    product: Mapped[str] = mapped_column(String(256))
    product_manufacturer: Mapped[Optional[str]] = mapped_column(String(128))
    product_batch: Mapped[Optional[str]] = mapped_column(String(64))
    drugs: Mapped[list] = mapped_column(JSON, default=list)
    reaction: Mapped[str] = mapped_column(Text)
    onset_date: Mapped[Optional[str]] = mapped_column(String(32))
    outcome: Mapped[str] = mapped_column(String(64))
    seriousness: Mapped[Optional[str]] = mapped_column(String(64))
    patient_age_group: Mapped[Optional[str]] = mapped_column(String(32))
    patient_sex: Mapped[Optional[str]] = mapped_column(String(16))
    reporter_type: Mapped[str] = mapped_column(String(32))
    state: Mapped[Optional[str]] = mapped_column(String(64))
    exported_pdf: Mapped[bool] = mapped_column(default=False)
    status: Mapped[str] = mapped_column(String(32), default="exported_for_official_submission")


class CurationDraft(Base):
    """Output of a TinyFish curation job, waiting for a human reviewer.

    kind:   verify   -> a citation was fetched and compared with the stored source (evidence = match score)
            discover -> interaction candidates extracted from a monograph page (evidence = structured rows)
            product  -> ingredient list extracted from a product page (evidence = herbs found)
    status: pending | approved | rejected | mismatch
    Nothing in this table can change a verdict until a reviewer approves it and the row is re-seeded.
    """
    __tablename__ = "curation_drafts"
    id: Mapped[int] = mapped_column(primary_key=True)
    ts: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, index=True)
    kind: Mapped[str] = mapped_column(String(16), index=True)
    status: Mapped[str] = mapped_column(String(16), default="pending", index=True)
    subject: Mapped[str] = mapped_column(String(256))             # e.g. "INT-ASHWA-THYROID / source 12", "giloy", "Dabur Giloy Ghanvati"
    source_url: Mapped[Optional[str]] = mapped_column(String(1024))
    source_id: Mapped[Optional[int]] = mapped_column(index=True)  # interaction_sources.id for verify jobs
    extracted: Mapped[dict] = mapped_column(JSON, default=dict)   # what TinyFish returned, as stored evidence
    score: Mapped[Optional[float]] = mapped_column()
    note: Mapped[Optional[str]] = mapped_column(Text)
    tinyfish_run_id: Mapped[Optional[str]] = mapped_column(String(64))
    steps: Mapped[Optional[int]] = mapped_column()
    reviewed_by: Mapped[Optional[str]] = mapped_column(String(128))
    reviewed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))


class Feedback(Base):
    __tablename__ = "feedback"
    id: Mapped[int] = mapped_column(primary_key=True)
    ts: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    issue_type: Mapped[str] = mapped_column(String(32))
    description: Mapped[str] = mapped_column(Text)
    interaction_code: Mapped[Optional[str]] = mapped_column(String(64), index=True)
    page: Mapped[Optional[str]] = mapped_column(String(64))
    status: Mapped[str] = mapped_column(String(16), default="open")
