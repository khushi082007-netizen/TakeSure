"""Read-only knowledge-base browsing for the KB explorer page and 'Why this verdict?' panel."""
from __future__ import annotations

from typing import List, Optional

from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.core.config import get_settings
from app.core.errors import NotFound
from app.models.kb import Drug, DrugBrand, Herb, HerbSynonym, Interaction, InteractionSource
from app.schemas.check import SourceOut
from app.schemas.kb import DrugOut, HerbOut, InteractionDetail, InteractionListItem, InteractionListResponse, KBStats


def _item(r: Interaction) -> InteractionListItem:
    return InteractionListItem(
        code=r.code, herb=r.herb.english_name, herb_latin=r.herb.latin_name, drug=r.drug.generic if r.drug else None, drug_class=r.drug_class,
        severity=r.severity, evidence_grade=r.evidence_grade, interaction_type=r.interaction_type, timing_gap_hours=r.timing_gap_hours,
        reviewed_on=r.reviewed_on.isoformat() if r.reviewed_on else None, kb_version=r.kb_version,
    )


def list_interactions(db: Session, q: Optional[str], severity: Optional[str], grade: Optional[str], herb: Optional[str], limit: int, offset: int) -> InteractionListResponse:
    stmt = select(Interaction).join(Interaction.herb).options(selectinload(Interaction.herb), selectinload(Interaction.drug)).where(Interaction.is_active.is_(True))
    if severity:
        stmt = stmt.where(Interaction.severity == severity)
    if grade:
        stmt = stmt.where(Interaction.evidence_grade == grade)
    if herb:
        stmt = stmt.where(Herb.slug == herb)
    if q:
        like = f"%{q.lower()}%"
        # A query like "warfarin" or "Thyronorm" should also surface class-level rows (anticoagulant, thyroid_hormone).
        classes = set(db.scalars(select(Drug.drug_class).outerjoin(Drug.brands).where(func.lower(Drug.generic).like(like) | func.lower(DrugBrand.brand).like(like))).all())
        herb_ids = set(db.scalars(select(Herb.id).outerjoin(Herb.synonyms).where(func.lower(HerbSynonym.term).like(like) | func.lower(Herb.hindi_name).like(like) | func.lower(Herb.sanskrit_name).like(like))).all())
        cond = func.lower(Herb.english_name).like(like) | func.lower(Herb.latin_name).like(like) | func.lower(Interaction.drug_class).like(like) | func.lower(Drug.generic).like(like) | func.lower(Interaction.code).like(like)
        if classes:
            cond = cond | Interaction.drug_class.in_(list(classes))
        if herb_ids:
            cond = cond | Interaction.herb_id.in_(list(herb_ids))
        stmt = stmt.outerjoin(Interaction.drug).where(cond)
    total = db.scalar(select(func.count()).select_from(stmt.order_by(None).subquery())) or 0
    rows = db.scalars(stmt.order_by(Interaction.code).limit(limit).offset(offset)).all()
    return InteractionListResponse(total=total, kb_version=get_settings().kb_version, items=[_item(r) for r in rows])


def get_interaction(db: Session, code: str) -> InteractionDetail:
    r = db.scalar(select(Interaction).options(selectinload(Interaction.herb), selectinload(Interaction.drug), selectinload(Interaction.sources)).where(Interaction.code == code))
    if not r:
        raise NotFound("Interaction record not found.", {"code": code})
    base = _item(r).model_dump()
    return InteractionDetail(
        **base, mechanism=r.mechanism, effect=r.effect, management=r.management, population_flags=list(r.population_flags or []), reviewer=r.reviewer,
        patient_summary_en=r.patient_summary_en, patient_summary_hi=r.patient_summary_hi,
        sources=[SourceOut(title=s.title, source_type=s.source_type, doi=s.doi, pmid=s.pmid, url=s.url, year=s.year, verification_status=s.verification_status) for s in r.sources],
    )


def list_herbs(db: Session) -> List[HerbOut]:
    herbs = db.scalars(select(Herb).options(selectinload(Herb.synonyms)).order_by(Herb.english_name)).all()
    return [HerbOut(id=h.id, slug=h.slug, english_name=h.english_name, latin_name=h.latin_name, hindi_name=h.hindi_name, sanskrit_name=h.sanskrit_name, category=h.category, synonyms=sorted({s.term for s in h.synonyms})) for h in herbs]


def list_drugs(db: Session) -> List[DrugOut]:
    drugs = db.scalars(select(Drug).options(selectinload(Drug.brands)).order_by(Drug.generic)).all()
    return [DrugOut(id=d.id, slug=d.slug, generic=d.generic, drug_class=d.drug_class, brands=sorted({b.brand for b in d.brands})) for d in drugs]


def stats(db: Session) -> KBStats:
    return KBStats(
        kb_version=get_settings().kb_version,
        herbs=db.scalar(select(func.count(Herb.id))) or 0,
        drugs=db.scalar(select(func.count(Drug.id))) or 0,
        drug_classes=db.scalar(select(func.count(func.distinct(Drug.drug_class)))) or 0,
        interactions=db.scalar(select(func.count(Interaction.id)).where(Interaction.is_active.is_(True))) or 0,
        sources=db.scalar(select(func.count(InteractionSource.id))) or 0,
        sources_verified=db.scalar(select(func.count(InteractionSource.id)).where(InteractionSource.verification_status == "verified")) or 0,
    )
