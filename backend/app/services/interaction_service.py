"""Deterministic rule engine. THE verdict comes from here and only from here.

Rules (roadmap §3.4 "Verdict logic"), applied per (herb, drug) pair:
  R1  no interaction row, both entities recognised            -> GREEN  ("no known interaction in KB vX")
  R2  severity = minor                                          -> GREEN  (with timing gap if present)
  R3  severity = moderate, or evidence C with mechanism         -> AMBER
  R4  severity = major                                          -> RED
  R5  severity >= moderate AND drug class in HIGH_RISK_CLASSES  -> RED   (escalation)
Overall verdict = max over pairs by RED > AMBER > GREEN; if anything was unrecognised, or there is no
herb or no drug to compare, the overall verdict is GREY (never silently GREEN).

Everything is logged with the KB version so each verdict is reproducible.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List, Optional, Sequence, Set, Tuple

from sqlalchemy import or_, select
from sqlalchemy.orm import Session, selectinload

from app.core.config import get_settings
from app.models.kb import Drug, Herb, Interaction
from app.models.ops import QueryLog
from app.schemas.check import EntityOut, MatchedInteraction, PairStatus, SourceOut
from app.services.normalization_service import drug_out, herb_out

HIGH_RISK_CLASSES: Set[str] = {"immunosuppressant", "anticoagulant", "antiplatelet", "cardiac_glycoside"}
WILDCARD_CLASS = "*"  # rows that apply to every drug of a given route (e.g. bulk laxatives vs any oral medicine)
_RANK = {"GREEN": 0, "AMBER": 1, "RED": 2}

DISCLAIMER = (
    "TakeSure provides safety information and discussion support from published sources. It does not diagnose, "
    "prescribe, or tell you to start or stop any medicine. Decisions belong to you and your doctor."
)


@dataclass
class EngineResult:
    verdict: str
    verdict_reason: str
    pairs: List[PairStatus]
    interactions: List[MatchedInteraction]
    query_id: int


def row_verdict(row: Interaction, drug: Drug) -> Tuple[str, str]:
    """Returns (verdict, rule trace) for a single KB row against the user's drug."""
    sev = row.severity
    if sev == "major":
        return "RED", "R4: severity=major → RED"
    if sev == "moderate" or (row.evidence_grade == "C" and row.interaction_type != "timing"):
        if sev == "moderate" and drug.drug_class in HIGH_RISK_CLASSES and row.interaction_type not in ("timing", "contamination"):
            return "RED", f"R5: severity=moderate, drug class '{drug.drug_class}' is high-risk → escalated to RED"
        base = "R3: severity=moderate → AMBER" if sev == "moderate" else "R3: evidence grade C with plausible mechanism → AMBER"
        return "AMBER", base
    if sev == "minor":
        if row.timing_gap_hours:
            return "GREEN", f"R2: severity=minor, timing gap {row.timing_gap_hours:g} h → GREEN (timing)"
        return "GREEN", "R2: severity=minor → GREEN"
    return "AMBER", f"R3: unrecognised severity '{sev}' treated conservatively → AMBER"


def _source_out(src) -> SourceOut:
    return SourceOut(title=src.title, source_type=src.source_type, doi=src.doi, pmid=src.pmid, url=src.url, year=src.year, verification_status=src.verification_status)


def fetch_rows(db: Session, herbs: Sequence[Herb], drugs: Sequence[Drug]) -> List[Interaction]:
    if not herbs or not drugs:
        return []
    herb_ids = [h.id for h in herbs]
    drug_ids = [d.id for d in drugs]
    classes = list({d.drug_class for d in drugs})
    stmt = (
        select(Interaction)
        .options(selectinload(Interaction.sources), selectinload(Interaction.herb), selectinload(Interaction.drug))
        .where(Interaction.is_active.is_(True), Interaction.herb_id.in_(herb_ids))
        .where(or_(Interaction.drug_id.in_(drug_ids), Interaction.drug_class.in_(classes + [WILDCARD_CLASS])))
    )
    return list(db.scalars(stmt).all())


def evaluate(db: Session, drugs: Sequence[Drug], herbs: Sequence[Herb], unrecognised: Sequence[str], state: Optional[str] = None, source: str = "web") -> EngineResult:
    s = get_settings()
    rows = fetch_rows(db, herbs, drugs)
    # index rows by (herb_id, drug_id) and (herb_id, drug_class)
    by_drug: Dict[Tuple[int, int], List[Interaction]] = {}
    by_class: Dict[Tuple[int, str], List[Interaction]] = {}
    for r in rows:
        if r.drug_id is not None:
            by_drug.setdefault((r.herb_id, r.drug_id), []).append(r)
        if r.drug_class:
            by_class.setdefault((r.herb_id, r.drug_class), []).append(r)

    pairs: List[PairStatus] = []
    matched: List[MatchedInteraction] = []
    overall = "GREEN"
    for h in herbs:
        for d in drugs:
            candidates: List[Tuple[Interaction, str]] = [(r, "drug") for r in by_drug.get((h.id, d.id), [])]
            # A drug-specific row overrides a class row for the same herb only if it exists; otherwise use class rows.
            if not candidates:
                candidates = [(r, "drug_class") for r in by_class.get((h.id, d.drug_class), [])]
            # Wildcard rows (timing with any oral drug, contamination with any long-term therapy) always apply in addition.
            for r in by_class.get((h.id, WILDCARD_CLASS), []):
                if r.interaction_type == "timing" and (d.route or "oral") != "oral":
                    continue
                candidates.append((r, "drug_class"))
            pair_verdict = "GREEN"
            codes: List[str] = []
            for row, how in candidates:
                v, trace = row_verdict(row, d)
                codes.append(row.code)
                if _RANK[v] > _RANK[pair_verdict]:
                    pair_verdict = v
                matched.append(
                    MatchedInteraction(
                        code=row.code, herb=herb_out(h), drug=drug_out(d), matched_by=how, severity=row.severity, verdict=v,
                        interaction_type=row.interaction_type, mechanism=row.mechanism, effect=row.effect, management=row.management,
                        timing_gap_hours=row.timing_gap_hours, evidence_grade=row.evidence_grade, population_flags=list(row.population_flags or []),
                        rule_applied=trace, sources=[_source_out(x) for x in row.sources],
                        patient_summary_en=row.patient_summary_en, patient_summary_hi=row.patient_summary_hi,
                    )
                )
            pairs.append(PairStatus(herb=herb_out(h), drug=drug_out(d), verdict=pair_verdict, interaction_codes=codes))
            if _RANK[pair_verdict] > _RANK[overall]:
                overall = pair_verdict

    _sev = {"major": 2, "moderate": 1, "minor": 0}
    matched.sort(key=lambda m: (-_RANK[m.verdict], -_sev[m.severity], m.evidence_grade, m.code))

    if not herbs or not drugs:
        verdict = "GREY"
        reason = "At least one Ayurvedic herb/product and one allopathic medicine are needed to check a combination."
    elif unrecognised and overall == "GREEN":
        verdict = "GREY"
        reason = f"{len(unrecognised)} item(s) were not found in knowledge base v{s.kb_version}; the recognised pairs have no known interaction. Unverified items are never assumed safe."
    elif unrecognised:
        verdict = overall
        reason = f"Verdict from {len(matched)} matched record(s); note {len(unrecognised)} unrecognised item(s) could not be checked."
    elif overall == "GREEN":
        if any(m.timing_gap_hours for m in matched):
            reason = "Only timing considerations found; keep the stated gap between doses."
        else:
            reason = f"No interaction recorded for these pairs in knowledge base v{s.kb_version}. Absence of a record is not proof of safety - tell your doctor what you take."
        verdict = "GREEN"
    else:
        verdict = overall
        top = [m for m in matched if m.verdict == overall]
        reason = f"{len(top)} record(s) rated {overall} ({top[0].rule_applied})."

    log = QueryLog(herb_ids=[h.id for h in herbs], drug_ids=[d.id for d in drugs], verdict=verdict, matched_interaction_ids=[m.code for m in matched], kb_version=s.kb_version, state=(state or None), source=source)
    db.add(log)
    db.flush()
    return EngineResult(verdict=verdict, verdict_reason=reason, pairs=pairs, interactions=matched, query_id=log.id)
